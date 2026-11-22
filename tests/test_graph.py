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
            encoding="utf-8",
            errors="replace",
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
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn("nodes", r.stdout)
        self.assertIn("Platonic share", r.stdout)


class ViewExportTests(unittest.TestCase):
    def test_seriate_breaks_ties_by_name(self) -> None:
        from export_view import seriate

        self.assertEqual(seriate(["b", "a", "c"], {("a", "b"): 1, ("a", "c"): 1}), ["a", "b", "c"])

    def test_view_is_stable_and_complete(self) -> None:
        from export_view import build_view

        first = build_view()
        second = build_view()
        self.assertEqual(first, second)
        clusters = {n["cluster"] for n in load_nodes()}
        self.assertEqual(set(first["ring"]), clusters)
        self.assertEqual(len(first["ring"]), len(clusters))
        self.assertEqual(set(first["communities"]), {n["id"] for n in load_nodes()})
        self.assertIsInstance(first["hidePlatonic"]["components"], int)
        self.assertGreaterEqual(first["hidePlatonic"]["components"], 1)
        self.assertEqual(len(first["betweenness"]), 12)
        self.assertEqual(
            [row["id"] for row in first["slots"]],
            ["craftsman", "matter", "time", "return", "summit"],
        )
        self.assertEqual(len(first["tours"]), 5)
        ids = {n["id"] for n in load_nodes()}
        for row in first["slots"]:
            self.assertTrue(set(row["members"]) <= ids)
        for row in first["tours"]:
            self.assertTrue(set(row["nodes"]) <= ids)

    def test_maya_prakriti_stays_magenta_and_interior(self) -> None:
        """Same-cluster pair. It must stay magenta and must not be filed as a bridge."""
        hit = [e for e in load_edges() if e["from"] == "maya" and e["to"] == "purusha-prakriti"]
        self.assertEqual(len(hit), 1)
        self.assertEqual(hit[0]["type"], "magenta")
        from export_view import build_view

        for bridge in build_view()["bridges"]:
            for member in bridge["members"]:
                pair = {member["from"], member["to"]}
                self.assertNotEqual(pair, {"maya", "purusha-prakriti"})

    def test_receptacle_kenoma_bridge_keeps_magenta(self) -> None:
        from export_view import build_view

        bridges = build_view()["bridges"]
        bridge = next(b for b in bridges if set(b["clusters"]) == {"platonic", "gnostic"})
        member = next(
            m for m in bridge["members"] if m["from"] == "receptacle" and m["to"] == "kenoma"
        )
        self.assertEqual(member["type"], "magenta")
        self.assertGreater(bridge["counts"]["magenta"], bridge["counts"]["gold"])
        self.assertTrue(bridge["mix"].split(" · ")[1].startswith("magenta"))
        self.assertNotIn("type", bridge)


if __name__ == "__main__":
    unittest.main()
