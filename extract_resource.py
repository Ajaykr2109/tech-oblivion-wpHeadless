import os

# root folder of your project (where app/, src/, scripts/ live)
ROOT = "."

# only look in these dirs
TARGET_DIRS = ["app", "src", "scripts"]

# output file
OUTPUT_FILE = "lint_targets.txt"


def collect_ts_files():
    files = []
    for d in TARGET_DIRS:
        base = os.path.join(ROOT, d)
        for root, _, fns in os.walk(base):
            for fn in fns:
                if fn.endswith((".ts", ".tsx")):
                    path = os.path.join(root, fn)
                    files.append(path)
    return files


def dump_sources(files, out_file):
    with open(out_file, "w", encoding="utf-8") as f:
        for path in files:
            rel_path = os.path.relpath(path, ROOT)
            f.write(f"// ==== FILE: {rel_path} ====\n")
            with open(path, "r", encoding="utf-8") as src:
                f.write(src.read())
            f.write("\n\n")


if __name__ == "__main__":
    files = collect_ts_files()
    dump_sources(files, OUTPUT_FILE)
    print(f"✅ Dumped {len(files)} files into {OUTPUT_FILE}")
