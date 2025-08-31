import os

ROOT = "."
INPUT_FILE = "lint_targets_fixed.txt"


def restore_sources():
    current_file = None
    buffer = []

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("// ==== FILE: "):
                if current_file and buffer:
                    write_file(current_file, buffer)
                current_file = line.strip().replace("// ==== FILE: ", "")
                buffer = []
            else:
                buffer.append(line)

        # final file
        if current_file and buffer:
            write_file(current_file, buffer)


def write_file(rel_path, lines):
    out_path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"✔ Restored {rel_path}")


if __name__ == "__main__":
    restore_sources()
    print("✅ Restore complete")
