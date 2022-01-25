#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { EmojiMap, ptree } from "./ptree";

const argv = yargs(hideBin(process.argv))
  .usage("ptree <path> [options]")
  .options({
    a: {
      alias: "all",
      default: false,
      describe:
        "Print all files and directories including those starting with a dot",
      type: "boolean",
    },
    d: {
      alias: "dir",
      default: false,
      describe: "Print only directories",
      type: "boolean",
    },
    e: {
      alias: "emojis",
      default: "{}",
      describe: "Mapping of file extensions to emojis",
      type: "string",
    },
    l: {
      alias: "level",
      default: Infinity,
      describe: "Maximum depth to traverse",
      type: "number",
    },
    i: {
      alias: "include",
      default: undefined,
      describe: "Include files matching this pattern",
      type: "string",
    },
    x: {
      alias: "exclude",
      default: undefined,
      describe: "Exclude files matching this pattern",
      type: "string",
    },
  })
  .help("h")
  .alias("h", "help")
  .check((argv) => {
    if ((!Number.isInteger(argv.l) && argv.l !== Infinity) || argv.l < 1) {
      throw new Error("Error: level must be a number");
    }

    try {
      JSON.parse(argv.e);
    } catch {
      throw new Error("Error: emojis must be a valid JSON object");
    }

    return true;
  })
  .string("_")
  .parseSync();

let root = ".";
if (argv._.length > 0) {
  root = String(argv._[0]);
}

let configData = "{}";
let emojis = {} as EmojiMap;
try {
  const homedir = os.homedir();
  configData = fs.readFileSync(path.join(homedir, ".ptree.json"), "utf8");
} catch {
  // ignore
}
try {
  const config = JSON.parse(configData);
  emojis = config.emojis ?? {};
} catch {
  console.error("Error: Failed to parse config file");
  process.exit(1);
}
emojis = { ...emojis, ...JSON.parse(argv.e) };

ptree(root, {
  printAll: argv.a,
  dirOnly: argv.d,
  level: argv.l,
  emojis,
  include: argv.i,
  exclude: argv.x,
});
