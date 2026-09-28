#!/usr/bin/env python3
"""Merge Chapter Two's code into a Chapter One folder that ChatGPT has already worked on.

    python3 tools/merge_chapter2.py  <your-chapter-one-folder>  [--dry-run]

Run it from inside the NEW (Chapter Two) folder. It writes the result into the new folder:

  * Every PNG in <your-chapter-one-folder>/assets/ is copied into ./assets/ (your art wins;
    Chapter Two did not change any existing PNG).
  * Every code file (index.html, js/*.js except assets.js) is merged three ways:
      base   = tools/merge/ch1_base/<file>   (Chapter One exactly as Claude shipped it)
      yours  = <your-chapter-one-folder>/<file>
      theirs = ./<file>                       (Chapter Two)
    - you never touched it     -> Chapter Two's file is kept
    - only you touched it      -> impossible for Chapter Two files, but handled (yours kept)
    - both touched it          -> your edits are re-applied on top of Chapter Two, hunk by hunk.
      Any hunk that no longer fits is written to MERGE_REPORT.md for you to re-apply by hand.
  * js/assets.js is rebuilt from ./assets/ at the end (tools/build_assets.py).
Nothing in <your-chapter-one-folder> is modified.
"""
import difflib, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(HERE, 'tools', 'merge', 'ch1_base')


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read().splitlines(keepends=True)


def apply_edits(base, mine, new):
    """Re-apply the base->mine edits onto `new`. Returns (merged_lines, failed_hunks)."""
    out = list(new)
    failed = []
    sm = difflib.SequenceMatcher(None, base, mine, autojunk=False)
    offset = 0  # how far `out` has drifted from `new`
    # map base line index -> new line index via the base->new diff
    bn = difflib.SequenceMatcher(None, base, new, autojunk=False)
    base_to_new = {}
    for tag, i1, i2, j1, j2 in bn.get_opcodes():
        if tag == 'equal':
            for k in range(i2 - i1):
                base_to_new[i1 + k] = j1 + k
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            continue
        # the base lines this hunk replaces must still exist, unchanged, in the new file
        ctx_ok = all(i in base_to_new for i in range(i1, i2))
        if i1 == i2:  # pure insertion: anchor on the line before (or after)
            anchor = base_to_new.get(i1 - 1)
            if anchor is not None:
                pos = anchor + 1
            elif i1 in base_to_new:
                pos = base_to_new[i1]
            else:
                pos = None
            if pos is None:
                failed.append((base[max(0, i1 - 3):i1 + 3], mine[j1:j2], 'insert'))
                continue
            out[pos + offset:pos + offset] = mine[j1:j2]
            offset += j2 - j1
            continue
        if not ctx_ok:
            failed.append((base[i1:i2], mine[j1:j2], tag))
            continue
        start = base_to_new[i1]
        if base_to_new[i2 - 1] - start != i2 - 1 - i1:
            failed.append((base[i1:i2], mine[j1:j2], tag))
            continue
        out[start + offset:start + offset + (i2 - i1)] = mine[j1:j2]
        offset += (j2 - j1) - (i2 - i1)
    return out, failed


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    if not args:
        print(__doc__)
        sys.exit(1)
    mine_root = os.path.abspath(args[0])
    report = ['# Chapter Two merge report\n\n']
    # 1. art
    src_assets = os.path.join(mine_root, 'assets')
    n = 0
    if os.path.isdir(src_assets):
        for f in sorted(os.listdir(src_assets)):
            if f.lower().endswith('.png'):
                n += 1
                if not dry:
                    shutil.copy2(os.path.join(src_assets, f), os.path.join(HERE, 'assets', f))
    report.append(f'- Copied {n} PNGs from your assets/ folder.\n')
    # 2. code
    conflicts = 0
    for rel in sorted(os.listdir(BASE)):
        target = 'index.html' if rel == 'index.html' else os.path.join('js', rel)
        base_p, mine_p, new_p = os.path.join(BASE, rel), os.path.join(mine_root, target), os.path.join(HERE, target)
        if not os.path.exists(mine_p):
            report.append(f'- `{target}`: not in your folder, kept Chapter Two.\n')
            continue
        base, mine, new = read(base_p), read(mine_p), read(new_p)
        if mine == base:
            report.append(f'- `{target}`: you did not edit it, kept Chapter Two.\n')
            continue
        if new == base:
            if not dry:
                shutil.copy2(mine_p, new_p)
            report.append(f'- `{target}`: only you edited it, kept yours.\n')
            continue
        merged, failed = apply_edits(base, mine, new)
        if not dry:
            with open(new_p, 'w', encoding='utf-8') as f:
                f.writelines(merged)
        if failed:
            conflicts += len(failed)
            report.append(f'- `{target}`: merged, but **{len(failed)} of your edits need re-applying by hand** (below).\n')
            for old, yours, tag in failed:
                report.append(f'\n### `{target}`: re-apply this edit\nChapter One had:\n```js\n{"".join(old)}```\nYou changed it to:\n```js\n{"".join(yours)}```\n')
        else:
            report.append(f'- `{target}`: merged your edits into Chapter Two cleanly.\n')
    # 3. rebuild assets.js
    if not dry:
        r = subprocess.run([sys.executable, os.path.join(HERE, 'tools', 'build_assets.py')], cwd=HERE)
        report.append('- Rebuilt js/assets.js.\n' if r.returncode == 0 else '- **build_assets.py failed; run it by hand.**\n')
    report.append('\nNext: run `node tools/check/validate.js` and open index.html.\n')
    with open(os.path.join(HERE, 'MERGE_REPORT.md'), 'w', encoding='utf-8') as f:
        f.writelines(report)
    print(''.join(report))
    print('Conflicts to fix by hand:', conflicts)


if __name__ == '__main__':
    main()
