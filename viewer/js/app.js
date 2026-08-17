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
  gnostic: "#c45ad4",
  hermetic: "#7ec8e3",
  neoplatonic: "#d4a24c",
  kabbalistic: "#6b8ee8",
  alchemical: "#d4c07a",
  scientific: "#5b8def",
  christian: "#e8e0c8",
  biblical: "#c4b896",
  egyptian: "#d4a017",
  hindu: "#e07a3d",
  buddhist: "#8f8fd4",
  zoroastrian: "#d4544a",
  orphic: "#b86b6b",
  "hellenic-mystery": "#9a7a4c",
  jungian: "#9b6bdb",
  theosophical: "#7a5a9a",
  sufi: "#3fa36a",
  norse: "#6a8a9a",
  mesopotamian: "#c48a4a",
  mythic: "#888070"
};

const EDGE_TYPES = ["gold", "cyan", "magenta", "green", "red", "orange"];
const LATERALS = new Set(["orange", "cyan"]);

const detail = document.getElementById("detail");
const status = document.getElementById("status");

const layoutOpts = {
  name: "cose",
  animate: false,
  padding: 30,
  nodeOverlap: 24,
  idealEdgeLength: 120,
  nodeRepulsion: 8000,
  gravity: 0.85
};

let cy = null;
let focusId = null;
let lateralOnly = false;

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
  detail.innerHTML =
    `<h2>${esc(d.type)} edge</h2>` +
    `<div class="meta"><code>${esc(d.source)}</code> → <code>${esc(d.target)}</code>` +
    ` · strength ${esc(String(d.strength))}` +
    (d.directed ? "" : " · undirected") +
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

  cy.nodes().forEach((n) => {
    const d = n.data();
    let ok = kinds.has(d.kind) && clusters.has(d.cluster);
    if (ok && q) {
      ok = d.label.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    }
    if (ok && focusSet.size) ok = focusSet.has(d.id);
    n.style("display", ok ? "element" : "none");
  });

  cy.edges().forEach((e) => {
    const okType = types.has(e.data("type"));
    const okEnds = e.source().visible() && e.target().visible();
    let okFocus = true;
    if (focusSet.size) {
      okFocus = focusSet.has(e.source().id()) && focusSet.has(e.target().id());
    }
    e.style("display", okType && okEnds && okFocus ? "element" : "none");
  });

  const vn = cy.nodes(":visible").length;
  const ve = cy.edges(":visible").length;
  status.textContent = vn + " nodes · " + ve + " edges";
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
      `<p>From the repository root run a free high port, e.g.</p>` +
      `<p><code>python -m http.server 8765</code></p>` +
      `<p>then open <code>http://localhost:8765/viewer/</code>.</p>` +
      `<p>${esc(err && err.message)}</p></div>`;
    return;
  }

  const clusters = uniqueSorted(data.nodes.map((n) => n.cluster).filter(Boolean));
  const kinds = uniqueSorted(data.nodes.map((n) => n.kind).filter(Boolean));
  mountChecks(document.getElementById("kind-filters"), kinds, "kind", () => "#888");
  mountChecks(document.getElementById("cluster-filters"), clusters, "cluster", clusterColor);
  mountChecks(document.getElementById("type-filters"), EDGE_TYPES, "etype", (t) => EDGE_COLOR[t]);

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: toElements(data.nodes, data.edges),
    layout: layoutOpts,
    minZoom: 0.15,
    maxZoom: 3,
    wheelSensitivity: 0.3,
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          color: "#ece6d8",
          "font-size": 10,
          "font-family": "Segoe UI, Georgia, serif",
          "text-wrap": "wrap",
          "text-max-width": 92,
          "text-valign": "bottom",
          "text-margin-y": 4,
          width: 16,
          height: 16,
          "background-color": (el) => clusterColor(el.data("cluster")),
          "border-width": 1,
          "border-color": "#111"
        }
      },
      {
        selector: "node[kind = 'system']",
        style: { width: 26, height: 26, "border-width": 2, "border-color": "#f2e6b8" }
      },
      {
        selector: "edge",
        style: {
          width: (el) => 0.8 + 2.2 * (el.data("strength") || 0.5),
          "line-color": (el) => EDGE_COLOR[el.data("type")] || "#666",
          "target-arrow-color": (el) => EDGE_COLOR[el.data("type")] || "#666",
          "target-arrow-shape": (el) => (el.data("directed") ? "triangle" : "none"),
          "curve-style": "bezier",
          opacity: 0.75
        }
      },
      {
        selector: ":selected",
        style: { "border-color": "#fff", "border-width": 3, opacity: 1 }
      }
    ]
  });

  cy.on("tap", "node", (evt) => {
    focusId = evt.target.id();
    showNode(evt.target.data());
    applyFilter();
  });
  cy.on("tap", "edge", (evt) => showEdge(evt.target.data()));
  cy.on("tap", (evt) => {
    if (evt.target === cy) {
      focusId = null;
      applyFilter();
      detail.innerHTML =
        `<p class="empty">${data.nodes.length} nodes, ${data.edges.length} edges. Click a node to focus its neighbourhood.</p>`;
    }
  });

  document.getElementById("search").addEventListener("input", applyFilter);
  document.getElementById("clusters-all").addEventListener("click", () => {
    setChecks("cluster", () => true);
    applyFilter();
  });
  document.getElementById("clusters-none").addEventListener("click", () => {
    setChecks("cluster", () => false);
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
    cy.elements().unselect();
    applyFilter();
  });
  document.getElementById("fit").addEventListener("click", () => {
    cy.fit(cy.elements(":visible"), 30);
  });
  document.getElementById("relayout").addEventListener("click", () => {
    cy.layout(layoutOpts).run();
  });

  bindFilterChanges();
  applyFilter();
}

init();
