import { EDGE_COLOR, communityColor, clusterColor, esc, LATERALS, loadData, loadLatest, loadView, toElements, uniqueSorted } from "./data.js";
import {
  checked,
  mountChecks,
  mountLegend,
  setChecks,
  showEdge,
  showFindings,
  showGuide,
  showHinges,
  showLoop,
  showNode,
  showOpenedGroup,
  showReading,
  showSlots,
  showTrajectory,
  showTours
} from "./detail.js";
import {
  applyLabels,
  applyLabelsSoon,
  bestLoop,
  chordWidth,
  findRoute,
  hasLiveBridge,
  loopKind,
  markBridges,
  paintPath,
  runViewLayout,
  syncMetaEdges,
  syncGroups
} from "./layout.js";
import { renderReading } from "./reading.js";
import { renderSheet } from "./sheet.js";
import { state } from "./state.js";

const status = document.getElementById("status");

function showGraph() {
  const cyBox = document.getElementById("cy");
  if (cyBox) cyBox.classList.remove("off");
  if (state.cy) state.cy.resize();
}

function leaveReading() {
  state.readingOn = false;
  const btn = document.getElementById("reading");
  if (btn) btn.classList.remove("active");
  const panel = document.getElementById("reading-view");
  if (panel) panel.hidden = true;
  if (!state.sheetOn) showGraph();
}

function leaveSheet() {
  leaveReading();
  state.sheetOn = false;
  const btn = document.getElementById("sheet");
  if (btn) btn.classList.remove("active");
  const panel = document.getElementById("sheet-view");
  if (panel) {
    panel.hidden = true;
    panel.innerHTML = "";
  }
  if (!state.readingOn) showGraph();
}

function readHashId() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (!raw) return "";
  const params = new URLSearchParams(raw.includes("=") ? raw : "id=" + raw);
  return params.get("id") || "";
}

function setHashId(id) {
  const next = id ? "#id=" + encodeURIComponent(id) : "#";
  if (location.hash === next || (next === "#" && !location.hash)) return;
  history.replaceState(null, "", next === "#" ? location.pathname + location.search : next);
}

function leaveNew() {
  state.newOnly = false;
  const nb = document.getElementById("new-findings");
  if (nb) nb.classList.remove("active");
}

function deactivate(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });
}

export function clearPath(keepMode) {
  state.pathPick = null;
  state.pathRoute = null;
  state.routeKind = "";
  if (state.cy) state.cy.elements().removeClass("on-path path-end");
  if (!keepMode) {
    state.pathMode = false;
    state.loopMode = false;
    state.hingesOn = false;
    deactivate(["path", "loop", "slots", "tours", "hinges"]);
  }
}

function platonicHiddenExactly() {
  const on = checked("cluster");
  if (on.has("platonic")) return false;
  return state.allClusters.every((c) => c === "platonic" || on.has(c));
}

function paintOverlayNote() {
  const el = document.getElementById("overlay-note");
  if (!el) return;
  const lines = [];
  if (!state.view) {
    lines.push("view.json is missing. Run python tools/validate.py.");
  }
  if (state.communityOn && state.view) {
    lines.push(state.view.caption.communities);
  }
  if (state.quoteHidePlatonic && state.view && platonicHiddenExactly()) {
    const k = state.view.hidePlatonic.components;
    const noun = k === 1 ? "component" : "components";
    lines.push(
      `Platonic cluster hidden · ${k} undirected ${noun}. The success test is one component.`
    );
  } else if (state.quoteHidePlatonic && !platonicHiddenExactly()) {
    state.quoteHidePlatonic = false;
    deactivate(["hide-platonic"]);
  }
  el.hidden = lines.length === 0;
  el.textContent = lines.join(" ");
}

function paintCommunity() {
  if (!state.cy) return;
  state.cy.nodes().forEach((n) => n.toggleClass("show-community", state.communityOn));
  const btn = document.getElementById("communities");
  if (btn) btn.classList.toggle("active", state.communityOn);
}

function paintHinges() {
  if (!state.cy) return;
  state.cy.nodes().removeClass("hinge-seed hinge-other");
  if (!state.hingesOn || !state.view) return;
  (state.view.betweenness || []).forEach((row) => {
    const n = state.cy.getElementById(row.id);
    if (n.empty()) return;
    n.addClass(row.cluster === "platonic" ? "hinge-seed" : "hinge-other");
  });
}

