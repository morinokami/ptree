#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { ptree } from "./ptree";

const argv = yargs(hideBin(process.argv))
  .usage("ptree <path> [options]")
  .options({
    d: {
      alias: "depth",
      default: Infinity,
      describe: "Maximum depth to traverse",
      type: "number",
    },
  })
  .help("h")
  .alias("h", "help")
  .check((argv) => {
    if ((!Number.isInteger(argv.d) && argv.d !== Infinity) || argv.d < 1) {
      throw new Error("depth must be a number");
    }
    return true;
  })
  .string("_")
  .parseSync();

let path = ".";
if (argv._.length > 0) {
  path = String(argv._[0]);
}
ptree(path, { maxDepth: argv.d });
