import {
  EDGE_TYPES,
  FINDING_ORDER,
  LOUD_BRIDGES,
  TYPE_PREF,
  mixLabel
} from "./data.js";
import { state } from "./state.js";

export function labelMode() {
  const el = document.getElementById("labels");
  return el ? el.value : "auto";
}

export function markBridges() {
  const cy = state.cy;
  if (!cy) return;
  state.newEdgeCount = 0;
  state.newClusterSet = new Set();
  cy.edges().forEach((e) => {
    if (e.data("meta")) return;
    const sc = e.source().data("cluster");
    const tc = e.target().data("cluster");
    const bridge = !!(sc && tc && sc !== tc);
    const neu = state.latestSet.has(e.source().id()) || state.latestSet.has(e.target().id());
    e.data("bridge", bridge);
    e.data("isNew", neu);
    e.toggleClass("bridge", bridge);
    e.toggleClass("interior", !bridge);
    if (neu) {
      state.newEdgeCount += 1;
      if (bridge) {
        state.newClusterSet.add(sc);
        state.newClusterSet.add(tc);
      }
    }
  });
  state.latestSet.forEach((id) => {
    const n = cy.getElementById(id);
    if (!n.empty()) state.newClusterSet.add(n.data("cluster"));
  });
}

export function hasLiveBridge(n, types, clusters, kinds, loudOnly) {
  return n.connectedEdges().some((e) => {
    if (e.data("meta") || !e.data("bridge") || !types.has(e.data("type"))) return false;
    if (loudOnly && !LOUD_BRIDGES.has(e.data("type"))) return false;
    const other = e.source().id() === n.id() ? e.target() : e.source();
    const od = other.data();
    return kinds.has(od.kind) && clusters.has(od.cluster);
  });
}

export function applyLabels() {
  const cy = state.cy;
  if (!cy) return;
  const mode = labelMode();
  const zoomed = cy.zoom() >= 1.15;
  const neighbourhood = !!state.focusId;
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
        (!state.fieldMode && loudEnd) ||
        (zoomed && kind === "principle" && !state.fieldMode);
    }
    n.toggleClass("label-on", on);
  });
  cy.edges().forEach((e) => {
    if (e.data("meta")) {
      e.removeClass("faint");
      return;
    }
    const faint = !neighbourhood && !e.data("bridge") && !e.hasClass("on-path");
    e.toggleClass("faint", faint);
  });
}

export function applyLabelsSoon() {
  if (state.labelTick) return;
  state.labelTick = requestAnimationFrame(() => {
    state.labelTick = 0;
    applyLabels();
  });
}

