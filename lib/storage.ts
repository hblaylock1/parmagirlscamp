import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Registration } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PDF_DIR = path.join(DATA_DIR, "pdfs");
const DB_FILE = path.join(DATA_DIR, "registrations.json");

async function ensureDirs() {
  await fs.mkdir(PDF_DIR, { recursive: true });
}

async function readAll(): Promise<Registration[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw) as Registration[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(rows: Registration[]) {
  await ensureDirs();
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2));
  await fs.rename(tmp, DB_FILE);
}

// The server runs as a single Node process, so chaining every mutation
// through one promise queue is enough to keep concurrent read-modify-write
// cycles on registrations.json from overwriting each other's rows.
let mutationQueue: Promise<void> = Promise.resolve();
function withMutationLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = mutationQueue.then(fn);
  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function listRegistrations(): Promise<Registration[]> {
  return readAll();
}

export async function createRegistration(
  data: Omit<Registration, "id" | "createdAt" | "pdfFile" | "signedAt">,
  pdfBytes: Uint8Array,
): Promise<Registration> {
  await ensureDirs();
  const id = randomUUID();
  const pdfFile = `${id}.pdf`;
  await fs.writeFile(path.join(PDF_DIR, pdfFile), pdfBytes);

  const row: Registration = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    signedAt: new Date().toISOString(),
    pdfFile,
  };
  await withMutationLock(async () => {
    const rows = await readAll();
    rows.push(row);
    await writeAll(rows);
  });
  return row;
}

export async function readPdf(pdfFile: string): Promise<Uint8Array> {
  const safe = path.basename(pdfFile);
  return fs.readFile(path.join(PDF_DIR, safe));
}

export type EditableFields = Omit<
  Registration,
  "id" | "createdAt" | "signedAt" | "pdfFile" | "signatureName"
>;

export async function updateRegistration(
  id: string,
  patch: Partial<EditableFields>,
): Promise<Registration | null> {
  return withMutationLock(async () => {
    const rows = await readAll();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch };
    await writeAll(rows);
    return rows[idx];
  });
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const removed = await withMutationLock(async () => {
    const rows = await readAll();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const [gone] = rows.splice(idx, 1);
    await writeAll(rows);
    return gone ?? null;
  });
  if (removed === null) return false;
  if (removed.pdfFile) {
    const pdfPath = path.join(PDF_DIR, path.basename(removed.pdfFile));
    try {
      await fs.unlink(pdfPath);
    } catch {
      // already gone — fine
    }
  }
  return true;
}
