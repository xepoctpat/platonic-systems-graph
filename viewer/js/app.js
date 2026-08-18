const EDGE_COLOR = {
  gold: "#c9a227",
  cyan: "#3ec1d3",
  magenta: "#d4539b",
  green: "#3fa36a",
  red: "#d4544a",
  orange: "#d47a2c"
};

const CLUSTER_COLOR = {
  platonic: "#e0b84e",
  pythagorean: "#c4a060",
  gnostic: "#c45ad4",
  hermetic: "#7ec8e3",
  neoplatonic: "#d4a24c",
  kabbalistic: "#6b8ee8",
  "jewish-mystical": "#5a6ec4",
  alchemical: "#d4c07a",
  scientific: "#5b8def",
  christian: "#e8e0c8",
  biblical: "#c4b896",
  egyptian: "#d4a017",
  vedic: "#c46b2b",
  canaanite: "#7a8b6a",
  preliterate: "#8a7a62",
  hindu: "#e07a3d",
  buddhist: "#8f8fd4",
  zoroastrian: "#d4544a",
  manichaean: "#9a3048",
  mandaean: "#1f7a88",
  orphic: "#b86b6b",
  "hellenic-mystery": "#9a7a4c",
  jungian: "#9b6bdb",
  theosophical: "#7a5a9a",
  sufi: "#3fa36a",
  islamic: "#2e7a5a",
  norse: "#6a8a9a",
  mesopotamian: "#c48a4a",
  chinese: "#4a8a6a",
  mesoamerican: "#b8432a",
  yoruba: "#8a4a2a"
};

const EDGE_TYPES = ["gold", "cyan", "magenta", "green", "red", "orange"];
const LATERALS = new Set(["orange", "cyan"]);
const EDGE_MEANING = {
  gold: "constitutive / genealogy",
  cyan: "same slot, not the same thing",
  magenta: "same slot, opposite valuation",
  green: "return / integration",
  red: "fall / shattering",
  orange: "hybrid / lateral"
};
const ZOOM_SHOW_PRINCIPLES = 1.15;
const TYPE_PREF = { gold: 0, green: 1, cyan: 2, orange: 3, red: 4, magenta: 5 };

const detail = document.getElementById("detail");
const status = document.getElementById("status");

const layoutOpts = { name: "preset", fit: false, padding: 60 };

