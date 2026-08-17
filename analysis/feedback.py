"""Feedback, cycles, and a coarse green/red split.

Green edges are return / negative feedback / integration.
Red edges are fall / positive feedback / shattering.
A cycle that contains green and no red is treated as a return loop;
a cycle that contains red and no green is treated as a fall loop;
mixed cycles are reported separately — those are usually the interesting
ones (a cosmos that can both run down and be restored).
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import networkx as nx

from graph_io import as_simple_digraph, banner, build_multigraph, label_of

# Keep stdout readable; the full set of simple cycles grows fast.
MAX_CYCLE_LEN = 6
MAX_PRINT = 16


def _edge_types_on(multi: nx.MultiDiGraph, u: str, v: str) -> set[str]:
    types: set[str] = set()
    if multi.has_edge(u, v):
        for data in multi[u][v].values():
            types.add(data.get("type", "?"))
            if not data.get("directed", True):
                pass
    if multi.has_edge(v, u):
        for data in multi[v][u].values():
            if not data.get("directed", True):
                types.add(data.get("type", "?"))
    return types


def _classify(types: set[str]) -> str:
    has_g, has_r = "green" in types, "red" in types
    if has_g and has_r:
        return "mixed"
    if has_g:
        return "return"
    if has_r:
        return "fall"
    return "other"


def _cycle_signature(cycle: list[str]) -> tuple[str, ...]:
    """Rotate so the lexicographically smallest id is first (stable de-dupe)."""
    body = cycle[:-1] if cycle and cycle[0] == cycle[-1] else cycle
    k = body.index(min(body))
    rotated = body[k:] + body[:k]
    return tuple(rotated)


def main() -> None:
    multi = build_multigraph()
    G = as_simple_digraph(multi)

    banner("Systems graph — feedback / cycles")
    print(f"Simple digraph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges.")

    sccs = [c for c in nx.strongly_connected_components(G) if len(c) > 1]
    sccs.sort(key=len, reverse=True)
    print(f"\nStrongly connected components with size > 1: {len(sccs)}")
    for i, comp in enumerate(sccs, start=1):
        labels = ", ".join(sorted(label_of(G, n) for n in comp))
        print(f"  SCC {i} ({len(comp)}): {labels}")

    raw = [
        cycle
        for cycle in nx.simple_cycles(G, length_bound=MAX_CYCLE_LEN)
        if len(cycle) >= 2
    ]

    seen: set[tuple[str, ...]] = set()
    unique: list[list[str]] = []
    for cycle in raw:
        sig = _cycle_signature(cycle)
        if sig in seen:
            continue
        seen.add(sig)
        unique.append(list(sig))

    records = []
    for cycle in unique:
        types: set[str] = set()
        closed = cycle + [cycle[0]]
        for u, v in zip(closed, closed[1:]):
            types |= _edge_types_on(multi, u, v)
            if G.has_edge(u, v) and G[u][v].get("type"):
                types.add(G[u][v]["type"])
        records.append((cycle, types, _classify(types)))

    counts = Counter(kind for _, _, kind in records)
    print(f"\nSimple cycles of length 2–{MAX_CYCLE_LEN}: {len(records)}")
    print(f"  return (green, no red): {counts['return']}")
    print(f"  fall   (red, no green): {counts['fall']}")
    print(f"  mixed  (green and red): {counts['mixed']}")
    print(f"  other  (no green/red):  {counts['other']}")

    def _dump(kind: str, title: str) -> None:
        subset = [r for r in records if r[2] == kind]
        subset.sort(key=lambda r: (len(r[0]), r[0][0]))
        print(f"\n{title}  ({len(subset)} total, showing up to {MAX_PRINT})")
        print("-" * 72)
        for cycle, types, _ in subset[:MAX_PRINT]:
            closed = cycle + [cycle[0]]
            labels = " → ".join(label_of(G, n) for n in closed)
            type_s = ", ".join(sorted(types))
            print(f"  [{type_s}]  {labels}")

    _dump("return", "Return loops (negative feedback / integration)")
    _dump("fall", "Fall loops (positive feedback / shattering)")
    _dump("mixed", "Mixed loops (the cosmos can run down and be restored)")

    print("\nReading hint:")
    print("  Return / fall / mixed loops are evidence, not confirmation of a Platonic spine.")
    print("  Recurring hinges across cycles are candidates for an organic spine.")


if __name__ == "__main__":
    main()
