import { lstat, readdir, readlink } from "fs/promises";
import { extname, join } from "path";

import { isMatch } from "picomatch";

const EMOJI_DIR = "📁";
const EMOJI_FILE = "📄";

export interface PTreeOptions {
  emojis?: EmojiMap;
  dirOnly?: boolean;
  level?: number;
  printAll?: boolean;
  include?: string;
  exclude?: string;
}

export interface EmojiMap {
  [ext: string]: string;
}

export interface DirEntry {
  isDirectory: boolean;
  isFile: boolean;
  isSymLink: boolean;
  name: string;
}

export const report = {
  numDirs: 0,
  numFiles: 0,
};

export async function readDir(path: string): Promise<DirEntry[]> {
  const entries: DirEntry[] = [];

  for (const name of await readdir(path)) {
    const stats = await lstat(join(path, name));
    entries.push({
      name,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      isSymLink: stats.isSymbolicLink(),
    });
  }

  return entries;
}

export function getEmoji(ext: string, emojis: EmojiMap): string {
  return emojis[ext] || EMOJI_FILE;
}

export function filterEntries(
  entries: DirEntry[],
  {
    printAll = false,
    dirOnly = false,
    include,
    exclude,
  }: {
    printAll?: boolean;
    dirOnly?: boolean;
    include?: string;
    exclude?: string;
  }
): DirEntry[] {
  if (!printAll) {
    entries = entries.filter((entry) => !entry.name.startsWith("."));
  }
  if (dirOnly) {
    entries = entries.filter((entry) => entry.isDirectory);
  }
  if (include) {
    entries = entries.filter(
      (entry) => entry.isDirectory || isMatch(entry.name, include)
    );
  }
  if (exclude) {
    entries = entries.filter(
      (entry) => entry.isDirectory || !isMatch(entry.name, exclude)
    );
  }
  return entries;
}

export async function ptree(
  root: string,
  {
    emojis = {},
    dirOnly = false,
    level = Infinity,
    printAll = false,
    include = undefined,
    exclude = undefined,
  }: PTreeOptions = {},
  indent = ""
): Promise<void> {
  if (level < 1) {
    return;
  }

  if (indent.length === 0) {
    process.stdout.write(`${EMOJI_DIR} ${root}`);
  }

  let entries: DirEntry[] = [];
  try {
    entries = await readDir(root);
  } catch (err) {
    process.stdout.write(" [error opening dir]\n");
    return;
  }
  process.stdout.write("\n");

  entries = filterEntries(entries, { printAll, dirOnly, include, exclude });

  for await (const entry of entries) {
    const path = join(root, entry.name);
    const isLast = entries.indexOf(entry) === entries.length - 1;

    if (entry.isDirectory) {
      report.numDirs++;
    } else if (entry.isFile || entry.isSymLink) {
      report.numFiles++;
    }

    const branch = isLast ? "└── " : "├── ";
    const emoji = entry.isDirectory
      ? EMOJI_DIR
      : getEmoji(extname(entry.name), emojis);
    const name = entry.isSymLink
      ? `${entry.name} -> ${await readlink(path)}`
      : entry.name;
    process.stdout.write(`${indent}${branch}${emoji} ${name}`);

    if (entry.isDirectory && level > 1) {
      const bar = isLast ? " " : "│";
      await ptree(
        path,
        { emojis, dirOnly, level: level - 1, printAll, include, exclude },
        `${indent}${bar}   `
      );
    } else {
      process.stdout.write("\n");
    }
  }

  if (indent.length === 0) {
    if (dirOnly) {
      process.stdout.write(
        `\n${report.numDirs} ${
          report.numDirs === 1 ? "directory" : "directories"
        }\n`
      );
    } else {
      process.stdout.write(
        `\n${report.numDirs} ${
          report.numDirs === 1 ? "directory" : "directories"
        }, ${report.numFiles} ${report.numFiles === 1 ? "file" : "files"}\n`
      );
    }
  }
}
