"""Validate nodes.yaml / edges.yaml.

Exit 0 if the graph is loadable and has no schema errors.
Warnings (isolates, missing refs, duplicate typed edges) do not fail the run.

  python tools/validate.py
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "analysis"))

from graph_io import (  # noqa: E402
    EDGE_TYPES,
    KINDS,
    build_multigraph,
    load_edges,
    load_nodes,
)

REQUIRED_NODE = ("id", "label", "kind", "cluster", "description")
REQUIRED_EDGE = ("from", "to", "type", "directed", "strength", "note")


def _check_nodes(nodes: list[dict]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    seen: dict[str, int] = {}
    for i, node in enumerate(nodes):
        loc = f"nodes[{i}]"
        if not isinstance(node, dict):
            errors.append(f"{loc}: not a mapping")
            continue
        nid = node.get("id")
        for key in REQUIRED_NODE:
            if not node.get(key) and node.get(key) != 0:
                errors.append(f"{loc} id={nid!r}: missing {key}")
        if not isinstance(nid, str) or not nid:
            errors.append(f"{loc}: id must be a non-empty string")
            continue
        if nid in seen:
            errors.append(f"{loc} duplicate id {nid!r} (first at nodes[{seen[nid]}])")
        else:
            seen[nid] = i
        if node.get("kind") not in KINDS:
            errors.append(f"{loc} {nid}: kind must be system|principle, got {node.get('kind')!r}")
        if not isinstance(node.get("cluster"), str) or not node["cluster"]:
            errors.append(f"{loc} {nid}: cluster must be a non-empty string")
        refs = node.get("refs")
        if refs is None:
            warnings.append(f"{nid}: no refs")
        elif not isinstance(refs, list) or not refs:
            errors.append(f"{loc} {nid}: refs must be a non-empty list when present")
        if isinstance(nid, str) and nid != nid.strip():
            warnings.append(f"{nid}: id has surrounding whitespace")
    return errors, warnings


def _check_edges(edges: list[dict], node_ids: set[str]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    typed = Counter()
    for i, edge in enumerate(edges):
        loc = f"edges[{i}]"
        if not isinstance(edge, dict):
            errors.append(f"{loc}: not a mapping")
            continue
        for key in REQUIRED_EDGE:
            if key not in edge:
                errors.append(f"{loc}: missing {key}")
        src, dst = edge.get("from"), edge.get("to")
        if src not in node_ids:
            errors.append(f"{loc}: from={src!r} is not a node id")
        if dst not in node_ids:
            errors.append(f"{loc}: to={dst!r} is not a node id")
        etype = edge.get("type")
        if etype not in EDGE_TYPES:
            errors.append(f"{loc} {src}->{dst}: type must be one of {EDGE_TYPES}, got {etype!r}")
        if not isinstance(edge.get("directed"), bool):
            errors.append(f"{loc} {src}->{dst}: directed must be a bool")
        strength = edge.get("strength")
        try:
            sval = float(strength)
        except (TypeError, ValueError):
            errors.append(f"{loc} {src}->{dst}: strength must be a number")
        else:
            if not 0.0 <= sval <= 1.0:
                errors.append(f"{loc} {src}->{dst}: strength {sval} not in [0, 1]")
        if not edge.get("note"):
            errors.append(f"{loc} {src}->{dst}: missing note")
        versions = edge.get("versions")
        if versions is not None and not isinstance(versions, list):
            errors.append(f"{loc} {src}->{dst}: versions must be a list when present")
        if src and dst and etype:
            key = (src, dst, etype)
            typed[key] += 1
    for (src, dst, etype), n in typed.items():
        if n > 1:
            warnings.append(f"duplicate {etype} edge {src}->{dst} ({n} times)")
    return errors, warnings


def main() -> int:
    try:
        nodes = load_nodes()
        edges = load_edges()
    except (FileNotFoundError, ValueError) as exc:
        print(f"ERROR  {exc}")
        return 1

    errors, warnings = _check_nodes(nodes)
    node_ids = {n.get("id") for n in nodes if isinstance(n, dict) and n.get("id")}
    e_err, e_warn = _check_edges(edges, node_ids)
    errors.extend(e_err)
    warnings.extend(e_warn)

    isolates: list[str] = []
    if not errors:
        try:
            G = build_multigraph()
        except KeyError as exc:
            errors.append(str(exc))
        else:
            isolates = sorted(n for n in G.nodes if G.degree(n) == 0)
            for nid in isolates:
                warnings.append(f"isolate: {nid}")

    kinds = Counter(n.get("kind") for n in nodes)
    types = Counter(e.get("type") for e in edges)
    clusters = {n.get("cluster") for n in nodes if n.get("cluster")}

    status = "OK" if not errors else "FAIL"
    print(
        f"{status}  {len(nodes)} nodes  {len(edges)} edges  "
        f"{kinds.get('system', 0)} systems  {kinds.get('principle', 0)} principles  "
        f"{len(clusters)} clusters"
    )
    print("  types  " + " · ".join(f"{t} {types.get(t, 0)}" for t in EDGE_TYPES))
    if isolates:
        print("  isolates  " + ", ".join(isolates))

    for msg in errors:
        print(f"ERROR  {msg}")
    for msg in warnings:
        print(f"WARN   {msg}")

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
