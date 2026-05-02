import fs from "node:fs/promises";
import path from "node:path";
import { stableId } from "@/lib/utils";

const dataDir = path.join(process.cwd(), ".local-data");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function listJson<T>(collection: string): Promise<T[]> {
  await ensureDir();
  const file = path.join(dataDir, `${collection}.json`);
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T[];
  } catch {
    return [];
  }
}

export async function saveJson<T extends { id?: string }>(collection: string, value: T): Promise<T & { id: string }> {
  await ensureDir();
  const file = path.join(dataDir, `${collection}.json`);
  const all = await listJson<Array<T & { id: string }>[number]>(collection);
  const item = { ...value, id: value.id || stableId(JSON.stringify(value)) };
  const next = [item, ...all.filter((existing) => existing.id !== item.id)];
  await fs.writeFile(file, JSON.stringify(next, null, 2));
  return item;
}
