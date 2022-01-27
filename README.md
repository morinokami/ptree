# ptree

ptree prettifies `tree` command with emojis like this:

```
$ ptree
📁 .
├── 🤖 binary.bin
├── 📄 document.txt
├── 🦏 javascript.js
├── 📝 markdown.md
├── 🐪 perl.pl
├── 🐍 python.py
└── 🦀 rust.rs

0 directory, 7 files
```

## Installation

```sh
$ npm install -g ptree
```

## Usage

* List contents of directories:

```
$ ptree .
.
📁 .
├── 📁 bar
│   └── 📄 baz.ts
└── 📄 foo.js

1 directory, 2 files
```

* Specify the maximum display depth of the directory tree:

```
$ ptree --level 1 .
📁 .
├── 📁 bar
└── 📄 foo.js

1 directory, 1 file
```

* Specify the emojis to show:

```
$ ptree --emojis '{".js": "🦏", ".ts": "🦕"}' .
📁 .
├── 📁 bar
│   └── 🦕 baz.ts
└── 🦏 foo.js

1 directory, 2 files
```

* List only directories:

```
$ ptree --dir .
📁 .
└── 📁 bar

1 directory
```

* List only those files that matches the given pattern:

```
$ ptree --include 'foo*' .
📁 .
├── 📁 bar
└── 📄 foo.js

1 directory, 1 file
```

* List only those files that doesn't match the given pattern:

```
$ ptree --exclude 'foo*' .
📁 .
└── 📁 bar
    └── 📄 baz.ts

1 directory, 1 file
```

* Show help:

```
$ ptree --help
ptree <path> [options]

Options:
      --version  Show version number                                   [boolean]
  -a, --all      Print all files and directories including those starting with a
                  dot                                 [boolean] [default: false]
  -d, --dir      Print only directories               [boolean] [default: false]
  -e, --emojis   Mapping of file extensions to emojis   [string] [default: "{}"]
  -l, --level    Maximum depth to traverse          [number] [default: Infinity]
  -i, --include  Include files matching this pattern                    [string]
  -x, --exclude  Exclude files matching this pattern                    [string]
  -h, --help     Show help                                             [boolean]
```

## Customization

You can specify the emojis to use beforehand by creating a config file named `.ptree.json` in your home folder like this:

```
$ cat ~/.ptree.json 
{
  "emojis": {
    ".js": "🦏",
    ".ts": "🦕"
  }
}
```

Now you don't have to use the option each time:

```
$ ptree .
📁 .
├── 📁 bar
│   └── 🦕 baz.ts
└── 🦏 foo.js

1 directory, 2 files
```