let cy = null;
let focusId = null;
let lateralOnly = false;
let fieldMode = true;
let pathMode = false;
let loopMode = false;
let pathPick = null;
let pathRoute = null;

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function clusterColor(name) {
  if (CLUSTER_COLOR[name]) return CLUSTER_COLOR[name];
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 42% 55%)`;
}

async function loadYaml(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + " → " + res.status);
  return jsyaml.load(await res.text());
}

async function loadData() {
  const tries = [
    ["../data/nodes.yaml", "../data/edges.yaml"],
    ["/data/nodes.yaml", "/data/edges.yaml"]
  ];
  let last;
  for (const [n, e] of tries) {
    try {
      const [nodesDoc, edgesDoc] = await Promise.all([loadYaml(n), loadYaml(e)]);
      return { nodes: nodesDoc.nodes, edges: edgesDoc.edges };
    } catch (err) {
      last = err;
    }
  }
  throw last;
}

function toElements(nodes, edges) {
  const els = nodes.map((n) => ({
    data: {
      id: n.id,
      label: n.label,
      kind: n.kind || "principle",
      cluster: n.cluster || "",
      role: n.role || "",
      description: n.description || "",
      refs: (n.refs || []).join(" · ")
    }
  }));
  edges.forEach((e, i) => {
    els.push({
      data: {
        id: "e" + i,
        source: e.from,
        target: e.to,
        type: e.type,
        directed: !!e.directed,
        strength: e.strength,
        versions: (e.versions || []).join(", "),
        note: e.note || ""
      }
    });
  });
  return els;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function mountLegend() {
  const nodesBox = document.getElementById("legend-nodes");
  const edgesBox = document.getElementById("legend-edges");
  if (!nodesBox || !edgesBox) return;
  nodesBox.innerHTML =
    `<div class="legend-row"><span class="legend-mark system"></span>` +
    `<span><span class="legend-name">system</span> <span class="legend-hint">a school · ring card in Field</span></span></div>` +
    `<div class="legend-row"><span class="legend-mark principle"></span>` +
    `<span><span class="legend-name">principle</span> <span class="legend-hint">appears when you open a school, Path, or Loop</span></span></div>`;
  edgesBox.innerHTML =
    `<div class="legend-row"><span class="legend-line bridge" style="border-top-color:#ece6d8"></span>` +
    `<span><span class="legend-name">bridge</span> <span class="legend-hint">Field: one line per school pair (aggregated)</span></span></div>` +
    `<div class="legend-row"><span class="legend-line interior" style="border-top-color:#ece6d8"></span>` +
    `<span><span class="legend-name">interior</span> <span class="legend-hint">same cluster · hidden in Field · Loop can open it</span></span></div>` +
    `<div class="legend-row"><span class="legend-line" style="border-top-color:#ece6d8"></span>` +
    `<span><span class="legend-name">arrow</span> <span class="legend-hint">gold/green/red = flow · cyan/magenta/orange = both ways</span></span></div>` +
    EDGE_TYPES.map((t) =>
      `<div class="legend-row"><span class="legend-line" style="border-top-color:${EDGE_COLOR[t]}"></span>` +
      `<span><span class="legend-name">${t}</span> <span class="legend-hint">${EDGE_MEANING[t]}</span></span></div>`
    ).join("");
}

function labelMode() {
  const el = document.getElementById("labels");
  return el ? el.value : "auto";
}

function markBridges() {
  if (!cy) return;
  cy.edges().forEach((e) => {
    const sc = e.source().data("cluster");
    const tc = e.target().data("cluster");
    const bridge = !!(sc && tc && sc !== tc);
    e.data("bridge", bridge);
    e.toggleClass("bridge", bridge);
    e.toggleClass("interior", !bridge);
  });
}

const LOUD_BRIDGES = new Set(["magenta", "orange", "red", "green", "gold"]);

function hasLiveBridge(n, types, clusters, kinds, loudOnly) {
  return n.connectedEdges().some((e) => {
    if (!e.data("bridge") || !types.has(e.data("type"))) return false;
    if (loudOnly && !LOUD_BRIDGES.has(e.data("type"))) return false;
    const other = e.source().id() === n.id() ? e.target() : e.source();
    const od = other.data();
    return kinds.has(od.kind) && clusters.has(od.cluster);
  });
}

function applyLabels() {
  if (!cy) return;
  const mode = labelMode();
  const zoomed = cy.zoom() >= ZOOM_SHOW_PRINCIPLES;
  const neighbourhood = !!focusId;
  cy.nodes().forEach((n) => {
    const kind = n.data("kind");
    const hovered = n.hasClass("hovered");
    const loudEnd = n.hasClass("loud-end");
    let on = false;
    if (mode === "all") on = true;
    else if (mode === "none") on = hovered;
    else if (mode === "systems") on = kind === "system" || hovered;
    else {
      on =
        hovered ||
        kind === "system" ||
        neighbourhood ||
        n.hasClass("on-path") ||
        (!fieldMode && loudEnd) ||
        (zoomed && kind === "principle" && !fieldMode);
    }
    n.toggleClass("label-on", on);
  });
  cy.edges().forEach((e) => {
    const faint = !neighbourhood && !e.data("bridge") && !e.hasClass("on-path");
    e.toggleClass("faint", faint);
  });
}

function walkableFrom(nid, ignoreDir) {
  const n = cy.getElementById(nid);
  const hops = [];
  if (n.empty()) return hops;
  n.connectedEdges().forEach((e) => {
    const src = e.source().id();
    const tgt = e.target().id();
    if (ignoreDir || !e.data("directed")) {
      hops.push({ to: src === nid ? tgt : src, edge: e });
    } else if (src === nid) {
      hops.push({ to: tgt, edge: e });
    }
  });
  return hops;
}

function collectShortest(src, dst, ignoreDir) {
  if (src === dst) return { nodes: [src], edges: [], followArrows: !ignoreDir };
  const dist = new Map([[src, 0]]);
  const prev = new Map([[src, []]]);
  const q = [src];
  while (q.length) {
    const u = q.shift();
    const du = dist.get(u);
    if (dist.has(dst) && du >= dist.get(dst)) continue;
    walkableFrom(u, ignoreDir).forEach(({ to, edge }) => {
      const nd = du + 1;
      if (!dist.has(to)) {
        dist.set(to, nd);
        prev.set(to, [{ from: u, edge }]);
        q.push(to);
      } else if (dist.get(to) === nd) {
        prev.get(to).push({ from: u, edge });
      }
    });
  }
  if (!dist.has(dst)) return null;
  const routes = [];
  function walk(cur, nodes, edges) {
    if (cur === src) {
      routes.push({ nodes: nodes.slice().reverse(), edges: edges.slice().reverse() });
      return;
    }
    (prev.get(cur) || []).forEach(({ from, edge }) => {
      walk(from, nodes.concat(from), edges.concat(edge));
    });
  }
  walk(dst, [dst], []);
  let best = routes[0];
  let bestScore = Infinity;
  routes.forEach((r) => {
    const score = r.edges.reduce((s, e) => s + (TYPE_PREF[e.data("type")] ?? 9), 0);
    if (score < bestScore) {
      best = r;
      bestScore = score;
    }
  });
  return { nodes: best.nodes, edges: best.edges, followArrows: !ignoreDir };
}

function findRoute(src, dst) {
  return collectShortest(src, dst, false) || collectShortest(src, dst, true);
}

function cycleScore(edges) {
  const types = new Set(edges.map((e) => e.data("type")));
  const mixed = types.has("green") && types.has("red");
  const feedback = types.has("green") || types.has("red");
  const allGold = edges.every((e) => e.data("type") === "gold");
  if (mixed) return 0;
  if (feedback) return 1;
  if (!allGold) return 2;
  return 3;
}

function findLoop(startId, ignoreDir) {
  const maxLen = 5;
  const found = [];
  function dfs(u, path, edges, seen) {
    if (found.length >= 16 || path.length > maxLen) return;
    walkableFrom(u, ignoreDir).forEach(({ to, edge }) => {
      if (found.length >= 16) return;
      if (to === startId && path.length >= 2) {
        found.push({
          nodes: path.concat(startId),
          edges: edges.concat(edge),
          followArrows: !ignoreDir
        });
        return;
      }
      if (seen.has(to) || path.length === maxLen) return;
      seen.add(to);
      dfs(to, path.concat(to), edges.concat(edge), seen);
      seen.delete(to);
    });
  }
  dfs(startId, [startId], [], new Set([startId]));
  if (!found.length) return null;
  found.sort((a, b) => {
    const s = cycleScore(a.edges) - cycleScore(b.edges);
    return s !== 0 ? s : a.edges.length - b.edges.length;
  });
  return found[0];
}

function bestLoop(startId) {
  return findLoop(startId, false) || findLoop(startId, true);
}

function loopKind(route) {
  if (!route) return "";
  const types = new Set(route.edges.map((e) => e.data("type")));
  if (types.has("green") && types.has("red")) return "mixed fall + return";
  if (types.has("green")) return "return / negative feedback";
  if (types.has("red")) return "fall / positive feedback";
  if (!route.followArrows) return "undirected cycle only";
  return "directed cycle";
}

function clearPath(keepMode) {
  pathPick = null;
  pathRoute = null;
  if (cy) {
    cy.elements().removeClass("on-path path-end");
  }
  if (!keepMode) {
    pathMode = false;
    loopMode = false;
    const pathBtn = document.getElementById("path");
    const loopBtn = document.getElementById("loop");
    if (pathBtn) pathBtn.classList.remove("active");
    if (loopBtn) loopBtn.classList.remove("active");
  }
}

function placeOnCircle(ids, radius) {
  const n = Math.max(ids.length, 1);
  ids.forEach((id, i) => {
    const node = cy.getElementById(id);
    if (node.empty()) return;
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    node.position({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
  });
}

function layoutOverview() {
  const systems = cy.nodes(":visible").filter((n) => n.data("kind") === "system");
  const groups = new Map();
  systems.forEach((n) => {
    const c = n.data("cluster") || "other";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(n);
  });
  const ids = [];
  [...groups.keys()].sort().forEach((c) => {
    groups.get(c).forEach((n) => ids.push(n.id()));
  });
  placeOnCircle(ids, 40 + ids.length * 18);
  cy.fit(systems, 70);
}

function layoutRadial(rootId) {
  const root = cy.getElementById(rootId);
  const vis = cy.nodes(":visible");
  if (root.empty()) {
    layoutOverview();
    return;
  }
  const depth = new Map([[rootId, 0]]);
  const q = [rootId];
  while (q.length) {
    const u = q.shift();
    const d = depth.get(u);
    if (d >= 2) continue;
    cy.getElementById(u)
      .neighborhood("node")
      .forEach((n) => {
        if (!n.visible() || depth.has(n.id())) return;
        depth.set(n.id(), d + 1);
        q.push(n.id());
      });
  }
  const rings = [[], [], []];
  vis.forEach((n) => {
    const d = Math.min(depth.has(n.id()) ? depth.get(n.id()) : 2, 2);
    rings[d].push(n);
  });
  root.position({ x: 0, y: 0 });
  rings.forEach((nodes, d) => {
    if (d === 0) return;
    const r = 70 + d * 190;
    nodes.forEach((n, i) => {
      const a = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
      n.position({ x: r * Math.cos(a), y: r * Math.sin(a) });
    });
  });
  cy.fit(vis, 70);
}

function layoutClusterRings() {
  const vis = cy.nodes(":visible");
  const groups = new Map();
  vis.forEach((n) => {
    const c = n.data("cluster") || "other";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(n);
  });
  const names = [...groups.keys()].sort();
  const R = 80 + names.length * 22;
  names.forEach((c, i) => {
    const a = (2 * Math.PI * i) / names.length - Math.PI / 2;
    const cx = R * Math.cos(a);
    const cy0 = R * Math.sin(a);
    const members = groups.get(c);
    const r = 28 + members.length * 12;
    members.forEach((n, j) => {
      if (members.length === 1) {
        n.position({ x: cx, y: cy0 });
        return;
      }
      const b = (2 * Math.PI * j) / members.length;
      n.position({ x: cx + r * Math.cos(b), y: cy0 + r * Math.sin(b) });
    });
  });
  cy.fit(vis, 60);
}

function runViewLayout() {
  if (!cy) return;
  if (pathRoute && loopMode) {
    placeOnCircle(pathRoute.nodes, 80 + pathRoute.nodes.length * 28);
    cy.fit(cy.nodes(":visible"), 80);
    return;
  }
  if (pathRoute) {
    const gap = 170;
    pathRoute.nodes.forEach((id, i) => {
      cy.getElementById(id).position({ x: i * gap, y: 0 });
    });
    cy.fit(cy.nodes(":visible"), 80);
    return;
  }
  if (focusId && cy.getElementById(focusId).visible()) {
    layoutRadial(focusId);
    return;
  }
  if (fieldMode) {
    layoutOverview();
    return;
  }
  layoutClusterRings();
}

function clusterReps() {
  const reps = new Map();
  cy.nodes().forEach((n) => {
    if (n.data("kind") !== "system" || !n.visible()) return;
    const c = n.data("cluster");
    if (!reps.has(c)) reps.set(c, n);
  });
  return reps;
}

function syncMetaEdges(types) {
  cy.edges(".meta").remove();
  const overview = fieldMode && !focusId && !pathRoute;
  if (!overview) return;
  const reps = clusterReps();
  const pairs = new Map();
  cy.edges().forEach((e) => {
    if (e.hasClass("meta") || !e.data("bridge")) return;
    const t = e.data("type");
    if (!types.has(t)) return;
    const ca = e.source().data("cluster");
    const cb = e.target().data("cluster");
    if (!ca || !cb || ca === cb) return;
    const ra = reps.get(ca);
    const rb = reps.get(cb);
    if (!ra || !rb || ra.id() === rb.id()) return;
    const key = [ra.id(), rb.id()].sort().join("||");
    const cur = pairs.get(key) || { source: ra.id(), target: rb.id(), type: t, count: 0, types: new Set() };
    cur.count += 1;
    cur.types.add(t);
    if ((TYPE_PREF[t] ?? 9) < (TYPE_PREF[cur.type] ?? 9)) cur.type = t;
    pairs.set(key, cur);
  });
  pairs.forEach((p, key) => {
    cy.add({
      group: "edges",
      classes: "meta bridge",
      data: {
        id: "meta-" + key,
        source: p.source,
        target: p.target,
        type: p.type,
        directed: false,
        strength: Math.min(1, 0.35 + p.count * 0.08),
        meta: true,
        note: p.count + " finding(s): " + [...p.types].sort().join(", "),
        versions: ""
      }
    });
  });
}

function paintPath() {
  if (!cy) return;
  cy.elements().removeClass("on-path path-end");
  if (!pathRoute) return;
  pathRoute.nodes.forEach((id, i) => {
    const n = cy.getElementById(id);
    n.addClass("on-path");
    if (i === 0 || i === pathRoute.nodes.length - 1) n.addClass("path-end");
  });
  pathRoute.edges.forEach((e) => e.addClass("on-path"));
}

function showTrajectory() {
  if (!pathRoute) return;
  const hops = pathRoute.nodes.length - 1;
  const kind = pathRoute.followArrows
    ? "follows directed flow (undirected hops either way)"
    : "no directed route — undirected map only";
  const items = [];
  pathRoute.nodes.forEach((id, i) => {
    const n = cy.getElementById(id);
    const name = n.data("label") || id;
    if (i === 0) {
      items.push(`<li><strong>${esc(name)}</strong></li>`);
      return;
    }
    const e = pathRoute.edges[i - 1];
    const t = e.data("type");
    const arrow = e.data("directed") ? "→" : "↔";
    items.push(
      `<li><span class="hop" style="color:${EDGE_COLOR[t] || "#aaa"}">${esc(t)} ${arrow}</span> ` +
        `<strong>${esc(name)}</strong></li>`
    );
  });
  detail.innerHTML =
    `<h2>Trajectory</h2>` +
    `<div class="meta">${hops} hop${hops === 1 ? "" : "s"} · ${esc(kind)}</div>` +
    `<ol class="traj">${items.join("")}</ol>` +
    `<p class="empty">This is a query overlay, not a stored spine. Click Path again to pick two other nodes.</p>`;
}

