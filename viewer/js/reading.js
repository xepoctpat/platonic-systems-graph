import { esc, loadReadings } from "./data.js";

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

function tableHtml(attrs) {
  if (!attrs) return "";
  const columns = attrs.columns || [];
  const body = attrs.rows || [];
  const head = columns
    .map((col) => {
      const label = columnLabel(col);
      const id = columnId(col);
      if (!id) return `<th scope="col">${esc(label)}</th>`;
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
  const extra = definedNodes(row.mermaid || "").filter((node) => !headed.has(node.id));
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
  const src = String(row.mermaid || "").trim();
  if (!chart || !src) return;
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
