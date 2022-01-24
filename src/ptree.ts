import { lstat, readdir } from "fs/promises";
import { extname, join } from "path";

export interface PTreeOptions {
  emojis?: EmojiMap;
  maxDepth?: number;
  printAll?: boolean;
}

export interface EmojiMap {
  [ext: string]: string;
}

export interface DirEntry {
  isDirectory: boolean;
  isFile: boolean;
  // isSymlink: boolean;
  name: string;
}

export const report = {
  numDirs: 0,
  numFiles: 0,
};

export async function readDir(path: string): Promise<DirEntry[]> {
  const entries: DirEntry[] = [];

  for (const name of await readdir(path)) {
    const stat = await lstat(join(path, name));
    entries.push({
      name,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
    });
  }

  return entries;
}

export function getEmoji(ext: string, emojis: EmojiMap): string {
  return emojis[ext] || "📄";
}

export async function ptree(
  root: string,
  { emojis = {}, maxDepth = Infinity, printAll = false }: PTreeOptions = {},
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
    if (entry.name.startsWith(".") && !printAll) {
      continue;
    }

    if (entry.isDirectory) {
      report.numDirs++;
    } else if (entry.isFile) {
      report.numFiles++;
    }

    const branch = entry === entries[entries.length - 1] ? "└── " : "├── ";
    const emoji = entry.isDirectory
      ? "📁"
      : getEmoji(extname(entry.name), emojis);
    process.stdout.write(`${indent}${branch}${emoji} ${entry.name}`);

    if (entry.isDirectory && maxDepth > 1) {
      const path = join(root, entry.name);
      await ptree(path, { emojis, maxDepth: maxDepth - 1 }, `${indent}│   `);
    } else {
      process.stdout.write("\n");
    }
  }

  if (indent.length === 0) {
    process.stdout.write(
      `\n${report.numDirs} ${
        report.numDirs > 1 ? "directories" : "directory"
      }, ${report.numFiles} ${report.numFiles > 1 ? "files" : "file"}\n`
    );
  }
}