function showLoop() {
  if (!pathRoute) return;
  const hops = pathRoute.edges.length;
  const items = [];
  pathRoute.nodes.forEach((id, i) => {
    const n = cy.getElementById(id);
    const name = n.data("label") || id;
    if (i === 0) {
      items.push(`<li><strong>${esc(name)}</strong></li>`);
      return;
    }
    const e = pathRoute.edges[i - 1];
    const t = e.data("type");
    const arrow = e.data("directed") ? "→" : "↔";
    items.push(
      `<li><span class="hop" style="color:${EDGE_COLOR[t] || "#aaa"}">${esc(t)} ${arrow}</span> ` +
        `<strong>${esc(name)}</strong></li>`
    );
  });
  detail.innerHTML =
    `<h2>Loop</h2>` +
    `<div class="meta">${hops} hop${hops === 1 ? "" : "s"} · ${esc(loopKind(pathRoute))}</div>` +
    `<ol class="traj">${items.join("")}</ol>` +
    `<p class="empty">A cycle through the node you clicked. Prefer mixed green/red. Not a spine.</p>`;
}

function mountChecks(container, items, name, colorFn) {
  container.innerHTML = "";
  items.forEach((value) => {
    const label = document.createElement("label");
    label.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;
    input.dataset.kind = name;
    input.value = value;
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    if (colorFn) swatch.style.background = colorFn(value);
    label.append(input, swatch, document.createTextNode(value));
    container.appendChild(label);
  });
}

