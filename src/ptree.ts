import { lstat, readdir } from "fs/promises";
import { extname, join } from "path";

export interface PTreeOptions {
  emojis?: EmojiMap;
  dirOnly?: boolean;
  level?: number;
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
  {
    emojis = {},
    dirOnly = false,
    level = Infinity,
    printAll = false,
  }: PTreeOptions = {},
  indent = ""
): Promise<void> {
  if (level < 1) {
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

  if (!printAll) {
    entries = entries.filter((entry) => !entry.name.startsWith("."));
  }
  if (dirOnly) {
    entries = entries.filter((entry) => entry.isDirectory);
  }

  for await (const entry of entries) {
    const isLast = entries.indexOf(entry) === entries.length - 1;

    if (entry.isDirectory) {
      report.numDirs++;
    } else if (entry.isFile) {
      report.numFiles++;
    }

    const branch = isLast ? "└── " : "├── ";
    const emoji = entry.isDirectory
      ? "📁"
      : getEmoji(extname(entry.name), emojis);
    process.stdout.write(`${indent}${branch}${emoji} ${entry.name}`);

    if (entry.isDirectory && level > 1) {
      const path = join(root, entry.name);
      const bar = isLast ? "" : "│";
      await ptree(
        path,
        { emojis, dirOnly, level: level - 1 },
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
          report.numDirs > 1 ? "directories" : "directory"
        }\n`
      );
    } else {
      process.stdout.write(
        `\n${report.numDirs} ${
          report.numDirs > 1 ? "directories" : "directory"
        }, ${report.numFiles} ${report.numFiles > 1 ? "files" : "file"}\n`
      );
    }
  }
}