function applyFilter() {
  const cy = state.cy;
  if (!cy) return;
  const kinds = checked("kind");
  const clusters = checked("cluster");
  const types = checked("etype");
  const q = document.getElementById("search").value.trim().toLowerCase();
  const asideIds = new Set((state.view && state.view.hidePlatonic && state.view.hidePlatonic.aside) || []);
  state.parkAside =
    state.quoteHidePlatonic &&
    platonicHiddenExactly() &&
    state.fieldMode &&
    !state.openGroup &&
    !state.focusId &&
    !state.pathRoute &&
    !q;

  const focusSet = new Set();
  if (state.focusId && cy.getElementById(state.focusId).nonempty()) {
    const seed = cy.getElementById(state.focusId);
    focusSet.add(state.focusId);
    seed.neighborhood().nodes().forEach((n) => focusSet.add(n.id()));
  }

  const pathSet = state.pathRoute ? new Set(state.pathRoute.nodes) : null;
  const pathEdgeIds = state.pathRoute ? new Set(state.pathRoute.edges.map((e) => e.id())) : null;
  const groupHome =
    state.fieldMode &&
    !state.schoolRing &&
    !state.openGroup &&
    !pathSet &&
    !focusSet.size &&
    !q;
  const groupOpen =
    state.fieldMode && !state.schoolRing && state.openGroup && !pathSet && !focusSet.size;
  const collapse = state.fieldMode && !focusSet.size && !pathSet;
  let vn = 0;
  let ve = 0;
  let vb = 0;

  cy.nodes().forEach((n) => {
    const d = n.data();
    let ok = kinds.has(d.kind) && clusters.has(d.cluster);
    if (pathSet) {
      ok = pathSet.has(d.id);
    } else if (ok && q) {
      ok = d.label.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    } else if (ok && collapse && d.kind === "principle") {
      ok = false;
    }
    if (ok && focusSet.size && !pathSet) ok = focusSet.has(d.id);
    if (groupHome) ok = false;
    if (groupOpen) {
      ok = d.kind === "system" && state.openGroup.indexOf(d.cluster) >= 0 && clusters.has(d.cluster);
    }
    if (state.parkAside && asideIds.has(d.id)) ok = true;
    if (ok && state.newOnly && collapse && d.kind === "system") {
      ok = state.newClusterSet.has(d.cluster);
    }
    n.toggleClass("bridge-end", ok && d.kind === "principle" && hasLiveBridge(n, types, clusters, kinds, false));
    n.toggleClass("loud-end", ok && d.kind === "principle" && hasLiveBridge(n, types, clusters, kinds, true));
    n.style("display", ok ? "element" : "none");
    if (ok) vn += 1;
  });

  cy.nodes('[kind = "group"]').remove();
  if (groupHome) syncGroups(types, clusters);
  else syncMetaEdges(types, groupOpen ? { only: state.openGroup, cap: false } : undefined);

  cy.edges().forEach((e) => {
    const okType = e.data("meta") ? true : types.has(e.data("type"));
    const okEnds = e.source().visible() && e.target().visible();
    let okFocus = true;
    if (pathEdgeIds) {
      okFocus = pathEdgeIds.has(e.id());
    } else if (focusSet.size) {
      okFocus = focusSet.has(e.source().id()) && focusSet.has(e.target().id());
    }
    const okScope = collapse ? !!e.data("meta") : !e.data("meta");
    const shown = okType && okEnds && okFocus && okScope;
    e.style("display", shown ? "element" : "none");
    const fb =
      shown &&
      focusSet.size &&
      (e.data("type") === "green" || e.data("type") === "red");
    e.toggleClass("feedback", fb);
    e.toggleClass("new-finding", shown && !!e.data("isNew") && state.newOnly);
    if (shown) {
      ve += 1;
      if (e.data("bridge") || e.data("meta")) vb += 1;
    }
  });

  paintPath();
  paintCommunity();
  paintHinges();
  applyLabels();
  runViewLayout();
  paintOverlayNote();

  if (state.loopMode && !state.pathRoute) {
    status.textContent = "Loop: click a node to paint a cycle through it";
  } else if (state.pathMode && !state.pathRoute) {
    status.textContent = state.pathPick ? "Path: click the end node" : "Path: click the start node";
  } else if (state.pathRoute && state.loopMode) {
    status.textContent = "Loop · " + state.pathRoute.edges.length + " hops · " + loopKind(state.pathRoute);
  } else if (state.pathRoute && state.routeKind === "tour") {
    status.textContent = "Tour · illustration · " + state.pathRoute.title;
  } else if (state.pathRoute && state.routeKind === "slot") {
    status.textContent = "Slot · " + state.pathRoute.title;
  } else if (state.pathRoute) {
    status.textContent =
      "Path · " +
      (state.pathRoute.nodes.length - 1) +
      " hops · " +
      (state.pathRoute.followArrows ? "follows arrows" : "undirected only");
  } else {
    const latestBit =
      state.latestMeta.pass && state.newEdgeCount
        ? " · " + state.newEdgeCount + " new (" + state.latestMeta.pass + ")"
        : "";
    if (groupHome) vn = cy.nodes('[kind = "group"]').length + cy.nodes(".aside-stub:visible").length;
    const groupBit = groupHome ? " · groups" : groupOpen ? " · group" : "";
    const heavyBit =
      !groupHome && !groupOpen && state.heavyPairs && state.fieldMode && !state.focusId && !state.pathRoute
        ? " · heavy"
        : "";
    status.textContent =
      vn + " nodes · " + ve + " edges · " + vb + " bridges" + groupBit + heavyBit + latestBit;
  }
}