function checked(kind) {
  return new Set(
    [...document.querySelectorAll(`input[data-kind="${kind}"]:checked`)].map((el) => el.value)
  );
}

function setChecks(kind, pred) {
  document.querySelectorAll(`input[data-kind="${kind}"]`).forEach((el) => {
    el.checked = pred(el.value);
  });
}

function showGuide() {
  const help = document.getElementById("help");
  if (help) help.classList.add("active");
  detail.innerHTML =
    `<h2>How to use this</h2>` +
    `<div class="meta">Mind map · schools on a ring · no spring layout</div>` +
    `<ol class="guide">` +
    `<li><strong>Field</strong> is a ring of schools. A line between two schools means at least one finding. Click the line to see which.</li>` +
    `<li><strong>Click a school</strong> to open a radial mind map of its neighbourhood. Green/red edges thicken (feedback).</li>` +
    `<li><strong>Path</strong>, then two nodes: hops laid out left to right with arrows.</li>` +
    `<li><strong>Loop</strong>, then one node: the cycle is drawn as a circle. Prefers mixed fall + return.</li>` +
    `<li><strong>Laterals</strong> adds cyan (same-slot) lines on the school ring.</li>` +
    `<li><strong>Open interiors</strong> is cluster blossoms — still a map, not a hairball to drag apart.</li>` +
    `</ol>` +
    `<p class="empty">Paths and loops are queries, not a stored spine. YAML is the source of truth.</p>`;
}

