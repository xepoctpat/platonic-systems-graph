"""Stdlib checks for YAML load, validate, and the New overlay.

  python -m unittest tests.test_graph
"""

from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "analysis"))
sys.path.insert(0, str(ROOT / "tools"))

from graph_io import (  # noqa: E402
    EDGE_TYPES,
    FLOW_TYPES,
    PEER_TYPES,
    build_multigraph,
    load_edges,
    load_latest,
    load_nodes,
)


class GraphLoadTests(unittest.TestCase):
    def test_nodes_have_ids_and_kinds(self) -> None:
        nodes = load_nodes()
        self.assertGreater(len(nodes), 0)
        ids = [n["id"] for n in nodes]
        self.assertEqual(len(ids), len(set(ids)))

    def test_edges_point_at_nodes(self) -> None:
        ids = {n["id"] for n in load_nodes()}
        edges = load_edges()
        self.assertGreater(len(edges), 0)
        for e in edges:
            self.assertIn(e["from"], ids, e)
            self.assertIn(e["to"], ids, e)
            self.assertIn(e["type"], EDGE_TYPES)

    def test_latest_ids_exist(self) -> None:
        ids = {n["id"] for n in load_nodes()}
        latest = load_latest()
        self.assertTrue(latest["pass"])
        self.assertTrue(latest["nodes"])
        for nid in latest["nodes"]:
            self.assertIn(nid, ids)

    def test_multigraph_builds(self) -> None:
        G = build_multigraph()
        self.assertEqual(G.number_of_nodes(), len(load_nodes()))
        self.assertEqual(G.number_of_edges(), len(load_edges()))
        self.assertEqual(sum(1 for n in G if G.degree(n) == 0), 0)

    def test_peer_vs_flow_flags(self) -> None:
        """Convention, not a schema error: flow is directed, peers are not."""
        slips = []
        for e in load_edges():
            directed = bool(e.get("directed"))
            if e["type"] in FLOW_TYPES and not directed:
                slips.append(e)
            if e["type"] in PEER_TYPES and directed:
                slips.append(e)
        self.assertEqual(slips, [], msg=f"directed flag mismatches type on {len(slips)} edges")


class ValidateCliTests(unittest.TestCase):
    def test_validate_ok(self) -> None:
        r = subprocess.run(
            [sys.executable, str(ROOT / "tools" / "validate.py")],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertTrue(r.stdout.startswith("OK"), r.stdout)

    def test_report_ok(self) -> None:
        r = subprocess.run(
            [sys.executable, str(ROOT / "analysis" / "report.py")],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn("nodes", r.stdout)
        self.assertIn("Platonic share", r.stdout)


if __name__ == "__main__":
    unittest.main()
