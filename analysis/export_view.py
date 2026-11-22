"""Derived reading of the graph for the viewer.

YAML stays the source of truth. This writes data/view.json: bridge mixes,
seriation order, community ids, the hide-Platonic component count and the
nodes left outside the largest remaining component, unweighted betweenness,
and the curated slots and tours.

  python analysis/export_view.py

tools/validate.py calls write_view() after a clean schema check.
Do not weight betweenness by strength. That measure stays comparable to
analysis/report.py and the ROADMAP snapshots.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import networkx as nx
import yaml
from networkx.algorithms.community import greedy_modularity_communities

from graph_io import (
    DATA,
    EDGE_TYPES,
    as_undirected,
    build_multigraph,
    load_edges,
    load_nodes,
)

FINDING_ORDER = ("magenta", "orange", "red", "green", "gold", "cyan")
TOP_N = 12

CAPTIONS = {
    "communities": (
        "Greedy modularity proposal. Edge weight is editorial strength, "
        "not a measured quantity. Not a recovered spine."
    ),
    "betweenness": (
        "Unweighted betweenness. Count only, not a spine. "
        "A high Platonic rank is remaining seed bias."
    ),
    "ring": (
        "Greedy nearest-neighbor order by shared cross-cluster findings. "
        "Layout only, not a chronology and not a spine."
    ),
    "hidePlatonic": (
        "Undirected component count after removing cluster platonic. "
        "The success test is one component."
    ),
    "slots": "Peer groups of occupants. Not stages and not a rank.",
    "tours": "Illustrations of named tensions. Not the law of the graph.",
}


def _clean(text: object) -> str:
    return " ".join(str(text or "").split())


def _load_hand(name: str) -> dict:
    path = DATA / name
    if not path.exists():
        raise ValueError(f"Missing data/{name}")
    with path.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    if not isinstance(data, dict):
        raise ValueError(f"data/{name} must be a mapping")
    return data


def mix_label(counts: dict[str, int]) -> str:
    """Dominant type first. Gold does not win a mixed chord by preference."""
    total = sum(int(n) for n in counts.values())
    ranked = sorted(
        ((t, int(counts.get(t, 0))) for t in EDGE_TYPES),
        key=lambda item: (
            -item[1],
            FINDING_ORDER.index(item[0]) if item[0] in FINDING_ORDER else 9,
            item[0],
        ),
    )
    parts = [f"{t} {n}" for t, n in ranked if n]
    if not parts:
        return str(total)
    return f"{total} · " + " · ".join(parts)


def _pair(a: str, b: str) -> tuple[str, str]:
    return (a, b) if a <= b else (b, a)


def bridge_records(nodes: list[dict], edges: list[dict]) -> tuple[list[dict], dict[tuple[str, str], int]]:
    by_id = {n["id"]: n for n in nodes}
    grouped: dict[tuple[str, str], dict] = {}
    similarity: dict[tuple[str, str], int] = {}
    for i, edge in enumerate(edges):
        src = by_id.get(edge["from"])
        dst = by_id.get(edge["to"])
        if not src or not dst:
            continue
        ca = src.get("cluster") or ""
        cb = dst.get("cluster") or ""
        if not ca or not cb or ca == cb:
            continue
        key = _pair(ca, cb)
        similarity[key] = similarity.get(key, 0) + 1
        rec = grouped.get(key)
        if rec is None:
            rec = {
                "clusters": [key[0], key[1]],
                "counts": {t: 0 for t in EDGE_TYPES},
                "members": [],
            }
            grouped[key] = rec
        etype = edge["type"]
        if etype not in rec["counts"]:
            raise ValueError(f"edge[{i}] type {etype!r} is not a known edge type")
        rec["counts"][etype] += 1
        rec["members"].append(
            {
                "id": f"e{i}",
                "from": edge["from"],
                "to": edge["to"],
                "fromLabel": src.get("label") or edge["from"],
                "toLabel": dst.get("label") or edge["to"],
                "type": etype,
                "note": edge.get("note") or "",
                "directed": bool(edge.get("directed")),
            }
        )
    records = []
    for key in sorted(grouped):
        rec = grouped[key]
        rec["count"] = sum(rec["counts"].values())
        rec["mix"] = mix_label(rec["counts"])
        rec["members"].sort(key=lambda m: (m["type"], m["from"], m["to"], m["id"]))
        records.append(rec)
    return records, similarity


def seriate(clusters: list[str], similarity: dict[tuple[str, str], int]) -> list[str]:
    """Greedy nearest neighbor. Tie-break is the cluster name. Deterministic."""
    if not clusters:
        return []

    def degree(name: str) -> int:
        return sum(similarity.get(_pair(name, other), 0) for other in clusters if other != name)

    remaining = set(clusters)
    start = min(remaining, key=lambda name: (-degree(name), name))
    order = [start]
    remaining.remove(start)
    while remaining:
        last = order[-1]
        nxt = min(
            remaining,
            key=lambda name: (-similarity.get(_pair(last, name), 0), name),
        )
        order.append(nxt)
        remaining.remove(nxt)
    return order


def _communities(graph: nx.Graph) -> dict[str, int]:
    found = list(greedy_modularity_communities(graph, weight="weight"))
    found.sort(key=lambda comm: (-len(comm), min(comm) if comm else ""))
    out: dict[str, int] = {}
    for index, comm in enumerate(found, start=1):
        for nid in comm:
            out[nid] = index
    return {nid: out[nid] for nid in sorted(out)}


def _betweenness(graph: nx.Graph) -> tuple[list[dict], int]:
    scores = nx.betweenness_centrality(graph, weight=None, normalized=True)
    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))[:TOP_N]
    rows = []
    platonic = 0
    for nid, score in ranked:
        cluster = graph.nodes[nid].get("cluster") or ""
        if cluster == "platonic":
            platonic += 1
        rows.append(
            {
                "id": nid,
                "label": graph.nodes[nid].get("label") or nid,
                "cluster": cluster,
                "score": round(float(score), 6),
            }
        )
    return rows, platonic


def _hide_platonic(graph: nx.Graph) -> dict:
    """Component count after the Platonic cluster is removed.

    ``aside`` is every node that is not in the largest remaining component.
    The viewer draws that list; it does not recompute connectivity.
    """
    kept = graph.copy()
    removed = [nid for nid in list(kept) if kept.nodes[nid].get("cluster") == "platonic"]
    kept.remove_nodes_from(removed)
    if kept.order() == 0:
        return {"components": 0, "removed": len(removed), "aside": []}
    parts = [set(comp) for comp in nx.connected_components(kept)]
    parts.sort(key=lambda comp: (-len(comp), min(comp)))
    aside = sorted(nid for comp in parts[1:] for nid in comp)
    return {"components": len(parts), "removed": len(removed), "aside": aside}


def _hand_lists(node_ids: set[str]) -> tuple[list[dict], list[dict]]:
    slots_doc = _load_hand("slots.yaml")
    tours_doc = _load_hand("tours.yaml")
    slots_in = slots_doc.get("slots")
    tours_in = tours_doc.get("tours")
    if not isinstance(slots_in, list) or not slots_in:
        raise ValueError("data/slots.yaml must contain a non-empty 'slots' list")
    if not isinstance(tours_in, list) or not tours_in:
        raise ValueError("data/tours.yaml must contain a non-empty 'tours' list")

    slots = []
    seen_slots: set[str] = set()
    for i, row in enumerate(slots_in):
        if not isinstance(row, dict):
            raise ValueError(f"slots[{i}] is not a mapping")
        sid = row.get("id")
        members = row.get("members")
        if not isinstance(sid, str) or not sid:
            raise ValueError(f"slots[{i}] needs an id")
        if sid in seen_slots:
            raise ValueError(f"duplicate slot id {sid!r}")
        seen_slots.add(sid)
        if not isinstance(members, list) or not members:
            raise ValueError(f"slot {sid}: members must be a non-empty list")
        cleaned = []
        for nid in members:
            if nid not in node_ids:
                raise ValueError(f"slot {sid}: unknown node id {nid!r}")
            if nid in cleaned:
                raise ValueError(f"slot {sid}: duplicate member {nid!r}")
            cleaned.append(nid)
        slots.append(
            {
                "id": sid,
                "label": _clean(row.get("label") or sid),
                "gloss": _clean(row.get("gloss")),
                "members": cleaned,
            }
        )

    tours = []
    seen_tours: set[str] = set()
    for i, row in enumerate(tours_in):
        if not isinstance(row, dict):
            raise ValueError(f"tours[{i}] is not a mapping")
        tid = row.get("id")
        nodes = row.get("nodes")
        if not isinstance(tid, str) or not tid:
            raise ValueError(f"tours[{i}] needs an id")
        if tid in seen_tours:
            raise ValueError(f"duplicate tour id {tid!r}")
        seen_tours.add(tid)
        if not isinstance(nodes, list) or not nodes:
            raise ValueError(f"tour {tid}: nodes must be a non-empty list")
        cleaned = []
        for nid in nodes:
            if nid not in node_ids:
                raise ValueError(f"tour {tid}: unknown node id {nid!r}")
            if nid in cleaned:
                raise ValueError(f"tour {tid}: duplicate node {nid!r}")
            cleaned.append(nid)
        tours.append(
            {
                "id": tid,
                "title": _clean(row.get("title") or tid),
                "sentence": _clean(row.get("sentence")),
                "nodes": cleaned,
            }
        )
    return slots, tours


def build_view() -> dict:
    nodes = load_nodes()
    edges = load_edges()
    node_ids = {n["id"] for n in nodes}
    bridges, similarity = bridge_records(nodes, edges)
    clusters = sorted({n["cluster"] for n in nodes if n.get("cluster")})
    multi = build_multigraph()
    undirected = as_undirected(multi)
    community_of = _communities(undirected)
    missing = sorted(node_ids - set(community_of))
    if missing:
        raise ValueError(f"community assignment missed nodes: {missing}")
    hinges, platonic_top = _betweenness(undirected)
    slots, tours = _hand_lists(node_ids)
    return {
        "source": "Derived by analysis/export_view.py. YAML is the source of truth.",
        "caption": CAPTIONS,
        "ring": seriate(clusters, similarity),
        "bridges": bridges,
        "communities": community_of,
        "communityCount": len(set(community_of.values())),
        "hidePlatonic": _hide_platonic(undirected),
        "betweenness": hinges,
        "platonicTop12": platonic_top,
        "slots": slots,
        "tours": tours,
    }


def write_view(path: Path | None = None) -> Path:
    payload = build_view()
    dest = path or (DATA / "view.json")
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    tmp = dest.with_suffix(".json.tmp")
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(dest)
    return dest


def main() -> int:
    dest = write_view()
    print(f"wrote {dest.relative_to(DATA.parent).as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