function showNode(d) {
  const role = d.role ? ` · ${d.role}` : "";
  detail.innerHTML =
    `<h2>${esc(d.label)}</h2>` +
    `<div class="meta"><code>${esc(d.id)}</code> · ${esc(d.kind)} · ${esc(d.cluster)}${esc(role)}</div>` +
    `<p>${esc((d.description || "").trim())}</p>` +
    (d.refs ? `<div class="refs">${esc(d.refs)}</div>` : "") +
    `<p class="empty">Neighbourhood focused. Click the canvas or Clear focus to reset.</p>`;
}

function showEdge(d) {
  if (d.meta) {
    detail.innerHTML =
      `<h2>Between schools</h2>` +
      `<div class="meta"><code>${esc(d.source)}</code> ↔ <code>${esc(d.target)}</code> · ${esc(d.type)}</div>` +
      `<p>${esc(d.note)}</p>` +
      `<p class="empty">Aggregated finding. Click a school to open the actual principle-level edges.</p>`;
    return;
  }
  const span = d.bridge ? "bridge" : "interior";
  detail.innerHTML =
    `<h2>${esc(d.type)} ${span}</h2>` +
    `<div class="meta"><code>${esc(d.source)}</code> → <code>${esc(d.target)}</code>` +
    ` · strength ${esc(String(d.strength))}` +
    (d.directed ? "" : " · undirected") +
    ` · ${span}` +
    `</div>` +
    `<p>${esc(d.note)}</p>` +
    `<div class="refs">versions: ${esc(d.versions || "—")}</div>`;
}

