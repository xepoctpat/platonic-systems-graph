"""Community detection on the undirected projection.

Uses NetworkX's greedy modularity (Clauset–Newman–Moore) so there is no
extra dependency. Communities here are a sanity check: they should
roughly recover the four domains plus a Gnostic / fall cluster and a
restoration / return cluster, not a perfect partition.
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities

from graph_io import as_undirected, banner, build_multigraph, label_of


def main() -> None:
    multi = build_multigraph()
    G = as_undirected(multi)

    banner("Platonic Systems Graph — communities")
    print(f"Undirected projection: {G.number_of_nodes()} nodes, "
          f"{G.number_of_edges()} edges.")

    communities = list(greedy_modularity_communities(G, weight="weight"))
    communities.sort(key=len, reverse=True)
    print(f"Greedy modularity found {len(communities)} communities.\n")

    for i, comm in enumerate(communities, start=1):
        members = sorted(comm)
        domains = Counter(G.nodes[n].get("domain", "?") for n in members)
        mix = ", ".join(f"{d}={c}" for d, c in domains.most_common())
        print(f"Community {i}  ({len(members)} nodes; {mix})")
        print("-" * 60)
        for nid in members:
            stage = G.nodes[nid].get("stage")
            stage_s = f"  stage {stage}" if stage else ""
            print(f"  {label_of(G, nid):<28} {nid:<28} "
                  f"{G.nodes[nid].get('domain', ''):<12}{stage_s}")
        print()

    isolated = [n for n in G if G.degree(n) == 0]
    if isolated:
        print("Isolated nodes (no edges):")
        for nid in isolated:
            print(f"  {nid}")


if __name__ == "__main__":
    main()