function openJump(nodeId, edgeId) {
  const cy = state.cy;
  if (!cy || !nodeId) return;
  const node = cy.getElementById(nodeId);
  if (node.empty()) return;
  revealNode(nodeId);
  clearPath(false);
  state.focusId = nodeId;
  document.getElementById("help").classList.remove("active");
  document.getElementById("findings").classList.remove("active");
  setHashId(nodeId);
  applyFilter();
  if (edgeId) {
    const edge = cy.getElementById(edgeId);
    if (!edge.empty()) {
      cy.elements().unselect();
      edge.select();
      showEdge(edge.data());
      return;
    }
  }
  showNode(node.data());
}

function revealNode(nodeId) {
  const node = state.cy.getElementById(nodeId);
  if (node.empty()) return;
  const kind = node.data("kind");
  const cluster = node.data("cluster");
  document.querySelectorAll("input[data-kind]").forEach((el) => {
    if (el.dataset.kind === "kind" && el.value === kind) el.checked = true;
    if (el.dataset.kind === "cluster" && el.value === cluster) el.checked = true;
  });
  if (cluster === "platonic") {
    state.quoteHidePlatonic = false;
    deactivate(["hide-platonic"]);
  }
}

function openFromSheet(nodeId) {
  const node = state.cy && state.cy.getElementById(nodeId);
  if (!node || node.empty()) return;
  leaveSheet();
  leaveReading();
  clearPath(false);
  leaveNew();
  state.fieldMode = true;
  state.lateralOnly = false;
  setChecks("etype", () => true);
  state.schoolRing = false;
  state.openGroup = null;
  state.heavyPairs = true;
  document.getElementById("field").classList.add("active");
  deactivate(["open-interiors", "laterals", "all-pairs", "heavy-pairs", "reading"]);
  revealNode(nodeId);
  openJump(nodeId);
}

function restoreGraphMode() {
  if (state.sheetOn || state.readingOn) return;
  if (state.fieldMode) document.getElementById("field").classList.add("active");
  else document.getElementById("open-interiors").classList.add("active");
  if (state.schoolRing && state.heavyPairs) document.getElementById("heavy-pairs").classList.add("active");
  if (state.schoolRing && !state.heavyPairs) document.getElementById("all-pairs").classList.add("active");
}

function closeSheetToGraph() {
  leaveSheet();
  leaveReading();
  restoreGraphMode();
  applyFilter();
  showGuide();
}

function edgesAmong(ids, pred) {
  const want = new Set(ids);
  const found = [];
  state.cy.edges().forEach((e) => {
    if (e.data("meta")) return;
    if (!want.has(e.source().id()) || !want.has(e.target().id())) return;
    if (pred && !pred(e)) return;
    found.push(e);
  });
  return found;
}

