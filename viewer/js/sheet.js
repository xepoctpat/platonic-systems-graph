import { EDGE_COLOR, clusterColor, esc } from "./data.js";
import { heavySchoolPairs } from "./layout.js";
import { state } from "./state.js";

function nodeInfo(id) {
  const n = state.cy && state.cy.getElementById(id);
  if (!n || n.empty()) return { id, label: id, cluster: "", kind: "" };
  return {
    id,
    label: n.data("label") || id,
    cluster: n.data("cluster") || "",
    kind: n.data("kind") || ""
  };
}

function chip(info, extra) {
  const color = clusterColor(info.cluster);
  const cls = extra ? "sheet-chip " + extra : "sheet-chip";
  const tag = extra === "seed" ? `<span class="sheet-tag">seed</span>` : "";
  const score =
    info.score == null ? "" : `<span class="sheet-score">${Number(info.score).toFixed(3)}</span>`;
  const index = info.index ? `<span class="sheet-index">${info.index}.</span>` : "";
  return (
    `<button type="button" class="${cls}" data-jump="${esc(info.id)}" title="${esc(info.id)}">` +
    `<span class="sheet-swatch" style="background:${esc(color)}"></span>` +
    index +
    `<span>${esc(info.label)}</span>` +
    tag +
    score +
    `</button>`
  );
}

function countChip(cluster, count) {
  const color = clusterColor(cluster);
  return (
    `<span class="sheet-count">` +
    `<span class="sheet-swatch" style="background:${esc(color)}"></span>` +
    `${esc(cluster)} ${count}</span>`
  );
}

function remainingSchools(aside) {
  const ring = (state.view && state.view.ring) || [];
  const rank = new Map(ring.map((c, i) => [c, i]));
  const rows = [];
  state.cy.nodes().forEach((n) => {
    if (n.data("kind") !== "system") return;
    if ((n.data("cluster") || "") === "platonic") return;
    if (aside.has(n.id())) return;
    rows.push(nodeInfo(n.id()));
  });
  rows.sort((a, b) => {
    const ra = rank.has(a.cluster) ? rank.get(a.cluster) : 1000;
    const rb = rank.has(b.cluster) ? rank.get(b.cluster) : 1000;
    if (ra !== rb) return ra - rb;
    return a.label.localeCompare(b.label);
  });
  return rows;
}

function stubSystems() {
  const withPrinciples = new Set();
  state.cy.nodes().forEach((n) => {
    if (n.data("kind") === "principle" && n.data("cluster")) withPrinciples.add(n.data("cluster"));
  });
  const rows = [];
  state.cy.nodes().forEach((n) => {
    if (n.data("kind") !== "system") return;
    if (withPrinciples.has(n.data("cluster"))) return;
    rows.push(nodeInfo(n.id()));
  });
  rows.sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
  return rows;
}

function communityRows() {
  const grouped = new Map();
  Object.entries(state.view.communities || {}).forEach(([id, comm]) => {
    const key = Number(comm);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(id);
  });
  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([comm, ids]) => {
      const counts = new Map();
      const nodes = ids.map((id) => {
        const info = nodeInfo(id);
        counts.set(info.cluster || "—", (counts.get(info.cluster || "—") || 0) + 1);
        return info;
      });
      nodes.sort((a, b) => a.cluster.localeCompare(b.cluster) || a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
      const clusters = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      return { comm, clusters, nodes, mixed: clusters.length > 1 };
    });
}

function edgesAmong(ids) {
  const want = new Set(ids);
  const found = [];
  state.cy.edges().forEach((e) => {
    if (e.data("meta")) return;
    if (!want.has(e.source().id()) || !want.has(e.target().id())) return;
    found.push(e);
  });
  found.sort((a, b) => {
    const ta = a.data("type") || "";
    const tb = b.data("type") || "";
    if (ta !== tb) return ta.localeCompare(tb);
    const af = a.source().data("label") || a.source().id();
    const bf = b.source().data("label") || b.source().id();
    return af.localeCompare(bf);
  });
  return found;
}

function edgeLine(e) {
  const type = e.data("type") || "";
  const color = EDGE_COLOR[type] || "#aaa";
  const arrow = e.data("directed") ? "→" : "↔";
  const from = e.source().data("label") || e.source().id();
  const to = e.target().data("label") || e.target().id();
  return (
    `<li><span class="sheet-type" style="color:${esc(color)}">${esc(type)}</span> ` +
    `${esc(from)} ${arrow} ${esc(to)}</li>`
  );
}

function withoutPlato() {
  const hide = (state.view && state.view.hidePlatonic) || {};
  const caption = (state.view.caption && state.view.caption.hidePlatonic) || "";
  const asideIds = hide.aside || [];
  const aside = new Set(asideIds);
  const k = Number(hide.components);
  const noun = k === 1 ? "component" : "components";
  const schools = remainingSchools(aside);
  const small = asideIds.map((id) => nodeInfo(id));
  const outcome =
    k === 1
      ? " This graph has 1 component. The aside is empty."
      : ` This graph has ${k} ${noun}. The aside is left unconnected on purpose.`;
  const smallBody = small.length
    ? `<div class="sheet-chips">${small.map((info) => chip(info)).join("")}</div>`
    : `<p class="sheet-note">None.</p>`;
  return (
    `<section class="sheet-block">` +
    `<h3>Without Plato</h3>` +
    `<p class="sheet-note">${esc(caption)}${esc(outcome)}</p>` +
    `<div class="sheet-piles">` +
    `<div class="sheet-pile"><h4>Schools</h4>` +
    `<div class="sheet-chips">${schools.map((info) => chip(info)).join("") || `<p class="sheet-note">None.</p>`}</div>` +
    `</div>` +
    `<div class="sheet-pile aside"><h4>Aside</h4>${smallBody}</div>` +
    `</div></section>`
  );
}

