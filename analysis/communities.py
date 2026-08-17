"""Community detection on the undirected projection.

Uses NetworkX's greedy modularity (Clauset–Newman–Moore) so there is no
extra dependency. Treat communities as a proposal for clusters, not as
a recovery of a Platonic spine.
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

    banner("Systems graph — communities")
    print(f"Undirected projection: {G.number_of_nodes()} nodes, "
          f"{G.number_of_edges()} edges.")

    communities = list(greedy_modularity_communities(G, weight="weight"))
    communities.sort(key=len, reverse=True)
    print(f"Greedy modularity found {len(communities)} communities.\n")

    for i, comm in enumerate(communities, start=1):
        members = sorted(comm)
        clusters = Counter(G.nodes[n].get("cluster", "?") for n in members)
        kinds = Counter(G.nodes[n].get("kind", "?") for n in members)
        mix = ", ".join(f"{d}={c}" for d, c in clusters.most_common())
        kind_s = ", ".join(f"{d}={c}" for d, c in kinds.most_common())
        print(f"Community {i}  ({len(members)} nodes; {mix}; {kind_s})")
        print("-" * 60)
        for nid in members:
            print(f"  {label_of(G, nid):<28} {nid:<28} "
                  f"{G.nodes[nid].get('kind', ''):<10} "
                  f"{G.nodes[nid].get('cluster', '')}")
        print()

    isolated = [n for n in G if G.degree(n) == 0]
    if isolated:
        print("Isolated nodes (no edges):")
        for nid in isolated:
            print(f"  {nid}")


if __name__ == "__main__":
    main()
