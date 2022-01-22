import { lstat, readdir } from "fs/promises";
import { join } from "path";

interface PTreeOptions {
  maxDepth?: number;
}

interface DirEntry {
  isDirectory: boolean;
  // isFile: boolean;
  // isSymlink: boolean;
  name: string;
}

async function ptree(
  root: string,
  { maxDepth = Infinity }: PTreeOptions = {},
  indent = ""
): Promise<void> {
  if (maxDepth < 1) {
    return;
  }

  const entries: DirEntry[] = [];
  for (const name of await readdir(root)) {
    const stat = await lstat(join(root, name));
    entries.push({ name, isDirectory: stat.isDirectory() });
  }

  if (indent === "") {
    console.log(`${root}`);
  }
  for await (const entry of entries) {
    const branch = entry === entries[entries.length - 1] ? "└── " : "├── ";
    const emoji = entry.isDirectory ? "📁" : "📄";
    console.log(`${indent}${branch}${emoji} ${entry.name}`);

    if (entry.isDirectory) {
      const path = join(root, entry.name);
      await ptree(path, { maxDepth: maxDepth - 1 }, `${indent}│   `);
    }
  }
}

ptree(".", { maxDepth: 2 });
