import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const FALLBACK_PATH = path.resolve("src/data/donations.json");
const SPLEIS_DONORS_PATH = path.resolve("src/data/spleis-donors.json");

export interface DonorEntry {
  name: string;
  amountSats: number;
  message?: string;
  timestamp: string;
  source: "spleis" | "vipps";
}

export interface DonationData {
  /** Total raised = Spleis baseline + Vipps payments */
  totalRaisedSats: number;
  /** Historical amount from Spleis fundraiser */
  baselineSats: number;
  /** Live amount from Vipps ePayment API */
  vippsSats: number;
  /** Combined donor list sorted by amount descending (top) */
  topDonors: DonorEntry[];
  /** Combined donor list sorted by timestamp descending (recent) */
  recentDonors: DonorEntry[];
  lastUpdated: string | null;
}

let cached: DonationData | null = null;

/**
 * Format a sats/øre amount to a display string like "145 320 kr".
 */
export function formatKr(sats: number): string {
  const nok = sats / 100;
  return nok.toLocaleString("nb-NO") + " kr";
}

function loadJson<T>(filePath: string): T | null {
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf-8")) as T;
    }
  } catch {
    // corrupt or missing — handled by caller
  }
  return null;
}

/**
 * Spleis donor entries: { name, amountKr (whole NOK), message?, timestamp }
 */
interface SpleisDonorJson {
  name: string;
  amountKr: number;
  message?: string;
  /** ISO timestamp. Optional — entries without one sink to bottom of recent list. */
  timestamp?: string;
}

function loadSpleisDonors() {
  const raw = loadJson<SpleisDonorJson[]>(SPLEIS_DONORS_PATH);
  if (!raw || raw.length === 0) return null;

  const donors: DonorEntry[] = raw.map((d) => ({
    name: d.name,
    amountSats: d.amountKr * 100,
    message: d.message,
    timestamp: d.timestamp ?? "2000-01-01T00:00:00Z",
    source: "spleis" as const,
  }));

  const total = donors.reduce((sum, d) => sum + d.amountSats, 0);
  return { donors, total };
}

function loadFallbackBaseline(): number {
  const data = loadJson<{ baselineSats: number }>(FALLBACK_PATH);
  return data?.baselineSats ?? 0;
}

function buildDonationData(args: {
  spleisDonors: DonorEntry[];
  baselineSats: number;
  vippsDonors: DonorEntry[];
  vippsSats: number;
  lastUpdated: string | null;
}): DonationData {
  const allDonors = [...args.spleisDonors, ...args.vippsDonors];

  const topDonors = [...allDonors].sort(
    (a, b) => b.amountSats - a.amountSats,
  );

  const recentDonors = [...args.vippsDonors].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return {
    totalRaisedSats: args.baselineSats + args.vippsSats,
    baselineSats: args.baselineSats,
    vippsSats: args.vippsSats,
    topDonors,
    recentDonors,
    lastUpdated: args.lastUpdated,
  };
}

/**
 * Fetch donation data from Vipps ePayment API.
 *
 * Credentials are read from environment variables (VIPPS_CLIENT_ID,
 * VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN).
 *
 * Spleis historical donor data is loaded from src/data/spleis-donors.json.
 * When Vipps credentials are present and the API succeeds, payment entries
 * are added as anonymous donor records.
 *
 * Module-level cache prevents duplicate API calls during Astro build.
 */
export async function fetchDonationData(): Promise<DonationData> {
  if (cached) return cached;

  // Load Spleis data
  const spleis = loadSpleisDonors();
  const spleisDonors: DonorEntry[] = spleis?.donors ?? [];
  const baselineSats = spleis?.total ?? loadFallbackBaseline();

  const clientId = process.env.VIPPS_CLIENT_ID;
  const clientSecret = process.env.VIPPS_CLIENT_SECRET;
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
  const msn = process.env.VIPPS_MSN;

  if (!clientId || !clientSecret || !subscriptionKey || !msn) {
    console.warn(
      "[vipps] Missing Vipps credentials. Using Spleis data only.",
    );
    cached = buildDonationData({
      spleisDonors,
      baselineSats,
      vippsDonors: [],
      vippsSats: 0,
      lastUpdated: null,
    });
    return cached;
  }

  try {
    // 1. Obtain access token
    const tokenRes = await fetch("https://api.vipps.no/accesstoken/get", {
      method: "POST",
      headers: {
        "client_id": clientId,
        "client_secret": clientSecret,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    });

    if (!tokenRes.ok) {
      throw new Error(`Vipps token request failed (${tokenRes.status})`);
    }

    const { access_token } = (await tokenRes.json()) as { access_token: string };

    // 2. Fetch all payments (paginated)
    interface VippsPayment {
      state: string;
      amount?: { value: number };
      aggregate?: { capturedAmount?: { value: number } };
      created?: string;
    }

    const vippsDonors: DonorEntry[] = [];
    let vippsSats = 0;
    let url: string | null =
      "https://api.vipps.no/epayment/v1/payments?$top=100";

    while (url) {
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Merchant-Serial-Number": msn,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        throw new Error(`Vipps payments request failed (${resp.status})`);
      }

      const body = (await resp.json()) as {
        data?: VippsPayment[];
        paging?: { next?: string };
      };

      for (const p of body.data ?? []) {
        if (p.state === "CAPTURED") {
          const amount =
            p.aggregate?.capturedAmount?.value ?? p.amount?.value ?? 0;
          vippsSats += amount;
          vippsDonors.push({
            name: "Anonymous",
            amountSats: amount,
            timestamp: p.created ?? new Date().toISOString(),
            source: "vipps",
          });
        }
      }

      url = body.paging?.next ?? null;
    }

    cached = buildDonationData({
      spleisDonors,
      baselineSats,
      vippsDonors,
      vippsSats,
      lastUpdated: new Date().toISOString(),
    });
    return cached;
  } catch (err) {
    console.warn("[vipps] API error, using Spleis data only:", err);
    cached = buildDonationData({
      spleisDonors,
      baselineSats,
      vippsDonors: [],
      vippsSats: 0,
      lastUpdated: null,
    });
    return cached;
  }
}
