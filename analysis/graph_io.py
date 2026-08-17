"""Load nodes.yaml / edges.yaml into NetworkX graphs.

The YAML files are the single source of truth. Every analysis script
imports from here so path handling and edge-collapsing stay in one place.
"""

from __future__ import annotations

from pathlib import Path

import networkx as nx
import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

EDGE_TYPES = ("gold", "cyan", "magenta", "green", "red", "orange")
KINDS = ("system", "principle")
LATERAL_TYPES = ("orange", "cyan")


def _read_yaml(name: str) -> dict:
    path = DATA / name
    if not path.exists():
        raise FileNotFoundError(f"Missing data file: {path}")
    with path.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    if not isinstance(data, dict):
        raise ValueError(f"{path} did not parse as a mapping")
    return data


def load_nodes() -> list[dict]:
    data = _read_yaml("nodes.yaml")
    nodes = data.get("nodes")
    if not isinstance(nodes, list):
        raise ValueError("nodes.yaml must contain a top-level 'nodes' list")
    bad = [n.get("id") for n in nodes if n.get("kind") not in KINDS or not n.get("cluster")]
    if bad:
        raise ValueError(f"nodes missing kind/cluster: {bad}")
    return nodes


def load_edges() -> list[dict]:
    data = _read_yaml("edges.yaml")
    edges = data.get("edges")
    if not isinstance(edges, list):
        raise ValueError("edges.yaml must contain a top-level 'edges' list")
    return edges


def build_multigraph() -> nx.MultiDiGraph:
    """Full fidelity graph: parallel edges of different types are kept."""
    G = nx.MultiDiGraph()
    for node in load_nodes():
        nid = node["id"]
        G.add_node(nid, **{k: v for k, v in node.items() if k != "id"})

    missing = []
    for i, edge in enumerate(load_edges()):
        src, dst = edge["from"], edge["to"]
        if src not in G:
            missing.append((i, "from", src))
        if dst not in G:
            missing.append((i, "to", dst))
        G.add_edge(
            src,
            dst,
            key=f"{edge['type']}:{i}",
            type=edge["type"],
            directed=bool(edge.get("directed", True)),
            strength=float(edge.get("strength", 1.0)),
            versions=list(edge.get("versions") or []),
            note=edge.get("note", ""),
        )
    if missing:
        lines = ", ".join(f"edge[{i}] {field}={nid!r}" for i, field, nid in missing)
        raise KeyError(f"Edges reference unknown node ids: {lines}")
    return G


def as_simple_digraph(G: nx.MultiDiGraph) -> nx.DiGraph:
    """Collapse parallel edges (max strength) and treat undirected as both ways.

    Used by centrality, paths, and cycle detection.
    """
    H = nx.DiGraph()
    H.add_nodes_from(G.nodes(data=True))
    for u, v, data in G.edges(data=True):
        weight = float(data.get("strength", 1.0))
        _strengthen(H, u, v, weight, data)
        if not data.get("directed", True):
            _strengthen(H, v, u, weight, data)
    return H


def as_undirected(G: nx.MultiDiGraph) -> nx.Graph:
    """Undirected projection for community detection."""
    H = nx.Graph()
    H.add_nodes_from(G.nodes(data=True))
    for u, v, data in G.edges(data=True):
        if u == v:
            continue
        weight = float(data.get("strength", 1.0))
        if H.has_edge(u, v):
            H[u][v]["weight"] = max(H[u][v]["weight"], weight)
        else:
            H.add_edge(u, v, weight=weight)
    return H


def _strengthen(H: nx.DiGraph, u, v, weight: float, data: dict) -> None:
    if H.has_edge(u, v):
        if weight > H[u][v]["weight"]:
            H[u][v]["weight"] = weight
            H[u][v]["type"] = data.get("type")
    else:
        H.add_edge(u, v, weight=weight, type=data.get("type"))


def label_of(G: nx.Graph, nid: str) -> str:
    return G.nodes[nid].get("label", nid)


def banner(title: str) -> None:
    bar = "=" * 72
    print(bar)
    print(title)
    print(bar)
