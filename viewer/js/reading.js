import { esc, loadReadings } from "./data.js";
import { state } from "./state.js";

let rows = null;
let selected = "";
let renderSeq = 0;
let mermaidReady = false;

function mermaidApi() {
  const api = globalThis.mermaid;
  if (!api || typeof api.initialize !== "function" || typeof api.render !== "function") {
    throw new Error("Mermaid did not load from viewer/vendor/mermaid.min.js");
  }
  if (!mermaidReady) {
    api.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "dark"
    });
    mermaidReady = true;
  }
  return api;
}

function columnLabel(col) {
  if (col && typeof col === "object") return col.label || col.id || "";
  return col == null ? "" : String(col);
}

function columnId(col) {
  if (col && typeof col === "object" && col.id) return String(col.id);
  return "";
}

function definedNodes(src) {
  const found = [];
  const seen = new Set();
  const re = /([A-Za-z_][\w-]*)\s*\[\s*"([^"]*)"\s*\]/g;
  let match;
  while ((match = re.exec(src))) {
    if (seen.has(match[1])) continue;
    seen.add(match[1]);
    found.push({ id: match[1], label: match[2] });
  }
  return found;
}

function nodeLive(id) {
  const cy = state.cy;
  if (!cy || !id) return false;
  const node = cy.getElementById(id);
  return !!(node && node.nonempty && node.nonempty());
}

