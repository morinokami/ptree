#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { EmojiMap, ptree } from "./ptree";

const argv = yargs(hideBin(process.argv))
  .usage("ptree <path> [options]")
  .options({
    d: {
      alias: "depth",
      default: Infinity,
      describe: "Maximum depth to traverse",
      type: "number",
    },
    e: {
      alias: "emojis",
      default: "{}",
      describe: "Mapping of file extensions to emojis",
      type: "string",
    },
  })
  .help("h")
  .alias("h", "help")
  .check((argv) => {
    if ((!Number.isInteger(argv.d) && argv.d !== Infinity) || argv.d < 1) {
      throw new Error("Error: depth must be a number");
    }

    try {
      JSON.parse(argv.e);
    } catch (err) {
      throw new Error("Error: emojis must be a valid JSON object");
    }

    return true;
  })
  .string("_")
  .parseSync();

let path = ".";
if (argv._.length > 0) {
  path = String(argv._[0]);
}
const emojis = JSON.parse(argv.e) as EmojiMap;
ptree(path, { emojis, maxDepth: argv.d });
