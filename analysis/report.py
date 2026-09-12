"""One-shot graph snapshot for ROADMAP After-rows.

Not a spine proof. Prints size, edge mix, isolates, betweenness top 5,
and Platonic share of the betweenness top 12.

  python analysis/report.py
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import networkx as nx

from graph_io import (
    EDGE_TYPES,
    as_simple_digraph,
    as_undirected,
    banner,
    build_multigraph,
    label_of,
    load_edges,
    load_latest,
    load_nodes,
)

TOP_N = 12


def _rank(scores: dict, n: int) -> list[tuple[str, float]]:
    return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:n]


def snapshot() -> dict:
    nodes = load_nodes()
    edges = load_edges()
    multi = build_multigraph()
    G = as_simple_digraph(multi)
    U = as_undirected(multi)
    betweenness = nx.betweenness_centrality(U, weight=None, normalized=True)
    top = _rank(betweenness, TOP_N)
    platonic = sum(1 for nid, _ in top if G.nodes[nid].get("cluster") == "platonic")
    isolates = sorted(n for n in multi if multi.degree(n) == 0)
    kinds = Counter(n.get("kind") for n in nodes)
    types = Counter(e.get("type") for e in edges)
    clusters = {n.get("cluster") for n in nodes if n.get("cluster")}
    latest = load_latest()
    return {
        "nodes": len(nodes),
        "edges": len(edges),
        "systems": kinds.get("system", 0),
        "principles": kinds.get("principle", 0),
        "clusters": len(clusters),
        "types": {t: types.get(t, 0) for t in EDGE_TYPES},
        "isolates": isolates,
        "betweenness": top,
        "platonic_top12": platonic,
        "latest": latest,
        "graph": G,
    }


def main() -> int:
    data = snapshot()
    G = data["graph"]
    banner("Systems graph — snapshot")
    print(
        f"{data['nodes']} nodes · {data['edges']} edges · "
        f"{data['systems']} systems · {data['principles']} principles · "
        f"{data['clusters']} clusters"
    )
    print("Edges  " + " · ".join(f"{t} {data['types'][t]}" for t in EDGE_TYPES))
    if data["isolates"]:
        print("Isolates  " + ", ".join(data["isolates"]))
    else:
        print("Isolates  none")
    print("Betweenness top 5")
    for i, (nid, score) in enumerate(data["betweenness"][:5], start=1):
        print(f"  {i}. {label_of(G, nid)}  {nid}  {score:.3f}")
    print(
        f"Platonic share of top {TOP_N} betweenness  "
        f"{data['platonic_top12']}/{TOP_N}  (count only, not a spine)"
    )
    latest = data["latest"]
    if latest.get("nodes"):
        print(f"Latest pass  {latest.get('pass')}  ({len(latest['nodes'])} nodes)  {latest.get('label')}")
    print("\nA high Platonic score is remaining seed bias until laterals move it.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