function mermaidEscape(text) {
  return String(text == null ? "" : text)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/"/g, "'")
    .replace(/[#[\]|]/g, "");
}

function noteWords(text) {
  return String(text || "").toLowerCase().match(/[a-z0-9]+/g) || [];
}

function statedInNote(gloss, note) {
  const need = noteWords(gloss).filter((word) => word.length > 3);
  if (!need.length) return false;
  const sentences = String(note || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
  return sentences.some((sentence) => {
    const have = noteWords(sentence);
    let index = 0;
    for (const word of have) {
      if (word === need[index]) index += 1;
      if (index === need.length) return true;
    }
    return false;
  });
}

function parseMermaidEdges(src) {
  const found = [];
  const re = /([A-Za-z_][\w-]*)\s*(?:\[[^\]]*\])?\s*(?:---|-->|-\.->|==>)\s*(?:\|"([^"]*)"\|)?\s*([A-Za-z_][\w-]*)/g;
  let match;
  while ((match = re.exec(src))) {
    const label = match[2] || "";
    const gloss = label.includes("·") ? label.split("·").slice(1).join("·").trim() : "";
    const type = label.split("·")[0].trim().toLowerCase();
    found.push({ a: match[1], b: match[3], type, gloss, used: false });
  }
  return found;
}

function noteGloss(note, peerNotes) {
  const clean = String(note || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const peers = peerNotes.map((item) => String(item || "").replace(/\s+/g, " ").trim().toLowerCase());
  const unique = (text) => {
    const folded = text.toLowerCase();
    return folded.length > 2 && peers.every((peer) => !peer.includes(folded));
  };
  const first = clean.split(/(?<=[.!?])\s+/)[0].replace(/[.!?]+$/g, "");
  if (unique(first)) return first.length <= 90 ? first : first.slice(0, 90).replace(/\s+\S*$/, "");
  const words = clean.split(" ");
  let acc = "";
  let uniqueAt = "";
  for (const word of words) {
    acc = acc ? acc + " " + word : word;
    const clipped = acc.replace(/[.,;:]+$/g, "");
    if (clipped.length >= 12 && unique(clipped)) {
      uniqueAt = clipped;
      if (clipped.length >= 28 || /[.!?]$/.test(word)) break;
    }
    if (acc.length > 96) break;
  }
  const chosen = uniqueAt || first;
  if (chosen.length <= 90) return chosen;
  return chosen.slice(0, 90).replace(/\s+\S*$/, "");
}

function cardNodeIds(row) {
  const ids = [];
  const add = (id) => {
    if (!id || ids.includes(id)) return;
    ids.push(id);
  };
  const columns = (row.attributes && row.attributes.columns) || [];
  columns.forEach((col) => add(columnId(col)));
  definedNodes(row.mermaid || "").forEach((node) => add(node.id));
  return ids.filter(nodeLive);
}

function edgesAmong(ids) {
  const cy = state.cy;
  const want = new Set(ids);
  const found = [];
  if (!cy) return found;
  cy.edges().forEach((edge) => {
    if (edge.data("meta")) return;
    if (!want.has(edge.source().id()) || !want.has(edge.target().id())) return;
    found.push(edge);
  });
  found.sort((a, b) => {
    const na = Number(String(a.id()).replace(/^\D+/, "")) || 0;
    const nb = Number(String(b.id()).replace(/^\D+/, "")) || 0;
    return na - nb;
  });
  return found;
}

function labelFor(edge, pool) {
  const type = String(edge.data("type") || "");
  const note = String(edge.data("note") || "");
  const a = edge.source().id();
  const b = edge.target().id();
  for (const item of pool) {
    if (item.used) continue;
    const sameEnds = (item.a === a && item.b === b) || (item.a === b && item.b === a);
    if (!sameEnds || item.type !== type || !statedInNote(item.gloss, note)) continue;
    item.used = true;
    return item.gloss ? type + " · " + item.gloss : type;
  }
  const peers = [];
  const cy = state.cy;
  if (cy) {
    cy.edges().forEach((other) => {
      if (other.id() === edge.id() || other.data("meta")) return;
      const oa = other.source().id();
      const ob = other.target().id();
      if ((oa === a && ob === b) || (oa === b && ob === a)) peers.push(other.data("note") || "");
    });
  }
  const gloss = noteGloss(note, peers);
  return gloss ? type + " · " + gloss : type;
}

function chartSource(row) {
  const cy = state.cy;
  const ids = cardNodeIds(row);
  if (!cy || !ids.length) return "";
  const pool = parseMermaidEdges(row.mermaid || "");
  const lines = ["flowchart LR"];
  ids.forEach((id) => {
    const node = cy.getElementById(id);
    lines.push("  " + id + '["' + mermaidEscape(node.data("label") || id) + '"]');
  });
  edgesAmong(ids).forEach((edge) => {
    const arrow = edge.data("directed") ? "-->" : "---";
    lines.push(
      "  " + edge.source().id() + " " + arrow + '|"' + mermaidEscape(labelFor(edge, pool)) + '"| ' + edge.target().id()
    );
  });
  return lines.join("\n");
}

function tableHtml(attrs) {
  if (!attrs) return "";
  const columns = attrs.columns || [];
  const body = attrs.rows || [];
  const head = columns
    .map((col) => {
      const label = columnLabel(col);
      const id = columnId(col);
      if (!id || !nodeLive(id)) return `<th scope="col">${esc(label)}</th>`;
      return (
        `<th scope="col">` +
        `<button type="button" class="reading-jump" data-jump="${esc(id)}">${esc(label)}</button>` +
        `</th>`
      );
    })
    .join("");
  const bodyHtml = body
    .map((row) => {
      const cells = (row || [])
        .map((cell, i) => {
          const tag = i === 0 ? "th" : "td";
          const scope = i === 0 ? ' scope="row"' : "";
          const text = cell == null ? "" : String(cell);
          return `<${tag}${scope}>${esc(text)}</${tag}>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table class="reading-table"><thead><tr>${head}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

function alsoHtml(row) {
  const columns = (row.attributes && row.attributes.columns) || [];
  const headed = new Set(columns.map(columnId).filter(Boolean));
  const extra = definedNodes(row.mermaid || "").filter((node) => !headed.has(node.id) && nodeLive(node.id));
  if (!extra.length) return "";
  const buttons = extra
    .map(
      (node) =>
        `<button type="button" class="reading-jump" data-jump="${esc(node.id)}">${esc(node.label)}</button>`
    )
    .join("");
  return `<p class="reading-also"><span>Also in the chart</span> ${buttons}</p>`;
}

export async function renderReading(panel) {
  try {
    if (!rows) rows = await loadReadings();
  } catch (err) {
    panel.innerHTML = `<p class="sheet-note">${esc(err && err.message ? err.message : err)}</p>`;
    return;
  }
  if (!rows.length) {
    panel.innerHTML = `<p class="sheet-note">No readings in data/readings.yaml.</p>`;
    return;
  }
  if (!selected || !rows.some((row) => row.id === selected)) selected = rows[0].id;
  const row = rows.find((item) => item.id === selected);
  const tabs = rows
    .map((item) => {
      const on = item.id === selected ? " active" : "";
      const pressed = item.id === selected ? "true" : "false";
      return (
        `<button type="button" class="reading-tab${on}" data-reading="${esc(item.id)}" aria-pressed="${pressed}">` +
        `${esc(item.title || item.id)}</button>`
      );
    })
    .join("");
  panel.innerHTML =
    `<div class="reading">` +
    `<div class="reading-tabs" role="tablist">${tabs}</div>` +
    `<article class="reading-card">` +
    `<div class="reading-chart" id="reading-chart" role="img" aria-label="${esc(row.title || "Chart")}"></div>` +
    `<div class="reading-note">` +
    `<h2>${esc(row.title || "")}</h2>` +
    `<p class="reading-status">${esc(row.status || "")}</p>` +
    `<p class="reading-claim">${esc(row.claim || "")}</p>` +
    tableHtml(row.attributes) +
    `<h3>Confirmed</h3>` +
    `<p>${esc(row.confirmed || "")}</p>` +
    `<h3>Open</h3>` +
    `<p>${esc(row.open || "")}</p>` +
    alsoHtml(row) +
    `</div></article></div>`;

  panel.querySelectorAll("[data-reading]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.getAttribute("data-reading");
      if (!next || next === selected) return;
      selected = next;
      renderReading(panel);
    });
  });

  const chart = panel.querySelector("#reading-chart");
  const src = chartSource(row);
  if (!chart) return;
  if (!src) {
    chart.innerHTML = `<p class="sheet-note">No field figure in this reading.</p>`;
    return;
  }
  try {
    const api = mermaidApi();
    renderSeq += 1;
    const { svg } = await api.render("reading-graph-" + renderSeq, src);
    if (!chart.isConnected) return;
    chart.innerHTML = svg;
  } catch (err) {
    if (!chart.isConnected) return;
    chart.innerHTML = `<p class="sheet-note">${esc(err && err.message ? err.message : err)}</p>`;
  }
}