function applyFilter() {
  if (!cy) return;
  const kinds = checked("kind");
  const clusters = checked("cluster");
  const types = checked("etype");
  const q = document.getElementById("search").value.trim().toLowerCase();

  const focusSet = new Set();
  if (focusId && cy.getElementById(focusId).nonempty()) {
    const seed = cy.getElementById(focusId);
    focusSet.add(focusId);
    seed.neighborhood().nodes().forEach((n) => focusSet.add(n.id()));
  }

  const pathSet = pathRoute ? new Set(pathRoute.nodes) : null;
  const pathEdgeIds = pathRoute ? new Set(pathRoute.edges.map((e) => e.id())) : null;
  const collapse = fieldMode && !focusSet.size && !pathSet;

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
    if (ok && focusSet.size) ok = focusSet.has(d.id);
    n.toggleClass("bridge-end", ok && d.kind === "principle" && hasLiveBridge(n, types, clusters, kinds, false));
    n.toggleClass("loud-end", ok && d.kind === "principle" && hasLiveBridge(n, types, clusters, kinds, true));
    n.style("display", ok ? "element" : "none");
  });

  syncMetaEdges(types);

  cy.edges().forEach((e) => {
    const okType = types.has(e.data("type"));
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
  });

  paintPath();
  applyLabels();
  runViewLayout();
  const vn = cy.nodes(":visible").length;
  const ve = cy.edges(":visible").length;
  const vb = cy.edges(":visible").filter((e) => e.data("bridge")).length;
  if (loopMode && !pathRoute) {
    status.textContent = "Loop: click a node to paint a cycle through it";
  } else if (pathMode && !pathRoute) {
    status.textContent = pathPick
      ? "Path: click the end node"
      : "Path: click the start node";
  } else if (pathRoute && loopMode) {
    status.textContent = "Loop · " + pathRoute.edges.length + " hops · " + loopKind(pathRoute);
  } else if (pathRoute) {
    status.textContent =
      "Path · " +
      (pathRoute.nodes.length - 1) +
      " hops · " +
      (pathRoute.followArrows ? "follows arrows" : "undirected only");
  } else {
    status.textContent = vn + " nodes · " + ve + " edges · " + vb + " bridges";
  }
}

