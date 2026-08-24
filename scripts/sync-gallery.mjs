#!/usr/bin/env node
/**
 * sync-gallery.mjs
 * Downloads images from a Google Drive folder at build time,
 * optimises them with Sharp, and saves to public/assets/gallery/.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env manually (the script runs before Astro)
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

const FOLDER_ID = "1rSvUU1kYcqLe49FQYupoMf0mlwHtKzyu";
const DEST_DIR = path.resolve("public/assets/gallery");
const MAX_WIDTH = 1920;
const QUALITY = 72;
const FORCE = process.argv.includes("--force");

// ── Auth ──────────────────────────────────────────────────────────────
if (!process.env.GOOGLE_CREDENTIAL_BASE64) {
  console.log("⚠  GOOGLE_CREDENTIAL_BASE64 is not set. Skipping gallery sync.");
  process.exit(0);
}

const credsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIAL_BASE64,
  "base64"
).toString("utf-8");
const creds = JSON.parse(credsJson);

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// ── List images ───────────────────────────────────────────────────────
async function listImages() {
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id, name, mimeType, modifiedTime, size)",
    orderBy: "modifiedTime desc",
    pageSize: 200,
  });
  return res.data.files || [];
}

// ── Download & optimise ──────────────────────────────────────────────
async function downloadAndOptimise(file) {
  const ext = path.extname(file.name).toLowerCase();
  const baseName = path.basename(file.name, ext);
  // Use a safe slug for the filename
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const outName = `${safeName}.webp`;
  const outPath = path.join(DEST_DIR, outName);

  // Skip if already exists (and not empty), unless --force
  if (!FORCE && fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
    console.log(`  ⏭  ${file.name} (cached)`);
    return outName;
  }

  console.log(`  ⬇  ${file.name}`);

  const res = await drive.files.get(
    { fileId: file.id, alt: "media" },
    { responseType: "stream" }
  );

  const chunks = [];
  for await (const chunk of res.data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Optimise with Sharp
  // .rotate() without args auto-rotates based on EXIF orientation
  try {
    const metadata = await sharp(buffer).metadata();
    const orient = metadata.orientation;
    if (orient && orient !== 1) {
      console.log(`  🔄  ${file.name}: EXIF orientation=${orient}, rotating`);
    }
    await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF orientation, then strip the tag
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);
  } catch (err) {
    console.warn(`  ⚠  Could not optimise ${file.name}, saving raw: ${err.message}`);
    fs.writeFileSync(outPath, buffer);
  }

  return outName;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🖼  Syncing gallery from Google Drive…${FORCE ? " (forced re-download)" : ""}`);

  if (!process.env.GOOGLE_CREDENTIAL_BASE64) {
    console.error("❌  GOOGLE_CREDENTIAL_BASE64 is not set. Skipping gallery sync.");
    process.exit(0); // Don't fail the build, just skip
  }

  // Ensure dest dir exists
  fs.mkdirSync(DEST_DIR, { recursive: true });

  const files = await listImages();
  if (!files.length) {
    console.log("  No images found in Drive folder.");
    return;
  }

  console.log(`  Found ${files.length} image(s).`);

  const manifest = [];
  for (const file of files) {
    const name = await downloadAndOptimise(file);
    manifest.push({
      src: `/assets/gallery/${name}`,
      alt: path.basename(file.name, path.extname(file.name)),
      modifiedTime: file.modifiedTime,
    });
  }

  // Write a manifest JSON for the gallery page to import
  const manifestPath = path.join(DEST_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅  Gallery synced: ${manifest.length} images → src/assets/gallery/`);
}

main().catch((err) => {
  console.error("❌  Gallery sync failed:", err.message);
  process.exit(1);
});
