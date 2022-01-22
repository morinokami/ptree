/* eslint-disable @typescript-eslint/ban-ts-comment */
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
  beforeEach(() => {
    process.stdout.write = jest.fn();
    mockFs({
      foo: {
        "bar.txt": "",
        baz: {
          hello: "",
        },
        meow: "",
      },
      emptyDir: {},
      unreadableDir: mockFs.directory({
        mode: 0,
        items: {
          "unreadable.txt": "",
        },
      }),
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("prints only name if empty directory given", async () => {
    await ptree("emptyDir");
    // @ts-ignore
    expect(process.stdout.write.mock.calls).toEqual([["emptyDir"], ["\n"]]);
  });

  it("prints tree with emojis", async () => {
    await ptree("foo");
    // @ts-ignore
    expect(process.stdout.write.mock.calls).toEqual([
      ["foo"],
      ["\n"],
      ["├── 📄 bar.txt"],
      ["\n"],
      ["├── 📁 baz"],
      ["\n"],
      ["│   └── 📄 hello"],
      ["\n"],
      ["└── 📄 meow"],
      ["\n"],
    ]);
  });

  it("prints nothing if depth < 1", async () => {
    await ptree("foo", { maxDepth: 0 });
    // @ts-ignore
    expect(process.stdout.write.mock.calls).toEqual([]);
  });

  it("prints only direct children if depth = 1", async () => {
    await ptree("foo", { maxDepth: 1 });
    // @ts-ignore
    expect(process.stdout.write.mock.calls).toEqual([
      ["foo"],
      ["\n"],
      ["├── 📄 bar.txt"],
      ["\n"],
      ["├── 📁 baz"],
      ["\n"],
      ["└── 📄 meow"],
      ["\n"],
    ]);
  });

  it("prints only name if directory is unreadable", async () => {
    await ptree("unreadableDir");
    // @ts-ignore
    expect(process.stdout.write.mock.calls).toEqual([
      ["unreadableDir"],
      [" [error opening dir]\n"],
    ]);
  });
});