function openReading(kind, row) {
  clearPath(false);
  state.focusId = null;
  setHashId("");
  deactivate(["help", "findings", "path", "loop", "hinges"]);
  document.getElementById(kind === "tour" ? "tours" : "slots").classList.add("active");
  state.routeKind = kind;
  state.pathRoute = {
    nodes: row.nodes || row.members,
    edges:
      kind === "slot"
        ? edgesAmong(row.members, (e) => e.data("type") === "gold" || e.data("type") === "cyan" || e.data("type") === "magenta")
        : edgesAmong(row.nodes),
    title: row.title || row.label,
    sentence: row.sentence || row.gloss,
    followArrows: false
  };
  applyFilter();
  showReading();
}

function applyHash() {
  const id = readHashId();
  if (!id || !state.cy) return false;
  const node = state.cy.getElementById(id);
  if (node.empty()) return false;
  clearPath(false);
  state.focusId = id;
  document.getElementById("help").classList.remove("active");
  document.getElementById("findings").classList.remove("active");
  applyFilter();
  showNode(node.data());
  return true;
}

function graphStyle() {
  return [
    {
      selector: "node",
      style: {
        label: "",
        color: "#f4efe4",
        "font-size": 11,
        "font-family": "Segoe UI, Georgia, serif",
        "text-wrap": "wrap",
        "text-max-width": 120,
        "text-valign": "center",
        "text-halign": "center",
        "text-outline-width": 0,
        "min-zoomed-font-size": 6,
        "text-events": "no",
        shape: "round-rectangle",
        width: (el) => Math.min(150, Math.max(56, String(el.data("label") || "").length * 7.2 + 18)),
        height: 28,
        padding: "4px",
        "background-color": (el) => clusterColor(el.data("cluster")),
        "border-width": 1,
        "border-color": "#111"
      }
    },
    {
      selector: "node[kind = 'system']",
      style: {
        height: 36,
        "font-size": 13,
        "font-weight": 600,
        "text-max-width": 150,
        "border-width": 2,
        "border-color": "#f2e6b8"
      }
    },
    {
      selector: "node[kind = 'group']",
      style: {
        shape: "round-rectangle",
        height: 52,
        width: (el) => Math.min(200, Math.max(110, String(el.data("label") || "").length * 7.4 + 36)),
        "font-size": 13,
        "font-weight": 600,
        "text-max-width": 170,
        "background-color": "#2c2822",
        "border-width": 2,
        "border-color": "#f2e6b8",
        color: "#f4efe4",
        "text-valign": "center",
        "text-halign": "center"
      }
    },
    {
      selector: "node.bridge-end",
      style: { "border-color": "#ece6d8", "border-width": 2 }
    },
    {
      selector: "node.show-community",
      style: {
        "border-width": 5,
        "border-color": (el) => communityColor(el.data("community"))
      }
    },
    {
      selector: "node[kind = 'system'].show-community",
      style: {
        "border-width": 5,
        "border-color": (el) => communityColor(el.data("community"))
      }
    },
    { selector: "node.label-on", style: { label: "data(label)" } },
    {
      selector: "node.hovered",
      style: { "border-color": "#fff", "border-width": 2 }
    },
    {
      selector: "edge",
      style: {
        width: 1.6,
        "line-color": (el) => EDGE_COLOR[el.data("type")] || "#666",
        "target-arrow-color": (el) => EDGE_COLOR[el.data("type")] || "#666",
        "source-arrow-color": (el) => EDGE_COLOR[el.data("type")] || "#666",
        "target-arrow-shape": "triangle",
        "source-arrow-shape": (el) => (el.data("directed") ? "none" : "triangle"),
        "arrow-scale": 1.15,
        "curve-style": "bezier",
        opacity: 0.78
      }
    },
    { selector: "edge.bridge", style: { opacity: 0.95, width: 2.2, "arrow-scale": 1.25 } },
    { selector: "edge.faint", style: { opacity: 0.16, width: 0.7 } },
    {
      selector: "edge.meta",
      style: {
        width: (el) => chordWidth(el.data("count")),
        "line-color": "#d9d3c7",
        "target-arrow-shape": "none",
        "source-arrow-shape": "none",
        "curve-style": "straight",
        opacity: (el) => Math.min(0.95, 0.22 + 0.045 * (el.data("count") || 1)),
        label: "data(short)",
        color: "#f4efe4",
        "font-size": 12,
        "font-family": "Segoe UI, Georgia, serif",
        "text-rotation": "autorotate",
        "text-wrap": "wrap",
        "text-max-width": 168,
        "text-background-color": "#141414",
        "text-background-opacity": 0.9,
        "text-background-padding": "3px",
        "min-zoomed-font-size": 8,
        "z-index": (el) => el.data("count") || 1
      }
    },
    {
      selector: "node.on-path",
      style: { label: "data(label)", "border-color": "#fff", "border-width": 2, "z-index": 20 }
    },
    { selector: "node.path-end", style: { "border-width": 3, "border-color": "#fff" } },
    {
      selector: "edge.new-finding",
      style: { opacity: 1, width: 3, "arrow-scale": 1.45, "z-index": 16 }
    },
    {
      selector: "edge.feedback",
      style: { opacity: 1, width: 3.2, "arrow-scale": 1.45, "z-index": 15 }
    },
    {
      selector: "edge.on-path",
      style: { opacity: 1, width: 4, "arrow-scale": 1.6, "z-index": 20 }
    },
    {
      selector: "node.hinge-seed",
      style: {
        "outline-width": 2,
        "outline-style": "dashed",
        "outline-color": "#f4efe4",
        "outline-offset": 2
      }
    },
    {
      selector: "node.hinge-other",
      style: {
        "outline-width": 2,
        "outline-style": "solid",
        "outline-color": "#ffffff",
        "outline-offset": 2
      }
    },
    {
      selector: "node.aside-stub",
      style: {
        label: "data(label)",
        "outline-width": 2,
        "outline-style": "dashed",
        "outline-color": "#f2e6b8",
        "outline-offset": 3
      }
    },
    { selector: ":selected", style: { "border-color": "#fff", "border-width": 3, opacity: 1 } }
  ];
}

