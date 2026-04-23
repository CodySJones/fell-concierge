import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { AppState, ClientBundle, IntakeFileType, IntakeUpload, MeasurementsStatus, ScanStatus } from "../types.ts";

const storageRoot = process.env.STORAGE_ROOT ? resolve(process.env.STORAGE_ROOT) : process.cwd();
const uploadsRoot = join(storageRoot, "uploads");

const ensureClientUploadDir = (clientId: string) => {
  const dir = join(uploadsRoot, clientId);
  mkdirSync(dir, { recursive: true });
  return dir;
};

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const saveUploadedFile = (
  state: AppState,
  input: {
    clientId: string;
    intakeType: IntakeFileType;
    originalName: string;
    mimeType: string;
    base64Data: string;
    note?: string;
  }
): IntakeUpload => {
  const clientDir = ensureClientUploadDir(input.clientId);
  const extension = extname(input.originalName) || "";
  const storedName = `${input.intakeType.toLowerCase()}_${randomUUID()}${extension}`;
  const binary = Buffer.from(input.base64Data, "base64");
  writeFileSync(join(clientDir, storedName), binary);

  const upload: IntakeUpload = {
    id: randomUUID(),
    client_id: input.clientId,
    intake_type: input.intakeType,
    original_name: sanitizeFileName(input.originalName),
    stored_name: storedName,
    mime_type: input.mimeType || "application/octet-stream",
    byte_size: binary.byteLength,
    uploaded_at: new Date().toISOString(),
    note: input.note ?? ""
  };

  state.intakeUploads.push(upload);
  return upload;
};

export const getUploadsByType = (bundle: ClientBundle, intakeType: IntakeFileType) =>
  bundle.intakeUploads.filter((upload) => upload.intake_type === intakeType);

export const deriveReadinessFromUploads = (bundle: ClientBundle): { scanStatus: ScanStatus; measurementsStatus: MeasurementsStatus } => {
  const scanCount = getUploadsByType(bundle, "SCAN_FILE").length;
  const measurementCount = getUploadsByType(bundle, "MEASUREMENTS_FILE").length;

  return {
    scanStatus: scanCount > 0 ? "RECEIVED" : "NOT_REQUESTED",
    measurementsStatus: measurementCount > 0 ? "RECEIVED" : "MISSING"
  };
};

export const syncProjectReadinessFromUploads = (bundle: ClientBundle) => {
  if (!bundle.project) {
    return;
  }
  const derived = deriveReadinessFromUploads(bundle);
  bundle.project.scan_status = derived.scanStatus;
  bundle.project.measurements_status = derived.measurementsStatus;
};
