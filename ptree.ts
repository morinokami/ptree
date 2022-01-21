import { join } from "https://deno.land/std@0.122.0/path/mod.ts";

interface PTreeOptions {
  maxDepth?: number;
}

async function ptree(
  root: string,
  { maxDepth = Infinity }: PTreeOptions = {},
  indent = "",
): Promise<void> {
  if (maxDepth < 1) {
    return;
  }

  const entries: Deno.DirEntry[] = [];
  for await (const entry of Deno.readDir(root)) {
    entries.push({ ...entry });
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

await ptree(".", { maxDepth: 2 });
