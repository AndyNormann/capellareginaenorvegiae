import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const FALLBACK_PATH = path.resolve("src/data/donations.json");

export interface DonationData {
  /** Total raised = Spleis baseline + Vipps payments */
  totalRaisedSats: number;
  /** Historical amount from Spleis fundraiser (413,800 kr) */
  baselineSats: number;
  /** Live amount from Vipps ePayment API */
  vippsSats: number;
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

function loadFallback(): { baselineSats: number; lastUpdated: string | null } {
  if (existsSync(FALLBACK_PATH)) {
    try {
      return JSON.parse(readFileSync(FALLBACK_PATH, "utf-8")) as {
        baselineSats: number;
        lastUpdated: string | null;
      };
    } catch {
      // corrupt file — treat as empty
    }
  }
  return { baselineSats: 0, lastUpdated: null };
}

/**
 * Fetch donation data from Vipps ePayment API.
 *
 * Credentials are read from environment variables (VIPPS_CLIENT_ID,
 * VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN).
 *
 * Always includes the Spleis historical baseline from
 * src/data/donations.json. When credentials are present and the API
 * succeeds, the Vipps payment total is added on top.
 *
 * Module-level cache prevents duplicate API calls during Astro build.
 */
export async function fetchDonationData(): Promise<DonationData> {
  if (cached) return cached;

  const fallback = loadFallback();

  const clientId = process.env.VIPPS_CLIENT_ID;
  const clientSecret = process.env.VIPPS_CLIENT_SECRET;
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
  const msn = process.env.VIPPS_MSN;

  if (!clientId || !clientSecret || !subscriptionKey || !msn) {
    console.warn(
      "[vipps] Missing Vipps credentials. Using Spleis baseline only.",
    );
    cached = {
      totalRaisedSats: fallback.baselineSats,
      baselineSats: fallback.baselineSats,
      vippsSats: 0,
      lastUpdated: fallback.lastUpdated,
    };
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

    // 2. Fetch all payments (paginated) and sum captured amounts
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
        data?: Array<{
          state: string;
          amount?: { value: number };
          aggregate?: { capturedAmount?: { value: number } };
        }>;
        paging?: { next?: string };
      };

      for (const p of body.data ?? []) {
        if (p.state === "CAPTURED") {
          vippsSats +=
            p.aggregate?.capturedAmount?.value ?? p.amount?.value ?? 0;
        }
      }

      url = body.paging?.next ?? null;
    }

    cached = {
      totalRaisedSats: fallback.baselineSats + vippsSats,
      baselineSats: fallback.baselineSats,
      vippsSats,
      lastUpdated: new Date().toISOString(),
    };
    return cached;
  } catch (err) {
    console.warn("[vipps] API error, using Spleis baseline only:", err);
    cached = {
      totalRaisedSats: fallback.baselineSats,
      baselineSats: fallback.baselineSats,
      vippsSats: 0,
      lastUpdated: fallback.lastUpdated,
    };
    return cached;
  }
}
