"""Centrality of nodes.

Reports degree, weighted degree, betweenness, and PageRank on the
simple directed projection (undirected edges count both ways).
High-betweenness nodes are candidate hinges of an organic spine —
do not assume they will be Platonic.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import networkx as nx

from graph_io import as_simple_digraph, banner, build_multigraph, label_of

TOP_N = 12


def _pagerank(G, alpha: float = 0.85, max_iter: int = 100, tol: float = 1e-6) -> dict:
    """Weighted PageRank without numpy (NetworkX 3.6 delegates to scipy)."""
    nodes = list(G)
    n = len(nodes)
    if n == 0:
        return {}
    index = {nid: i for i, nid in enumerate(nodes)}
    out_w = [0.0] * n
    incoming: list[list[tuple[int, float]]] = [[] for _ in range(n)]
    for u, v, data in G.edges(data=True):
        w = float(data.get("weight", 1.0))
        out_w[index[u]] += w
        incoming[index[v]].append((index[u], w))
    dangling = [i for i, s in enumerate(out_w) if s == 0.0]
    pr = [1.0 / n] * n
    teleport = (1.0 - alpha) / n
    for _ in range(max_iter):
        nxt = [teleport] * n
        dang = alpha * sum(pr[i] for i in dangling) / n
        for j in range(n):
            nxt[j] += dang
            for i, w in incoming[j]:
                nxt[j] += alpha * pr[i] * (w / out_w[i])
        if sum(abs(nxt[i] - pr[i]) for i in range(n)) < n * tol:
            pr = nxt
            break
        pr = nxt
    return {nid: pr[i] for i, nid in enumerate(nodes)}


def _rank(scores: dict, n: int) -> list[tuple[str, float]]:
    return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:n]


def _print_rank(G, title: str, scores: dict) -> None:
    print(f"\n{title}")
    print("-" * len(title))
    print(f"{'#':>3}  {'id':<28} {'kind':<10} {'cluster':<16} {'score':>8}")
    for i, (nid, score) in enumerate(_rank(scores, TOP_N), start=1):
        kind = G.nodes[nid].get("kind", "")
        cluster = G.nodes[nid].get("cluster", "")
        print(f"{i:3d}  {nid:<28} {kind:<10} {cluster:<16} {score:8.4f}")


def main() -> None:
    multi = build_multigraph()
    G = as_simple_digraph(multi)
    n, m = G.number_of_nodes(), G.number_of_edges()

    banner("Systems graph — centrality")
    print(f"Simple digraph: {n} nodes, {m} directed edges "
          f"(from {multi.number_of_edges()} typed multi-edges).")
    print(f"Showing top {TOP_N}.")

    in_deg = dict(G.in_degree())
    out_deg = dict(G.out_degree())
    tot_deg = {nid: in_deg[nid] + out_deg[nid] for nid in G}

    in_w = dict(G.in_degree(weight="weight"))
    out_w = dict(G.out_degree(weight="weight"))
    tot_w = {nid: in_w[nid] + out_w[nid] for nid in G}

    # Betweenness on the undirected skeleton so cyan/magenta hubs surface.
    undirected = G.to_undirected()
    betweenness = nx.betweenness_centrality(undirected, weight=None, normalized=True)
    pagerank = _pagerank(G)

    _print_rank(G, "Total degree (in + out)", tot_deg)
    _print_rank(G, "Weighted degree (sum of strengths)", tot_w)
    _print_rank(G, "Betweenness (undirected)", betweenness)
    _print_rank(G, "PageRank (directed, weighted)", pagerank)

    print("\nHighest-betweenness bridges (candidate organic hinges):")
    for nid, score in _rank(betweenness, 5):
        print(f"  {label_of(G, nid):<28} {nid:<28} {score:.4f}")


if __name__ == "__main__":
    main()
