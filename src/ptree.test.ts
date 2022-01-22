/* eslint-disable @typescript-eslint/ban-ts-comment */
import mockConsole, { RestoreConsole } from "jest-mock-console";
import mockFs from "mock-fs";

import { ptree, readDir } from "./ptree";

describe("readDir", () => {
  beforeEach(() => {
    mockFs({
      foo: {
        "bar.txt": "",
        baz: {
          hello: "",
        },
        meow: "",
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("returns dirEntries", async () => {
    const entries = await readDir("foo");
    const expected = [
      {
        name: "bar.txt",
        isDirectory: false,
      },
      {
        name: "baz",
        isDirectory: true,
      },
      {
        name: "meow",
        isDirectory: false,
      },
    ];
    expect(entries).toEqual(expected);
  });
});

describe("ptree", () => {
  let restoreConsole: RestoreConsole;
  beforeEach(() => {
    restoreConsole = mockConsole();
    mockFs({
      foo: {
        "bar.txt": "",
        baz: {
          hello: "",
        },
        meow: "",
      },
      emptyDir: {},
    });
  });

  afterEach(() => {
    restoreConsole();
    mockFs.restore();
  });

  it("prints only name if empty directory given", async () => {
    await ptree("emptyDir");
    // @ts-ignore
    expect(console.log.mock.calls).toEqual([["emptyDir"]]);
  });

  it("prints tree with emojis", async () => {
    await ptree("foo");
    // @ts-ignore
    expect(console.log.mock.calls).toEqual([
      ["foo"],
      ["├── 📄 bar.txt"],
      ["├── 📁 baz"],
      ["│   └── 📄 hello"],
      ["└── 📄 meow"],
    ]);
  });

  it("prints nothing if depth < 1", async () => {
    await ptree("foo", { maxDepth: 0 });
    // @ts-ignore
    expect(console.log.mock.calls).toEqual([]);
  });

  it("prints only direct children if depth = 1", async () => {
    await ptree("foo", { maxDepth: 1 });
    // @ts-ignore
    expect(console.log.mock.calls).toEqual([
      ["foo"],
      ["├── 📄 bar.txt"],
      ["├── 📁 baz"],
      ["└── 📄 meow"],
    ]);
  });
});
