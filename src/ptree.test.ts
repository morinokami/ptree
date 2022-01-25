/* eslint-disable @typescript-eslint/ban-ts-comment */
import mockFs from "mock-fs";

import { DirEntry, getEmoji, ptree, readDir, report } from "./ptree";

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
    const expected: DirEntry[] = [
      {
        name: "bar.txt",
        isDirectory: false,
        isFile: true,
        isSymLink: false,
      },
      {
        name: "baz",
        isDirectory: true,
        isFile: false,
        isSymLink: false,
      },
      {
        name: "meow",
        isDirectory: false,
        isFile: true,
        isSymLink: false,
      },
    ];
    expect(entries).toEqual(expected);
  });
});

describe("getEmoji", () => {
  it("returns the correct emoji for a specified file extension", () => {
    const extMap = {
      ".txt": "📄",
      ".md": "📝",
      ".ts": "🦕",
    };
    expect(getEmoji(".txt", extMap)).toBe("📄");
    expect(getEmoji(".md", extMap)).toBe("📝");
    expect(getEmoji(".ts", extMap)).toBe("🦕");
    expect(getEmoji(".json", extMap)).toBe("📄");
  });
});

describe("ptree", () => {
  beforeEach(() => {
    process.stdout.write = jest.fn();
    mockFs({
      foo: {
        "bar.ts": "",
        baz: {
          hello: "",
          "goodbye.py": "",
          symlink: mockFs.symlink({ path: "../meow" }),
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
      dirWithDotFiles: {
        ".github": {
          "dependabot.yml": "",
        },
        ".eslintrc.json": "",
        ".prettierrc": "",
        "package.json": "",
      },
    });
    report.numDirs = 0;
    report.numFiles = 0;
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("prints only name if empty directory given", async () => {
    await ptree("emptyDir");
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 emptyDir"],
      ["\n"],
      ["\n0 directories, 0 files\n"],
    ]);
  });

  it("prints tree with emojis", async () => {
    await ptree("foo");
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 foo"],
      ["\n"],
      ["├── 📄 bar.ts"],
      ["\n"],
      ["├── 📁 baz"],
      ["\n"],
      ["│   ├── 📄 goodbye.py"],
      ["\n"],
      ["│   ├── 📄 hello"],
      ["\n"],
      ["│   └── 📄 symlink -> ../meow"],
      ["\n"],
      ["└── 📄 meow"],
      ["\n"],
      ["\n1 directory, 4 files\n"],
    ]);
  });

  it("prints nothing if level < 1", async () => {
    await ptree("foo", { level: 0 });
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([]);
  });

  it("prints only direct children if level = 1", async () => {
    await ptree("foo", { level: 1 });
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 foo"],
      ["\n"],
      ["├── 📄 bar.ts"],
      ["\n"],
      ["├── 📁 baz"],
      ["\n"],
      ["└── 📄 meow"],
      ["\n"],
      ["\n1 directory, 2 files\n"],
    ]);
  });

  it("prints only name if directory is unreadable", async () => {
    await ptree("unreadableDir");
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 unreadableDir"],
      [" [error opening dir]\n"],
    ]);
  });

  it("prints specified emojis", async () => {
    await ptree("foo", { emojis: { ".ts": "🦕", ".py": "🐍" } });
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 foo"],
      ["\n"],
      ["├── 🦕 bar.ts"],
      ["\n"],
      ["├── 📁 baz"],
      ["\n"],
      ["│   ├── 🐍 goodbye.py"],
      ["\n"],
      ["│   ├── 📄 hello"],
      ["\n"],
      ["│   └── 📄 symlink -> ../meow"],
      ["\n"],
      ["└── 📄 meow"],
      ["\n"],
      ["\n1 directory, 4 files\n"],
    ]);
  });

  it("doesn't print dot files by default", async () => {
    await ptree("dirWithDotFiles");
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 dirWithDotFiles"],
      ["\n"],
      ["└── 📄 package.json"],
      ["\n"],
      ["\n0 directories, 1 file\n"],
    ]);
  });

  it("prints dot files if specified", async () => {
    await ptree("dirWithDotFiles", { printAll: true });
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 dirWithDotFiles"],
      ["\n"],
      ["├── 📄 .eslintrc.json"],
      ["\n"],
      ["├── 📁 .github"],
      ["\n"],
      ["│   └── 📄 dependabot.yml"],
      ["\n"],
      ["├── 📄 .prettierrc"],
      ["\n"],
      ["└── 📄 package.json"],
      ["\n"],
      ["\n1 directory, 4 files\n"],
    ]);
  });

  it("prints only directories if specified", async () => {
    await ptree("foo", { dirOnly: true });
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 foo"],
      ["\n"],
      ["└── 📁 baz"],
      ["\n"],
      ["\n1 directory\n"],
    ]);
  });

  it("prints only the directory specified by the include option", async () => {
    await ptree("foo", { include: "me*" });
    expect((process.stdout.write as jest.Mock).mock.calls).toEqual([
      ["📁 foo"],
      ["\n"],
      ["├── 📁 baz"],
      ["\n"],
      ["└── 📄 meow"],
      ["\n"],
      ["\n1 directory, 1 file\n"],
    ]);
  });
});
