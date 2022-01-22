import mockConsole, { RestoreConsole } from "jest-mock-console";
import mockFs from "mock-fs";

import { readDir } from "./ptree";

describe("readDir", () => {
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
    });
  });

  afterEach(() => {
    restoreConsole();
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
