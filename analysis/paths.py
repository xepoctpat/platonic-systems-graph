"""Shortest paths between theoretically loaded pairs.

Default: print a small set of research-relevant paths (descent, return,
critical tensions). Optional CLI: python analysis/paths.py FROM_ID TO_ID
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import networkx as nx

from graph_io import as_simple_digraph, banner, build_multigraph, label_of

# (from, to, why we care)
DEFAULT_QUERIES = [
    ("platonism", "gnosticism", "system-level collision"),
    ("demiurge", "gnostic-demiurge", "V7 craftsman collision"),
    ("receptacle", "kenoma", "V8 matter collision"),
    ("ordered-time", "fallen-time", "V9 time collision"),
    ("eros", "escape-gnosis", "V10 love vs exit"),
    ("the-good", "sunyata", "V11 summit collision"),
    ("kabbalah", "physics", "V5 lateral"),
    ("jungian-psychology", "gnosticism", "V5 hybrid"),
    ("age-of-exile", "eros", "Platonic exile to return (local, not a spine)"),
]


# Prefer constitutive / return arrows over mere contrast when several
# shortest paths have the same hop count.
_TYPE_PREF = {"gold": 0, "green": 1, "cyan": 2, "orange": 3, "red": 4, "magenta": 5}


def _format_path(G: nx.DiGraph, path: list[str]) -> str:
    bits = []
    for i, nid in enumerate(path):
        bits.append(label_of(G, nid))
        if i < len(path) - 1:
            etype = G[nid][path[i + 1]].get("type", "?")
            bits.append(f"--{etype}-->")
    return " ".join(bits)


def _path_pref(G: nx.DiGraph, path: list[str]) -> tuple:
    types = [G[path[i]][path[i + 1]].get("type", "?") for i in range(len(path) - 1)]
    return (sum(_TYPE_PREF.get(t, 9) for t in types), path)


def _gold_path(G: nx.DiGraph, src: str, dst: str) -> list[str] | None:
    gold = nx.DiGraph((u, v) for u, v, d in G.edges(data=True) if d.get("type") == "gold")
    if src not in gold or dst not in gold:
        return None
    try:
        return nx.shortest_path(gold, src, dst)
    except nx.NetworkXNoPath:
        return None


def show_path(G: nx.DiGraph, src: str, dst: str, why: str = "") -> None:
    header = f"{src}  →  {dst}"
    if why:
        header += f"    ({why})"
    print(header)
    if src not in G:
        print(f"  unknown node: {src}\n")
        return
    if dst not in G:
        print(f"  unknown node: {dst}\n")
        return
    if src == dst:
        print("  (same node)\n")
        return
    try:
        paths = sorted(nx.all_shortest_paths(G, src, dst), key=lambda p: _path_pref(G, p))
        path = paths[0]
        print(f"  hops: {len(path) - 1}")
        print(f"  {_format_path(G, path)}")
        alts = [p for p in paths[1:] if p != path][:3]
        if alts:
            print(f"  also ({len(paths) - 1} other shortest):")
            for alt in alts:
                print(f"    {_format_path(G, alt)}")
        gold = _gold_path(G, src, dst)
        if gold and gold != path:
            print(f"  gold-only ({len(gold) - 1} hops): {_format_path(G, gold)}")
    except nx.NetworkXNoPath:
        print("  no directed path")
        UG = G.to_undirected()
        try:
            path = nx.shortest_path(UG, src, dst)
            print(f"  undirected hops: {len(path) - 1}")
            print(f"  {' — '.join(label_of(G, n) for n in path)}")
        except nx.NetworkXNoPath:
            print("  no undirected path either")
    print()


def main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    multi = build_multigraph()
    G = as_simple_digraph(multi)

    banner("Systems graph — paths")
    print("Simple digraph; undirected edges were expanded both ways.\n")

    if len(argv) >= 2:
        show_path(G, argv[0], argv[1], why="cli")
        return
    if len(argv) == 1:
        print("Usage: python analysis/paths.py [FROM_ID TO_ID]")
        print(f"(got a single argument: {argv[0]!r})\n")

    for src, dst, why in DEFAULT_QUERIES:
        show_path(G, src, dst, why)


if __name__ == "__main__":
    main()
