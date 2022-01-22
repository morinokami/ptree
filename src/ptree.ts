import { lstat, readdir } from "fs/promises";
import { join } from "path";

export interface PTreeOptions {
  maxDepth?: number;
}

export interface DirEntry {
  isDirectory: boolean;
  // isFile: boolean;
  // isSymlink: boolean;
  name: string;
}

export async function readDir(path: string): Promise<DirEntry[]> {
  const entries: DirEntry[] = [];

  for (const name of await readdir(path)) {
    const stat = await lstat(join(path, name));
    entries.push({ name, isDirectory: stat.isDirectory() });
  }

  return entries;
}

export async function ptree(
  root: string,
  { maxDepth = Infinity }: PTreeOptions = {},
  indent = ""
): Promise<void> {
  if (maxDepth < 1) {
    return;
  }

  if (indent.length === 0) {
    process.stdout.write(`📁 ${root}`);
  }

  let entries: DirEntry[] = [];
  try {
    entries = await readDir(root);
  } catch (err) {
    process.stdout.write(" [error opening dir]\n");
    return;
  }
  process.stdout.write("\n");

  for await (const entry of entries) {
    const branch = entry === entries[entries.length - 1] ? "└── " : "├── ";
    const emoji = entry.isDirectory ? "📁" : "📄";
    process.stdout.write(`${indent}${branch}${emoji} ${entry.name}`);

    if (entry.isDirectory && maxDepth > 1) {
      const path = join(root, entry.name);
      await ptree(path, { maxDepth: maxDepth - 1 }, `${indent}│   `);
    } else {
      process.stdout.write("\n");
    }
  }
}
