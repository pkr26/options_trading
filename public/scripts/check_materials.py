"""Check local links in the Markdown curriculum; no network requests are made."""

from pathlib import Path
import os
import re
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
MARKDOWN_LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
EXCLUDED_DIRECTORIES = {"node_modules", ".git", ".next", ".wrangler", ".venv", "venv", "dist", "build", "__pycache__"}


def curriculum_files(root: Path) -> list[Path]:
    """Prune generated/dependency directories before traversing their contents."""
    files = []
    for directory, subdirectories, names in os.walk(root):
        subdirectories[:] = [name for name in subdirectories if name not in EXCLUDED_DIRECTORIES]
        files.extend(Path(directory) / name for name in names if name.endswith(".md"))
    return sorted(files)


def main() -> int:
    files = curriculum_files(ROOT)
    broken: list[str] = []
    links = 0
    for source in files:
        for match in MARKDOWN_LINK.finditer(source.read_text(encoding="utf-8")):
            target = match.group(1).strip()
            if not target or target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            path = unquote(target.split("#", 1)[0]).split("?", 1)[0]
            if path.startswith("<") and path.endswith(">"):
                path = path[1:-1]
            links += 1
            if not (source.parent / path).exists():
                broken.append(f"{source.relative_to(ROOT)} -> {target}")
    print(f"Checked {len(files)} Markdown files and {links} local links")
    if broken:
        print("Broken links:")
        for item in broken:
            print(f"  {item}")
        return 1
    print("All local links resolve")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
