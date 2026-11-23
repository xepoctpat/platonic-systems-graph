import {
  EDGE_COLOR,
  EDGE_MEANING,
  EDGE_TYPES,
  FLOW_TYPES,
  MAP_TYPES,
  esc
} from "./data.js";
import { state } from "./state.js";

const detail = () => document.getElementById("detail");

export function checked(kind) {
  return new Set(
    [...document.querySelectorAll(`input[data-kind="${kind}"]:checked`)].map((el) => el.value)
  );
}

export function setChecks(kind, pred) {
  document.querySelectorAll(`input[data-kind="${kind}"]`).forEach((el) => {
    el.checked = pred(el.value);
  });
}

export function mountChecks(container, items, name, colorFn) {
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

function edgeRows(types, hint) {
  return (
    `<div class="legend-head">${hint}</div>` +
    types
      .map(
        (t) =>
          `<div class="legend-row"><span class="legend-line" style="border-top-color:${EDGE_COLOR[t]}"></span>` +
          `<span><span class="legend-name">${t}</span> <span class="legend-hint">${EDGE_MEANING[t]}</span></span></div>`
      )
      .join("")
  );
}

export function mountLegend() {
  const nodesBox = document.getElementById("legend-nodes");
  const edgesBox = document.getElementById("legend-edges");
  if (!nodesBox || !edgesBox) return;
  nodesBox.innerHTML =
    `<div class="legend-row"><span class="legend-mark system"></span>` +
    `<span><span class="legend-name">system</span> <span class="legend-hint">a school · ring card in Field</span></span></div>` +
    `<div class="legend-row"><span class="legend-mark principle"></span>` +
    `<span><span class="legend-name">principle</span> <span class="legend-hint">inside a school, on the left when you open it</span></span></div>`;
  edgesBox.innerHTML =
    `<div class="legend-row"><span class="legend-line bridge" style="border-top-color:#d9d3c7"></span>` +
    `<span><span class="legend-name">between schools</span> <span class="legend-hint">Heavy: three strongest lines per school, each with 3 or more findings.</span></span></div>` +
    `<div class="legend-row"><span class="legend-line interior" style="border-top-color:#ece6d8"></span>` +
    `<span><span class="legend-name">interior</span> <span class="legend-hint">same cluster · hidden in Field</span></span></div>` +
    edgeRows(FLOW_TYPES, "Flow · one arrow") +
    edgeRows(MAP_TYPES, "Map · marks both ways");
}

export function showOpenedGroup(clusters, title) {
  const names = clusters || [];
  const schools = [];
  if (state.cy) {
    state.cy.nodes().forEach((n) => {
      if (n.data("kind") === "system" && names.indexOf(n.data("cluster")) >= 0) schools.push(n);
    });
  }
  schools.sort((a, b) => String(a.data("label") || "").localeCompare(String(b.data("label") || "")));
  const rows = schools
    .map(
      (n) =>
        `<button type="button" class="jump" data-jump="${esc(n.id())}">` +
        `<strong>${esc(n.data("label") || n.id())}</strong> ` +
        `<span class="legend-hint">${esc(n.data("cluster"))}</span></button>`
    )
    .join("");
  detail().innerHTML =
    `<h2>${esc(title || names.join(" · "))}</h2>` +
    `<p class="empty">Neighbors on the ring, not a rank. Every link among these schools is on the canvas. Click empty space to return to the groups.</p>` +
    (rows || `<p class="empty">No schools in this group under the current filters.</p>`);
}

export function showGuide() {
  const help = document.getElementById("help");
  if (help) help.classList.add("active");
  detail().innerHTML =
    `<h2>How to use this</h2>` +
    `<div class="meta">Schools on a ring · a line is a mix of findings · not a spine</div>` +
    `<ol class="guide">` +
    `<li><strong>Field</strong> groups neighboring schools. A line keeps every finding between two groups. Click a group to open its schools. Click empty space to step back.</li>` +
    `<li><strong>Heavy</strong> is the whole school ring, three lines each. <strong>All pairs</strong> draws every school pair. <strong>Findings</strong> lists every cross-cluster edge.</li>` +
    `<li><strong>Click a school</strong> to open it. Same-cluster principles sit on the left. Other schools sit on the right, grouped by relation.</li>` +
    `<li><strong>Slots</strong> are peer occupants of one collision. <strong>Tours</strong> lay a named tension left to right. Tours are illustrations.</li>` +
    `<li><strong>Path</strong>, then two nodes. <strong>Loop</strong>, then one node. Both are queries.</li>` +
    `<li><strong>Laterals</strong> keeps only cyan and orange. Field itself shows all six types.</li>` +
    `<li><strong>Findings</strong> lists every cross-cluster edge. <strong>New</strong> is the last accepted pass (` +
    esc(state.latestMeta.label || "none") +
    `).</li>` +
    `<li><strong>Sheet</strong> draws the success test: the field without Plato, the hinges, and where communities cut across clusters. It does not prove a spine.</li>` +
    `<li><strong>Hinges</strong> is unweighted betweenness. <strong>Communities</strong> recolors the border only. <strong>Hide Platonic</strong> reports whether the field stays one component.</li>` +
    `</ol>` +
    `<p class="empty">YAML is the source of truth. A tour is not the law of the graph. Permalink: #id=node-id</p>`;
}

function hopArrow(e, fromId) {
  if (!e.data("directed")) return "↔";
  return e.source().id() === fromId ? "→" : "←";
}

function connectionList(items) {
  if (!items.length) return "";
  const groups = new Map();
  items.forEach((it) => {
    if (!groups.has(it.type)) groups.set(it.type, []);
    groups.get(it.type).push(it);
  });
  return EDGE_TYPES.filter((t) => groups.get(t) && groups.get(t).length)
    .map((t) => {
      const list = groups.get(t);
      return (
        `<h3 class="type-head"><span class="hop" style="color:${EDGE_COLOR[t] || "#aaa"}">${esc(t)}</span> ` +
        `· ${esc(EDGE_MEANING[t] || "")}</h3>` +
        `<ul class="conn">${list
          .map(
            (it) =>
              `<li><button type="button" class="jump" data-jump="${esc(it.jump)}" data-edge="${esc(it.id)}">` +
              `<span class="hop" style="color:${EDGE_COLOR[it.type] || "#aaa"}">${esc(it.arrow)}</span> ` +
              `<strong>${esc(it.label)}</strong>` +
              (it.isNew ? `<span class="badge-new">new</span>` : "") +
              (it.note ? `<div class="legend-hint">${esc(it.note)}</div>` : "") +
              `</button></li>`
          )
          .join("")}</ul>`
      );
    })
    .join("");
}

export function showNode(d) {
  const cy = state.cy;
  const node = cy ? cy.getElementById(d.id) : null;
  const role = d.role ? ` · ${d.role}` : "";
  const items = [];
  if (node && node.nonempty()) {
    node.connectedEdges().forEach((e) => {
      if (e.data("meta")) return;
      const other = e.source().id() === d.id ? e.target() : e.source();
      items.push({
        id: e.id(),
        jump: other.id(),
        type: e.data("type"),
        arrow: hopArrow(e, d.id),
        label: other.data("label") || other.id(),
        note: e.data("note") || "",
        isNew: !!e.data("isNew"),
        span: e.data("bridge") ? "bridge" : "interior"
      });
    });
  }
  const inside = items.filter((it) => it.span === "interior");
  const outside = items.filter((it) => it.span === "bridge");
  const conn =
    items.length === 0
      ? `<p class="empty">No edges on the current filters.</p>`
      : (inside.length
          ? `<h2>Inside this school</h2>${connectionList(inside)}`
          : "") +
        (outside.length ? `<h2>Outside</h2>${connectionList(outside)}` : "");
  detail().innerHTML =
    `<h2>${esc(d.label)}</h2>` +
    `<div class="meta"><code>${esc(d.id)}</code> · ${esc(d.kind)} · ${esc(d.cluster)}${esc(role)}</div>` +
    `<p>${esc((d.description || "").trim())}</p>` +
    (d.refs ? `<div class="refs">${esc(d.refs)}</div>` : "") +
    conn +
    `<p class="empty">Left arc is this cluster. Right arc is everyone else. Permalink <code>#id=${esc(d.id)}</code></p>`;
}

function memberList(members, onlyNew) {
  const rows = (members || []).filter((m) => !onlyNew || m.isNew);
  if (!rows.length) return `<p class="empty">No principle-level edges in this pair.</p>`;
  const groups = new Map();
  rows.forEach((m) => {
    if (!groups.has(m.type)) groups.set(m.type, []);
    groups.get(m.type).push(m);
  });
  return EDGE_TYPES.filter((t) => groups.get(t) && groups.get(t).length)
    .map((t) => {
      const list = groups.get(t);
      return (
        `<h3 class="type-head"><span class="hop" style="color:${EDGE_COLOR[t]}">${esc(t)}</span> · ${list.length}</h3>` +
        `<ul class="findings">${list
          .map(
            (m) =>
              `<li><button type="button" class="jump" data-jump="${esc(m.from)}" data-edge="${esc(m.id)}">` +
              `<strong>${esc(m.fromLabel)}</strong> ${m.directed ? "→" : "↔"} <strong>${esc(m.toLabel)}</strong>` +
              (m.isNew ? `<span class="badge-new">new</span>` : "") +
              (m.note ? `<div class="legend-hint">${esc(m.note)}</div>` : "") +
              `</button></li>`
          )
          .join("")}</ul>`
      );
    })
    .join("");
}

export function showEdge(d) {
  if (d.meta) {
    const nNew = d.newCount || 0;
    detail().innerHTML =
      `<h2>Between schools</h2>` +
      `<div class="meta">${esc(d.full || d.mix || d.note || "")}` +
      (nNew ? ` · ${nNew} new` : "") +
      `</div>` +
      `<p class="empty">Width is the count. The line is not one relation.</p>` +
      memberList(d.members, state.newOnly) +
      `<p class="empty">Click a row to open that neighbourhood.</p>`;
    return;
  }
  const span = d.bridge ? "bridge" : "interior";
  const neu = d.isNew ? ` <span class="badge-new">new</span>` : "";
  const arrow = d.directed ? "→" : "↔";
  detail().innerHTML =
    `<h2>${esc(d.type)} ${span}${neu}</h2>` +
    `<div class="meta"><code>${esc(d.source)}</code> ${arrow} <code>${esc(d.target)}</code> · ${esc(span)}</div>` +
    `<p>${esc(EDGE_MEANING[d.type] || "")}</p>` +
    `<p>${esc(d.note)}</p>` +
    `<div class="refs">versions: ${esc(d.versions || "—")}</div>` +
    `<p><button type="button" class="jump" data-jump="${esc(d.source)}" data-edge="${esc(d.id)}">Open ${esc(d.source)}</button></p>` +
    `<p><button type="button" class="jump" data-jump="${esc(d.target)}" data-edge="${esc(d.id)}">Open ${esc(d.target)}</button></p>`;
}

function collectFindings(onlyNew) {
  const cy = state.cy;
  if (!cy) return [];
  const types = checked("etype");
  const clusters = checked("cluster");
  const rows = [];
  cy.edges().forEach((e) => {
    if (e.data("meta")) return;
    if (!types.has(e.data("type"))) return;
    if (!clusters.has(e.source().data("cluster")) || !clusters.has(e.target().data("cluster"))) return;
    if (onlyNew) {
      if (!e.data("isNew")) return;
    } else if (!e.data("bridge")) {
      return;
    }
    rows.push({
      id: e.id(),
      from: e.source().id(),
      to: e.target().id(),
      fromLabel: e.source().data("label") || e.source().id(),
      toLabel: e.target().data("label") || e.target().id(),
      type: e.data("type"),
      note: e.data("note") || "",
      isNew: !!e.data("isNew"),
      span: e.data("bridge") ? "bridge" : "interior"
    });
  });
  rows.sort((a, b) => {
    const ta = EDGE_TYPES.indexOf(a.type);
    const tb = EDGE_TYPES.indexOf(b.type);
    if (ta !== tb) return (ta < 0 ? 9 : ta) - (tb < 0 ? 9 : tb);
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    const byFrom = a.fromLabel.localeCompare(b.fromLabel);
    return byFrom !== 0 ? byFrom : a.toLabel.localeCompare(b.toLabel);
  });
  return rows;
}

function leaveHelp() {
  const help = document.getElementById("help");
  if (help) help.classList.remove("active");
}

export function showFindings() {
  leaveHelp();
  const findingsBtn = document.getElementById("findings");
  if (findingsBtn) findingsBtn.classList.add("active");
  const onlyNew = state.newOnly;
  const rows = collectFindings(onlyNew);
  const groups = new Map();
  EDGE_TYPES.forEach((t) => groups.set(t, []));
  rows.forEach((r) => {
    if (!groups.has(r.type)) groups.set(r.type, []);
    groups.get(r.type).push(r);
  });
  const title = onlyNew ? state.latestMeta.label || "New findings" : "Findings";
  const blocks = [];
  groups.forEach((list, type) => {
    if (!list.length) return;
    const nNew = list.filter((r) => r.isNew).length;
    blocks.push(
      `<details class="findings-group" open>` +
        `<summary><span class="hop" style="color:${EDGE_COLOR[type] || "#aaa"}">${esc(type)}</span> · ${list.length}` +
        (nNew ? ` · ${nNew} new` : "") +
        ` · ${esc(EDGE_MEANING[type] || "")}</summary>` +
        `<ul class="findings">${list
          .map(
            (m) =>
              `<li><button type="button" class="jump" data-jump="${esc(m.from)}" data-edge="${esc(m.id)}">` +
              `<strong>${esc(m.fromLabel)}</strong> ↔ <strong>${esc(m.toLabel)}</strong>` +
              (m.isNew ? `<span class="badge-new">new</span>` : "") +
              ` <span class="legend-hint">${esc(m.span)}</span>` +
              (m.note ? `<div class="legend-hint">${esc(m.note)}</div>` : "") +
              `</button></li>`
          )
          .join("")}</ul></details>`
    );
  });
  detail().innerHTML =
    `<h2>${esc(title)}</h2>` +
    `<div class="meta">${rows.length} ${onlyNew ? "edge(s) in the last pass" : "cross-cluster edge(s)"}</div>` +
    (blocks.join("") || `<p class="empty">Nothing to list on the current filters.</p>`) +
    `<p class="empty">Click a row to open that neighbourhood. New is ${esc(state.latestMeta.pass || "unset")}.</p>`;
}

export function showTrajectory() {
  const route = state.pathRoute;
  if (!route) return;
  const hops = route.nodes.length - 1;
  const kind = route.followArrows
    ? "follows directed flow (undirected hops either way)"
    : "no directed route — undirected map only";
  const items = [];
  route.nodes.forEach((id, i) => {
    const n = state.cy.getElementById(id);
    const name = n.data("label") || id;
    if (i === 0) {
      items.push(`<li><strong>${esc(name)}</strong></li>`);
      return;
    }
    const e = route.edges[i - 1];
    const t = e.data("type");
    const arrow = e.data("directed") ? "→" : "↔";
    items.push(
      `<li><span class="hop" style="color:${EDGE_COLOR[t] || "#aaa"}">${esc(t)} ${arrow}</span> ` +
        `<strong>${esc(name)}</strong></li>`
    );
  });
  detail().innerHTML =
    `<h2>Trajectory</h2>` +
    `<div class="meta">${hops} hop${hops === 1 ? "" : "s"} · ${esc(kind)}</div>` +
    `<ol class="traj">${items.join("")}</ol>` +
    `<p class="empty">This is a query overlay, not a stored spine. Click Path again to pick two other nodes.</p>`;
}

export function showLoop(loopKind) {
  const route = state.pathRoute;
  if (!route) return;
  const hops = route.edges.length;
  const items = [];
  route.nodes.forEach((id, i) => {
    const n = state.cy.getElementById(id);
    const name = n.data("label") || id;
    if (i === 0) {
      items.push(`<li><strong>${esc(name)}</strong></li>`);
      return;
    }
    const e = route.edges[i - 1];
    const t = e.data("type");
    const arrow = e.data("directed") ? "→" : "↔";
    items.push(
      `<li><span class="hop" style="color:${EDGE_COLOR[t] || "#aaa"}">${esc(t)} ${arrow}</span> ` +
        `<strong>${esc(name)}</strong></li>`
    );
  });
  detail().innerHTML =
    `<h2>Loop</h2>` +
    `<div class="meta">${hops} hop${hops === 1 ? "" : "s"} · ${esc(loopKind(route))}</div>` +
    `<ol class="traj">${items.join("")}</ol>` +
    `<p class="empty">A cycle through the node you clicked. Prefer mixed green/red. Not a spine.</p>`;
}

export function showSlots() {
  leaveHelp();
  const slots = (state.view && state.view.slots) || [];
  const caption = (state.view && state.view.caption && state.view.caption.slots) || "";
  detail().innerHTML =
    `<h2>Slots</h2>` +
    `<p class="empty">${esc(caption)}</p>` +
    (slots.length
      ? slots
          .map(
            (s) =>
              `<button type="button" class="jump" data-slot="${esc(s.id)}">` +
              `<strong>${esc(s.label)}</strong>` +
              `<div class="legend-hint">${esc(s.gloss)}</div></button>`
          )
          .join("")
      : `<p class="empty">No slots in view.json. Run python tools/validate.py.</p>`);
}

export function showTours() {
  leaveHelp();
  const tours = (state.view && state.view.tours) || [];
  const caption = (state.view && state.view.caption && state.view.caption.tours) || "";
  detail().innerHTML =
    `<h2>Tours</h2>` +
    `<p class="empty">${esc(caption)}</p>` +
    (tours.length
      ? tours
          .map(
            (t) =>
              `<button type="button" class="jump" data-tour="${esc(t.id)}">` +
              `<strong>${esc(t.title)}</strong>` +
              `<div class="legend-hint">${esc(t.sentence)}</div></button>`
          )
          .join("")
      : `<p class="empty">No tours in view.json. Run python tools/validate.py.</p>`);
}

export function showHinges() {
  leaveHelp();
  const rows = (state.view && state.view.betweenness) || [];
  const caption = (state.view && state.view.caption && state.view.caption.betweenness) || "";
  detail().innerHTML =
    `<h2>Hinges</h2>` +
    `<p class="empty">${esc(caption)}</p>` +
    (rows.length
      ? `<ol class="findings">${rows
          .map(
            (h, i) =>
              `<li><button type="button" class="jump" data-jump="${esc(h.id)}">` +
              `<strong>${i + 1}. ${esc(h.label)}</strong> ` +
              `<span class="legend-hint">${esc(h.cluster)} · ${Number(h.score).toFixed(3)}</span>` +
              `</button></li>`
          )
          .join("")}</ol>`
      : `<p class="empty">No hinge list in view.json.</p>`) +
    `<p class="empty">The ring is not resized by this list. Platonic share of the top 12: ${esc(
      state.view ? String(state.view.platonicTop12) : "—"
    )}/12.</p>`;
}

export function showReading() {
  const route = state.pathRoute;
  if (!route) return;
  const tour = state.routeKind === "tour";
  const nodes = route.nodes
    .map((id, i) => {
      const n = state.cy.getElementById(id);
      const name = n.empty() ? id : n.data("label") || id;
      return (
        `<li><button type="button" class="jump" data-jump="${esc(id)}">` +
        `<strong>${i + 1}. ${esc(name)}</strong></button></li>`
      );
    })
    .join("");
  const rels = (route.edges || [])
    .map((e) => {
      const t = e.data("type");
      const arrow = e.data("directed") ? "→" : "↔";
      return (
        `<li><span class="hop" style="color:${EDGE_COLOR[t] || "#aaa"}">${esc(t)}</span> ` +
        `<strong>${esc(e.source().data("label") || e.source().id())}</strong> ` +
        `${arrow} <strong>${esc(e.target().data("label") || e.target().id())}</strong>` +
        (e.data("note") ? `<div class="legend-hint">${esc(e.data("note"))}</div>` : "") +
        `</li>`
      );
    })
    .join("");
  detail().innerHTML =
    `<h2>${esc(route.title || (tour ? "Tour" : "Slot"))}</h2>` +
    `<p>${esc(route.sentence || "")}</p>` +
    `<p class="empty">${tour ? "Illustration, not the law of the graph." : "Peer occupants. Not a stage."}</p>` +
    `<ol class="traj">${nodes}</ol>` +
    (rels ? `<h2>Relations</h2><ul class="findings">${rels}</ul>` : `<p class="empty">No relation among these nodes on this reading.</p>`);
}