function hingesBlock() {
  const rows = (state.view && state.view.betweenness) || [];
  const caption = (state.view.caption && state.view.caption.betweenness) || "";
  const share = state.view.platonicTop12;
  const chips = rows
    .map((h, i) =>
      chip(
        {
          id: h.id,
          label: h.label || h.id,
          cluster: h.cluster || "",
          score: h.score,
          index: i + 1
        },
        h.cluster === "platonic" ? "seed" : "wait"
      )
    )
    .join("");
  return (
    `<section class="sheet-block">` +
    `<h3>Hinges <span class="sheet-share">${esc(share)}/12 Platonic</span></h3>` +
    `<p class="sheet-note">${esc(caption)} The ring is not resized by this list.</p>` +
    `<div class="sheet-chips">${chips || `<p class="sheet-note">No hinge list in view.json.</p>`}</div>` +
    `</section>`
  );
}

function communitiesBlock() {
  const caption = (state.view.caption && state.view.caption.communities) || "";
  const rows = communityRows();
  const mixed = rows.filter((row) => row.mixed).length;
  const body = rows
    .map((row) => {
      const counts = row.clusters.map(([cluster, count]) => countChip(cluster, count)).join("");
      const flag = row.mixed ? "cuts across clusters" : "one cluster";
      const flagCls = row.mixed ? "sheet-cut" : "sheet-agree";
      const names = row.nodes.map((info) => chip(info)).join("");
      return (
        `<details class="sheet-community${row.mixed ? " mixed" : ""}">` +
        `<summary><span class="sheet-comm-title">Community ${row.comm}</span>` +
        `<span class="${flagCls}">${flag}</span>` +
        `<span class="sheet-counts">${counts}</span></summary>` +
        `<div class="sheet-chips">${names}</div></details>`
      );
    })
    .join("");
  return (
    `<section class="sheet-block">` +
    `<h3>Communities against clusters</h3>` +
    `<p class="sheet-note">${esc(caption)} ${mixed} of ${rows.length} cut across cluster labels.</p>` +
    body +
    `</section>`
  );
}

function slotsBlock() {
  const slots = (state.view && state.view.slots) || [];
  const caption = (state.view.caption && state.view.caption.slots) || "";
  const body = slots
    .map((slot) => {
      const members = (slot.members || []).map((id) => chip(nodeInfo(id))).join("");
      const edges = edgesAmong(slot.members || []);
      const rels = edges.length
        ? `<ul class="sheet-edges">${edges.map(edgeLine).join("")}</ul>`
        : `<p class="sheet-note">No edge among these occupants.</p>`;
      return (
        `<div class="sheet-slot">` +
        `<h4>${esc(slot.label || slot.id)}</h4>` +
        `<p class="sheet-note">${esc(slot.gloss || "")}</p>` +
        `<div class="sheet-chips">${members}</div>` +
        rels +
        `</div>`
      );
    })
    .join("");
  return (
    `<section class="sheet-block">` +
    `<h3>Slots</h3>` +
    `<p class="sheet-note">${esc(caption)}</p>` +
    (body || `<p class="sheet-note">No slots in view.json.</p>`) +
    `</section>`
  );
}

function heavyBlock() {
  const rows = state.cy ? heavySchoolPairs() : [];
  const body = rows
    .map(
      (row) =>
        `<div class="sheet-pair">` +
        chip({ id: row.source, label: row.sourceLabel, cluster: nodeInfo(row.source).cluster }) +
        chip({ id: row.target, label: row.targetLabel, cluster: nodeInfo(row.target).cluster }) +
        `<span class="sheet-mix">${esc(row.mix)}</span></div>`
    )
    .join("");
  return (
    `<section class="sheet-block">` +
    `<h3>Heavy pairs</h3>` +
    `<p class="sheet-note">At least three findings, then at most three lines per school. Same cap as Heavy on the full graph. All pairs stays on the ring.</p>` +
    (body || `<p class="sheet-note">No pair meets the cap.</p>`) +
    `</section>`
  );
}

function stubsBlock() {
  const rows = stubSystems();
  const body = rows.length
    ? `<div class="sheet-chips">${rows.map((info) => chip(info)).join("")}</div>`
    : `<p class="sheet-note">No system is an empty landing site.</p>`;
  return (
    `<section class="sheet-block">` +
    `<h3>Stubs</h3>` +
    `<p class="sheet-note">Systems with no principles in their cluster. Empty on purpose.</p>` +
    body +
    `</section>`
  );
}

export function renderSheet(root) {
  if (!root) return;
  root.hidden = false;
  if (!state.view || !state.cy) {
    root.innerHTML = `<div class="sheet"><p class="sheet-note">view.json is missing. Run python tools/validate.py.</p></div>`;
    return;
  }
  root.innerHTML =
    `<div class="sheet">` +
    `<h2>Comparison sheet</h2>` +
    `<p class="sheet-lead">A reading of this graph. Not a spine and not a layout.</p>` +
    withoutPlato() +
    hingesBlock() +
    communitiesBlock() +
    slotsBlock() +
    heavyBlock() +
    stubsBlock() +
    `</div>`;
}
