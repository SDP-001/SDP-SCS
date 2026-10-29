import crypto from "crypto";
import { getDB } from "@/lib/db/store";
import { CertificateFile } from "@/types/database.types";
import { createAdminSupabaseClient } from "@/lib/auth/supabase-server";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCertificateFile(file: {
  size: number;
  type: string;
}): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format (${file.type}). Allowed formats: PDF, JPG, JPEG, PNG`,
    };
  }

  return { valid: true };
}

export function calculateSHA256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function checkForDuplicateHash(hash: string): {
  isDuplicate: boolean;
  existingFile?: CertificateFile;
} {
  const db = getDB();
  const existing = db.certificateFiles.find((f) => f.file_hash === hash);
  if (existing) {
    return { isDuplicate: true, existingFile: existing };
  }
  return { isDuplicate: false };
}

/**
 * Generate a short-lived signed URL (default 60 seconds)
 * Ensures private storage access compliance.
 */
export async function generateSignedUrl(
  storagePath: string,
  expiresInSeconds = 60
): Promise<string> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      // Return a secure proxy URL if Supabase bucket is offline or not active
      return `/api/files/download?path=${encodeURIComponent(storagePath)}&expires=${Date.now() + expiresInSeconds * 1000}`;
    }

    return data.signedUrl;
  } catch {
    return `/api/files/download?path=${encodeURIComponent(storagePath)}&expires=${Date.now() + expiresInSeconds * 1000}`;
  }
}

export interface StoredCertificateFile {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __CAMPUSCRED_FILE_STORE: Map<string, StoredCertificateFile> | undefined;
}

function getFileStoreMap(): Map<string, StoredCertificateFile> {
  if (!globalThis.__CAMPUSCRED_FILE_STORE) {
    globalThis.__CAMPUSCRED_FILE_STORE = new Map<string, StoredCertificateFile>();
  }
  return globalThis.__CAMPUSCRED_FILE_STORE;
}

export function saveCertificateFile(
  storagePath: string,
  buffer: Buffer,
  mimeType: string,
  filename: string
): void {
  const store = getFileStoreMap();
  const fileObj: StoredCertificateFile = { buffer, mimeType, filename };
  store.set(storagePath, fileObj);
  store.set(filename, fileObj);

  // Also write to local storage directory on disk
  try {
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(process.cwd(), ".data", "uploads");
    const fullPath = path.join(uploadsDir, storagePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
  } catch (err) {
    console.error("Failed to write certificate file to disk:", err);
  }
}

export function getCertificateFile(storagePath: string): StoredCertificateFile | null {
  const store = getFileStoreMap();
  if (store.has(storagePath)) {
    return store.get(storagePath)!;
  }

  const path = require("path");
  const filename = path.basename(storagePath);
  if (store.has(filename)) {
    return store.get(filename)!;
  }

  // Check if available on disk
  try {
    const fs = require("fs");
    const uploadsDir = path.join(process.cwd(), ".data", "uploads");
    const fullPath = path.join(uploadsDir, storagePath);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const ext = path.extname(storagePath).toLowerCase();
      let mimeType = "application/octet-stream";
      if (ext === ".pdf") mimeType = "application/pdf";
      else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".png") mimeType = "image/png";
      else if (ext === ".webp") mimeType = "image/webp";
      else if (ext === ".svg") mimeType = "image/svg+xml";

      const fileObj: StoredCertificateFile = { buffer, mimeType, filename };
      store.set(storagePath, fileObj);
      return fileObj;
    }
  } catch (err) {
    console.error("Failed to read certificate file from disk:", err);
  }

  return null;
}