function placeOnCircle(ids, radius) {
  const cy = state.cy;
  const n = Math.max(ids.length, 1);
  ids.forEach((id, i) => {
    const node = cy.getElementById(id);
    if (node.empty()) return;
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    node.position({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
  });
}

function placeArc(nodes, radius, start, end) {
  if (!nodes.length) return;
  const n = nodes.length;
  nodes.forEach((node, i) => {
    const t = n === 1 ? (start + end) / 2 : start + ((end - start) * i) / (n - 1);
    node.position({ x: radius * Math.cos(t), y: radius * Math.sin(t) });
  });
}

export function layoutOverview() {
  const cy = state.cy;
  const systems = cy.nodes(":visible").filter((n) => n.data("kind") === "system");
  const groups = new Map();
  systems.forEach((n) => {
    const c = n.data("cluster") || "other";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(n);
  });
  const ring = (state.view && state.view.ring) || [];
  const rank = new Map(ring.map((c, i) => [c, i]));
  const names = [...groups.keys()].sort((a, b) => {
    const ra = rank.has(a) ? rank.get(a) : 1000;
    const rb = rank.has(b) ? rank.get(b) : 1000;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
  const ids = [];
  names.forEach((c) => {
    groups
      .get(c)
      .slice()
      .sort((a, b) => String(a.data("label") || "").localeCompare(String(b.data("label") || "")))
      .forEach((n) => ids.push(n.id()));
  });
  placeOnCircle(ids, 64 + ids.length * 28);
  cy.fit(systems, 80);
}

export function layoutRadial(rootId) {
  const cy = state.cy;
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
  const rootCluster = root.data("cluster") || "";
  const inside = [];
  const outside = [];
  vis.forEach((n) => {
    if (n.id() === rootId) return;
    if ((n.data("cluster") || "") === rootCluster) inside.push(n);
    else outside.push(n);
  });
  const typeRank = (n) => {
    let best = 99;
    n.connectedEdges().forEach((e) => {
      if (e.data("meta")) return;
      const other = e.source().id() === n.id() ? e.target().id() : e.source().id();
      if (other !== rootId) return;
      const rank = FINDING_ORDER.indexOf(e.data("type"));
      const value = rank < 0 ? 9 : rank;
      if (value < best) best = value;
    });
    return best;
  };
  const byLabel = (a, b) => String(a.data("label") || "").localeCompare(String(b.data("label") || ""));
  const splitDepth = (list) => {
    const near = [];
    const far = [];
    list.forEach((n) => ((depth.get(n.id()) || 2) <= 1 ? near : far).push(n));
    return [near, far];
  };
  outside.sort((a, b) => typeRank(a) - typeRank(b) || byLabel(a, b));
  inside.sort(byLabel);
  root.position({ x: 0, y: 0 });
  const left0 = Math.PI / 2 + 0.35;
  const left1 = (3 * Math.PI) / 2 - 0.35;
  const right0 = -Math.PI / 2 + 0.35;
  const right1 = Math.PI / 2 - 0.35;
  const [inNear, inFar] = splitDepth(inside);
  const [outNear, outFar] = splitDepth(outside);
  placeArc(inNear, 260, left0, left1);
  placeArc(inFar, 460, left0, left1);
  placeArc(outNear, 260, right0, right1);
  placeArc(outFar, 460, right0, right1);
  cy.fit(vis, 70);
}

export function layoutClusterRings() {
  const cy = state.cy;
  const vis = cy.nodes(":visible");
  const groups = new Map();
  vis.forEach((n) => {
    const c = n.data("cluster") || "other";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(n);
  });
  const ring = (state.view && state.view.ring) || [];
  const rank = new Map(ring.map((c, i) => [c, i]));
  const names = [...groups.keys()].sort((a, b) => {
    const ra = rank.has(a) ? rank.get(a) : 1000;
    const rb = rank.has(b) ? rank.get(b) : 1000;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
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

export function runViewLayout() {
  const cy = state.cy;
  if (!cy) return;
  if (state.pathRoute && state.loopMode) {
    placeOnCircle(state.pathRoute.nodes, 80 + state.pathRoute.nodes.length * 28);
    cy.fit(cy.nodes(":visible"), 80);
    return;
  }
  if (state.pathRoute) {
    const gap = 210;
    state.pathRoute.nodes.forEach((id, i) => {
      const node = cy.getElementById(id);
      if (!node.empty()) node.position({ x: i * gap, y: 0 });
    });
    cy.fit(cy.nodes(":visible"), 80);
    return;
  }
  if (state.focusId && cy.getElementById(state.focusId).visible()) {
    layoutRadial(state.focusId);
    return;
  }
  if (state.fieldMode) {
    layoutOverview();
    return;
  }
  layoutClusterRings();
}

function clusterReps() {
  const reps = new Map();
  state.cy.nodes().forEach((n) => {
    if (n.data("kind") !== "system" || !n.visible()) return;
    const c = n.data("cluster");
    if (!reps.has(c)) reps.set(c, n);
  });
  return reps;
}

export function syncMetaEdges(types) {
  const cy = state.cy;
  cy.edges(".meta").remove();
  const overview = state.fieldMode && !state.focusId && !state.pathRoute;
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
    let cur = pairs.get(key);
    if (!cur) {
      cur = {
        source: ra.id(),
        target: rb.id(),
        count: 0,
        counts: Object.fromEntries(EDGE_TYPES.map((name) => [name, 0])),
        members: []
      };
      pairs.set(key, cur);
    }
    cur.count += 1;
    cur.counts[t] = (cur.counts[t] || 0) + 1;
    cur.members.push({
      id: e.id(),
      from: e.source().id(),
      to: e.target().id(),
      fromLabel: e.source().data("label") || e.source().id(),
      toLabel: e.target().data("label") || e.target().id(),
      type: t,
      note: e.data("note") || "",
      directed: !!e.data("directed"),
      isNew: !!e.data("isNew")
    });
  });
  pairs.forEach((p, key) => {
    const newCount = p.members.filter((m) => m.isNew).length;
    if (state.newOnly && newCount === 0) return;
    const mix = mixLabel(p.counts, p.count);
    cy.add({
      group: "edges",
      classes: "meta bridge",
      data: {
        id: "meta-" + key,
        source: p.source,
        target: p.target,
        type: "mix",
        directed: false,
        meta: true,
        bridge: true,
        count: p.count,
        mix,
        members: p.members,
        newCount,
        note: mix,
        versions: ""
      }
    });
  });
}

export function paintPath() {
  const cy = state.cy;
  if (!cy) return;
  cy.elements().removeClass("on-path path-end");
  if (!state.pathRoute) return;
  state.pathRoute.nodes.forEach((id, i) => {
    const n = cy.getElementById(id);
    if (n.empty()) return;
    n.addClass("on-path");
    if (i === 0 || i === state.pathRoute.nodes.length - 1) n.addClass("path-end");
  });
  state.pathRoute.edges.forEach((e) => e.addClass("on-path"));
}

export function walkableFrom(nid, ignoreDir) {
  const n = state.cy.getElementById(nid);
  const hops = [];
  if (n.empty()) return hops;
  n.connectedEdges().forEach((e) => {
    if (e.data("meta")) return;
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

export function findRoute(src, dst) {
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

export function bestLoop(startId) {
  return findLoop(startId, false) || findLoop(startId, true);
}

export function loopKind(route) {
  if (!route) return "";
  const types = new Set(route.edges.map((e) => e.data("type")));
  if (types.has("green") && types.has("red")) return "mixed fall + return";
  if (types.has("green")) return "return / negative feedback";
  if (types.has("red")) return "fall / positive feedback";
  if (!route.followArrows) return "undirected cycle only";
  return "directed cycle";
}

export function chordWidth(count) {
  const n = count || 1;
  return Math.min(36, 3 + Math.sqrt(n) * 5);
}