function bindFilterChanges() {
  document.querySelectorAll("input[type=checkbox]").forEach((el) => {
    el.addEventListener("change", applyFilter);
  });
}

async function init() {
  let data;
  try {
    data = await loadData();
  } catch (err) {
    document.getElementById("wrap").innerHTML =
      `<div class="err"><p>Could not load YAML.</p>` +
      `<p>From the repository root:</p>` +
      `<p><code>python tools/serve.py</code></p>` +
      `<p>then open <code>http://127.0.0.1:8765/viewer/</code>.</p>` +
      `<p>${esc(err && err.message)}</p></div>`;
    return;
  }

  const clusters = uniqueSorted(data.nodes.map((n) => n.cluster).filter(Boolean));
  const kinds = uniqueSorted(data.nodes.map((n) => n.kind).filter(Boolean));
  mountChecks(
    document.getElementById("kind-filters"),
    kinds,
    "kind",
    (k) => (k === "system" ? "#f2e6b8" : "#888")
  );
  mountChecks(document.getElementById("cluster-filters"), clusters, "cluster", clusterColor);
  mountChecks(document.getElementById("type-filters"), EDGE_TYPES, "etype", (t) => EDGE_COLOR[t]);
  mountLegend();

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: toElements(data.nodes, data.edges),
    layout: layoutOpts,
    autoungrabify: true,
    minZoom: 0.08,
    maxZoom: 3.5,
    wheelSensitivity: 0.28,
    textureOnViewport: true,
    hideEdgesOnViewport: false,
    style: [
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
        selector: "node.bridge-end",
        style: {
          width: 15,
          height: 15,
          "border-color": "#ece6d8",
          "border-width": 1.5
        }
      },
      {
        selector: "node.label-on",
        style: { label: "data(label)" }
      },
      {
        selector: "node.hovered",
        style: {
          label: "data(label)",
          "border-color": "#fff",
          "border-width": 2,
          "z-index": 10
        }
      },
      {
        selector: "edge",
        style: {
          width: (el) => 0.8 + 1.8 * (el.data("strength") || 0.5),
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
      {
        selector: "edge.bridge",
        style: {
          opacity: 0.95,
          width: (el) => 1.2 + 2.2 * (el.data("strength") || 0.5),
          "arrow-scale": 1.25
        }
      },
      {
        selector: "edge.meta",
        style: {
          width: (el) => 1.4 + 2.4 * (el.data("strength") || 0.5),
          opacity: 0.9,
          "arrow-scale": 1.3
        }
      },
      {
        selector: "edge.faint",
        style: { opacity: 0.16, width: (el) => 0.35 + 0.9 * (el.data("strength") || 0.5) }
      },
      {
        selector: "node.on-path",
        style: {
          label: "data(label)",
          "border-color": "#fff",
          "border-width": 2,
          "z-index": 20
        }
      },
      {
        selector: "node.path-end",
        style: { width: 22, height: 22, "border-width": 3 }
      },
      {
        selector: "edge.feedback",
        style: {
          opacity: 1,
          width: 3.2,
          "arrow-scale": 1.45,
          "z-index": 15
        }
      },
      {
        selector: "edge.on-path",
        style: {
          opacity: 1,
          width: 4,
          "arrow-scale": 1.6,
          "z-index": 20
        }
      },
      {
        selector: ":selected",
        style: { "border-color": "#fff", "border-width": 3, opacity: 1 }
      }
    ]
  });

  cy.on("tap", "node", (evt) => {
    const id = evt.target.id();
    if (loopMode) {
      pathPick = null;
      pathRoute = bestLoop(id);
      focusId = null;
      applyFilter();
      document.getElementById("help").classList.remove("active");
      if (pathRoute) showLoop();
      else {
        detail.innerHTML =
          `<p class="empty">No short cycle through ${esc(evt.target.data("label") || id)}.</p>`;
      }
      return;
    }
    if (pathMode) {
      if (!pathPick) {
        pathPick = id;
        pathRoute = null;
        applyFilter();
        return;
      }
      if (pathPick === id) {
        status.textContent = "Path: pick a different end node";
        return;
      }
      pathRoute = findRoute(pathPick, id);
      pathPick = null;
      focusId = null;
      applyFilter();
      document.getElementById("help").classList.remove("active");
      if (pathRoute) showTrajectory();
      else {
        detail.innerHTML =
          `<p class="empty">No route between those nodes on the current filters.</p>`;
      }
      return;
    }
    focusId = id;
    document.getElementById("help").classList.remove("active");
    showNode(evt.target.data());
    applyFilter();
  });
  cy.on("tap", "edge", (evt) => showEdge(evt.target.data()));
  cy.on("tap", (evt) => {
    if (evt.target === cy) {
      focusId = null;
      if (!pathMode && !loopMode) clearPath(true);
      applyFilter();
      if (!pathRoute) showGuide();
    }
  });

  cy.on("mouseover", "node", (evt) => {
    evt.target.addClass("hovered");
    applyLabels();
  });
  cy.on("mouseout", "node", (evt) => {
    evt.target.removeClass("hovered");
    applyLabels();
  });
  cy.on("zoom pan", applyLabels);

  document.getElementById("help").addEventListener("click", () => {
    focusId = null;
    if (!pathMode && !loopMode) clearPath(true);
    applyFilter();
    showGuide();
  });
  document.getElementById("search").addEventListener("input", applyFilter);
  document.getElementById("labels").addEventListener("change", applyLabels);
  document.getElementById("field").addEventListener("click", () => {
    fieldMode = true;
    lateralOnly = false;
    setChecks("etype", (v) => v !== "cyan");
    document.getElementById("field").classList.add("active");
    document.getElementById("open-interiors").classList.remove("active");
    document.getElementById("laterals").classList.remove("active");
    applyFilter();
  });
  document.getElementById("open-interiors").addEventListener("click", () => {
    fieldMode = false;
    setChecks("etype", () => true);
    document.getElementById("open-interiors").classList.add("active");
    document.getElementById("field").classList.remove("active");
    document.getElementById("laterals").classList.remove("active");
    applyFilter();
  });
  document.getElementById("clusters-all").addEventListener("click", () => {
    setChecks("cluster", () => true);
    applyFilter();
  });
  document.getElementById("clusters-none").addEventListener("click", () => {
    setChecks("cluster", () => false);
    applyFilter();
  });
  document.getElementById("path").addEventListener("click", () => {
    if (pathMode && pathRoute) {
      clearPath(false);
      applyFilter();
      return;
    }
    pathMode = !pathMode;
    loopMode = false;
    pathPick = null;
    pathRoute = null;
    focusId = null;
    document.getElementById("path").classList.toggle("active", pathMode);
    document.getElementById("loop").classList.remove("active");
    if (cy) cy.elements().removeClass("on-path path-end");
    applyFilter();
  });
  document.getElementById("loop").addEventListener("click", () => {
    if (loopMode && pathRoute) {
      clearPath(false);
      applyFilter();
      return;
    }
    loopMode = !loopMode;
    pathMode = false;
    pathPick = null;
    pathRoute = null;
    focusId = null;
    document.getElementById("loop").classList.toggle("active", loopMode);
    document.getElementById("path").classList.remove("active");
    if (cy) cy.elements().removeClass("on-path path-end");
    applyFilter();
  });
  document.getElementById("laterals").addEventListener("click", () => {
    lateralOnly = true;
    setChecks("etype", (v) => LATERALS.has(v));
    document.getElementById("laterals").classList.add("active");
    applyFilter();
  });
  document.getElementById("all-edges").addEventListener("click", () => {
    lateralOnly = false;
    setChecks("etype", () => true);
    document.getElementById("laterals").classList.remove("active");
    applyFilter();
  });
  document.getElementById("clear-focus").addEventListener("click", () => {
    focusId = null;
    clearPath(false);
    cy.elements().unselect();
    applyFilter();
    showGuide();
  });
  document.getElementById("fit").addEventListener("click", () => {
    cy.fit(cy.elements(":visible"), 30);
  });
  document.getElementById("relayout").addEventListener("click", () => {
    runViewLayout();
  });

  document.getElementById("legend-toggle").addEventListener("click", () => {
    const box = document.getElementById("legend");
    const collapsed = box.classList.toggle("collapsed");
    document.getElementById("legend-toggle").setAttribute("aria-expanded", collapsed ? "false" : "true");
  });

  markBridges();
  setChecks("etype", (v) => v !== "cyan");
  bindFilterChanges();
  applyFilter();
  showGuide();
}

init();