async function init() {
  let data;
  try {
    data = await loadData();
    state.latestMeta = await loadLatest();
    state.latestSet = new Set(state.latestMeta.nodes || []);
  } catch (err) {
    document.getElementById("wrap").innerHTML =
      `<div class="err"><p>Could not load YAML.</p>` +
      `<p>From the repository root:</p>` +
      `<p><code>python tools/serve.py</code></p>` +
      `<p>then open <code>http://127.0.0.1:8765/viewer/</code>.</p>` +
      `<p>${esc(err && err.message)}</p></div>`;
    return;
  }
  try {
    state.view = await loadView();
  } catch (err) {
    state.view = null;
  }

  const clusters = uniqueSorted(data.nodes.map((n) => n.cluster).filter(Boolean));
  state.allClusters = clusters;
  const kinds = uniqueSorted(data.nodes.map((n) => n.kind).filter(Boolean));
  mountChecks(document.getElementById("kind-filters"), kinds, "kind", (k) =>
    k === "system" ? "#f2e6b8" : "#888"
  );
  mountChecks(document.getElementById("cluster-filters"), clusters, "cluster", clusterColor);
  mountChecks(document.getElementById("type-filters"), ["gold", "cyan", "magenta", "green", "red", "orange"], "etype", (t) => EDGE_COLOR[t]);
  mountLegend();

  state.cy = globalThis.cytoscape({
    container: document.getElementById("cy"),
    elements: toElements(data.nodes, data.edges, state.view && state.view.communities),
    layout: { name: "preset", fit: false, padding: 60 },
    autoungrabify: true,
    minZoom: 0.08,
    maxZoom: 3.5,
    textureOnViewport: false,
    hideEdgesOnViewport: false,
    style: graphStyle()
  });

  const cy = state.cy;
  cy.on("tap", "node", (evt) => {
    const id = evt.target.id();
    if (state.loopMode) {
      state.pathPick = null;
      state.pathRoute = bestLoop(id);
      state.routeKind = state.pathRoute ? "loop" : "";
      state.focusId = null;
      applyFilter();
      document.getElementById("help").classList.remove("active");
      if (state.pathRoute) showLoop(loopKind);
      else {
        document.getElementById("detail").innerHTML =
          `<p class="empty">No short cycle through ${esc(evt.target.data("label") || id)}.</p>`;
      }
      return;
    }
    if (state.pathMode) {
      if (!state.pathPick) {
        state.pathPick = id;
        state.pathRoute = null;
        applyFilter();
        return;
      }
      if (state.pathPick === id) {
        status.textContent = "Path: pick a different end node";
        return;
      }
      state.pathRoute = findRoute(state.pathPick, id);
      state.routeKind = state.pathRoute ? "path" : "";
      state.pathPick = null;
      state.focusId = null;
      applyFilter();
      document.getElementById("help").classList.remove("active");
      if (state.pathRoute) showTrajectory();
      else {
        document.getElementById("detail").innerHTML =
          `<p class="empty">No route between those nodes on the current filters.</p>`;
      }
      return;
    }
    if (state.routeKind === "tour" || state.routeKind === "slot") clearPath(false);
    if (evt.target.data("kind") === "group") {
      state.openGroup = (evt.target.data("clusters") || []).slice();
      state.focusId = null;
      setHashId("");
      document.getElementById("help").classList.remove("active");
      document.getElementById("findings").classList.remove("active");
      showOpenedGroup(state.openGroup, evt.target.data("label"));
      applyFilter();
      return;
    }
    state.focusId = id;
    document.getElementById("help").classList.remove("active");
    document.getElementById("findings").classList.remove("active");
    setHashId(id);
    showNode(evt.target.data());
    applyFilter();
  });
  cy.on("tap", "edge", (evt) => showEdge(evt.target.data()));
  const hoverReadout = document.getElementById("hover-readout");
  function showHover(text) {
    if (!hoverReadout) return;
    if (!text) {
      hoverReadout.hidden = true;
      hoverReadout.textContent = "";
      return;
    }
    hoverReadout.hidden = false;
    hoverReadout.textContent = text;
  }
  cy.on("mouseover", "edge", (evt) => {
    const d = evt.target.data();
    if (d.meta) showHover(d.full || d.mix || "");
    else showHover((d.type || "") + (d.note ? " · " + d.note : ""));
  });
  cy.on("mouseout", "edge", () => showHover(""));
  cy.on("tap", (evt) => {
    if (evt.target === cy) {
      if (state.focusId && state.openGroup && !state.pathMode && !state.loopMode) {
        state.focusId = null;
        setHashId("");
        applyFilter();
        showOpenedGroup(state.openGroup);
        return;
      }
      if (state.openGroup && !state.schoolRing && !state.pathMode && !state.loopMode) {
        state.openGroup = null;
        state.focusId = null;
        setHashId("");
        applyFilter();
        showGuide();
        return;
      }
      state.focusId = null;
      if (!state.pathMode && !state.loopMode) clearPath(true);
      if (state.routeKind === "tour" || state.routeKind === "slot") clearPath(false);
      setHashId("");
      document.getElementById("findings").classList.remove("active");
      applyFilter();
      if (!state.pathRoute) showGuide();
    }
  });
  cy.on("mouseover", "node", (evt) => {
    evt.target.addClass("hovered");
    const d = evt.target.data();
    if (d.kind === "group") showHover((d.label || "") + (d.description ? " · " + d.description : ""));
  });
  cy.on("mouseout", "node", (evt) => {
    evt.target.removeClass("hovered");
    showHover("");
  });
  cy.on("zoom pan", applyLabelsSoon);

  document.getElementById("help").addEventListener("click", () => {
    leaveSheet();
    state.focusId = null;
    clearPath(false);
    document.getElementById("findings").classList.remove("active");
    applyFilter();
    showGuide();
  });
  document.getElementById("findings").addEventListener("click", () => {
    leaveSheet();
    state.focusId = null;
    clearPath(false);
    setHashId("");
    applyFilter();
    showFindings();
  });
  document.getElementById("new-findings").addEventListener("click", () => {
    leaveSheet();
    if (!state.latestSet.size) return;
    state.newOnly = !state.newOnly;
    document.getElementById("new-findings").classList.toggle("active", state.newOnly);
    if (state.newOnly) {
      setChecks("etype", () => true);
      document.getElementById("laterals").classList.remove("active");
      state.lateralOnly = false;
    }
    applyFilter();
    showFindings();
  });
  document.getElementById("detail").addEventListener("click", (ev) => {
    const slotBtn = ev.target.closest("[data-slot]");
    if (slotBtn) {
      const row = ((state.view && state.view.slots) || []).find((s) => s.id === slotBtn.getAttribute("data-slot"));
      if (row) openReading("slot", row);
      return;
    }
    const tourBtn = ev.target.closest("[data-tour]");
    if (tourBtn) {
      const row = ((state.view && state.view.tours) || []).find((t) => t.id === tourBtn.getAttribute("data-tour"));
      if (row) openReading("tour", row);
      return;
    }
    const btn = ev.target.closest("button.jump");
    if (!btn) return;
    openJump(btn.getAttribute("data-jump"), btn.getAttribute("data-edge"));
  });
  window.addEventListener("hashchange", () => {
    leaveSheet();
    if (!applyHash()) {
      state.focusId = null;
      applyFilter();
      showGuide();
    }
  });
  document.getElementById("search").addEventListener("input", () => {
    clearTimeout(state.searchTick);
    state.searchTick = setTimeout(applyFilter, 80);
  });
  document.getElementById("labels").addEventListener("change", applyLabels);
  document.getElementById("field").addEventListener("click", () => {
    leaveSheet();
    leaveReading();
    clearPath(false);
    state.focusId = null;
    leaveNew();
    state.fieldMode = true;
    state.lateralOnly = false;
    setChecks("etype", () => true);
    state.schoolRing = false;
    state.openGroup = null;
    state.heavyPairs = true;
    document.getElementById("field").classList.add("active");
    deactivate(["open-interiors", "laterals", "all-pairs", "heavy-pairs"]);
    applyFilter();
    showGuide();
  });
  document.getElementById("open-interiors").addEventListener("click", () => {
    leaveSheet();
    leaveReading();
    clearPath(false);
    state.fieldMode = false;
    setChecks("etype", () => true);
    document.getElementById("open-interiors").classList.add("active");
    deactivate(["field", "laterals"]);
    state.lateralOnly = false;
    applyFilter();
  });
  document.getElementById("clusters-all").addEventListener("click", () => {
    state.quoteHidePlatonic = false;
    deactivate(["hide-platonic"]);
    setChecks("cluster", () => true);
    applyFilter();
  });
  document.getElementById("clusters-none").addEventListener("click", () => {
    state.quoteHidePlatonic = false;
    deactivate(["hide-platonic"]);
    setChecks("cluster", () => false);
    applyFilter();
  });
  document.getElementById("laterals").addEventListener("click", () => {
    state.lateralOnly = true;
    setChecks("etype", (v) => LATERALS.has(v));
    document.getElementById("laterals").classList.add("active");
    applyFilter();
  });
  document.getElementById("all-edges").addEventListener("click", () => {
    state.lateralOnly = false;
    setChecks("etype", () => true);
    document.getElementById("laterals").classList.remove("active");
    applyFilter();
  });
  document.getElementById("heavy-pairs").addEventListener("click", () => {
    leaveSheet();
    leaveReading();
    state.schoolRing = true;
    state.openGroup = null;
    state.fieldMode = true;
    state.heavyPairs = true;
    document.getElementById("heavy-pairs").classList.add("active");
    document.getElementById("field").classList.add("active");
    document.getElementById("all-pairs").classList.remove("active");
    document.getElementById("open-interiors").classList.remove("active");
    applyFilter();
  });
  document.getElementById("all-pairs").addEventListener("click", () => {
    leaveSheet();
    leaveReading();
    state.schoolRing = true;
    state.openGroup = null;
    state.fieldMode = true;
    state.heavyPairs = false;
    document.getElementById("all-pairs").classList.add("active");
    document.getElementById("field").classList.add("active");
    document.getElementById("heavy-pairs").classList.remove("active");
    document.getElementById("open-interiors").classList.remove("active");
    applyFilter();
  });
  document.getElementById("slots").addEventListener("click", () => {
    leaveSheet();
    state.focusId = null;
    clearPath(false);
    setHashId("");
    document.getElementById("slots").classList.add("active");
    applyFilter();
    showSlots();
  });
  document.getElementById("tours").addEventListener("click", () => {
    leaveSheet();
    state.focusId = null;
    clearPath(false);
    setHashId("");
    document.getElementById("tours").classList.add("active");
    applyFilter();
    showTours();
  });
  document.getElementById("hinges").addEventListener("click", () => {
    leaveSheet();
    state.focusId = null;
    clearPath(false);
    setHashId("");
    state.hingesOn = true;
    document.getElementById("hinges").classList.add("active");
    applyFilter();
    showHinges();
  });
  document.getElementById("communities").addEventListener("click", () => {
    leaveSheet();
    leaveReading();
    restoreGraphMode();
    state.communityOn = !state.communityOn;
    applyFilter();
  });
  document.getElementById("hide-platonic").addEventListener("click", () => {
    leaveSheet();
    leaveReading();
    restoreGraphMode();
    setChecks("cluster", (v) => v !== "platonic");
    state.quoteHidePlatonic = true;
    document.getElementById("hide-platonic").classList.add("active");
    applyFilter();
  });
  document.getElementById("clear-focus").addEventListener("click", () => {
    leaveSheet();
    state.focusId = null;
    clearPath(false);
    leaveNew();
    cy.elements().unselect();
    setHashId("");
    document.getElementById("findings").classList.remove("active");
    applyFilter();
    showGuide();
  });
  document.getElementById("fit").addEventListener("click", () => {
    leaveSheet();
    cy.fit(cy.elements(":visible"), 30);
  });
  document.getElementById("sheet").addEventListener("click", () => {
    if (state.sheetOn) {
      closeSheetToGraph();
      return;
    }
    leaveReading();
    clearPath(false);
    state.focusId = null;
    setHashId("");
    state.sheetOn = true;
    document.getElementById("sheet").classList.add("active");
    deactivate([
      "field",
      "open-interiors",
      "heavy-pairs",
      "all-pairs",
      "slots",
      "tours",
      "hinges",
      "help",
      "findings",
      "reading"
    ]);
    document.getElementById("cy").classList.add("off");
    renderSheet(document.getElementById("sheet-view"));
    status.textContent = "Sheet · comparison, not a spine";
  });
  document.getElementById("sheet-view").addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-jump]");
    if (!btn) return;
    openFromSheet(btn.getAttribute("data-jump"));
  });
  document.getElementById("reading").addEventListener("click", () => {
    if (state.readingOn) {
      document.getElementById("field").click();
      return;
    }
    leaveSheet();
    clearPath(false);
    state.focusId = null;
    setHashId("");
    state.readingOn = true;
    document.getElementById("reading").classList.add("active");
    deactivate([
      "field",
      "open-interiors",
      "heavy-pairs",
      "all-pairs",
      "slots",
      "tours",
      "hinges",
      "help",
      "findings",
      "sheet"
    ]);
    document.getElementById("cy").classList.add("off");
    const panel = document.getElementById("reading-view");
    panel.hidden = false;
    renderReading(panel);
    status.textContent = "Reading · one origin";
  });
  document.getElementById("reading-view").addEventListener("click", (ev) => {
    const tab = ev.target.closest("[data-reading]");
    if (tab) return;
    const btn = ev.target.closest("[data-jump]");
    if (!btn) return;
    openFromSheet(btn.getAttribute("data-jump"));
  });
  document.getElementById("legend-toggle").addEventListener("click", () => {
    const box = document.getElementById("legend");
    const collapsed = box.classList.toggle("collapsed");
    document.getElementById("legend-toggle").setAttribute("aria-expanded", collapsed ? "false" : "true");
  });

  document.querySelectorAll("input[type=checkbox]").forEach((el) => {
    el.addEventListener("change", (ev) => {
      if (ev.target.dataset.kind === "cluster" && state.quoteHidePlatonic && !platonicHiddenExactly()) {
        state.quoteHidePlatonic = false;
        deactivate(["hide-platonic"]);
      }
      applyFilter();
    });
  });

  markBridges();
  setChecks("etype", () => true);
  if (!state.latestSet.size) {
    const nb = document.getElementById("new-findings");
    if (nb) nb.hidden = true;
  }
  applyFilter();
  if (!applyHash()) showGuide();
}

init();
