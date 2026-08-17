const DOMAIN_COLOR = {
  platonic: "#e0b84e",
  mystical: "#9b6bdb",
  scientific: "#5b8def",
  religious: "#3fa36a"
};

const EDGE_COLOR = {
  gold: "#c9a227",
  cyan: "#3ec1d3",
  magenta: "#d4539b",
  green: "#3fa36a",
  red: "#d4544a",
  orange: "#d47a2c"
};

const detail = document.getElementById("detail");
const status = document.getElementById("status");

const layoutOpts = {
  name: "cose",
  animate: false,
  padding: 30,
  nodeOverlap: 20,
  idealEdgeLength: 110,
  nodeRepulsion: 7000,
  gravity: 0.9
};

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
      domain: n.domain,
      stage: n.stage == null ? "" : String(n.stage),
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

function showNode(d) {
  const stage = d.stage ? ` · stage ${d.stage}` : "";
  const role = d.role ? ` · ${d.role}` : "";
  detail.innerHTML =
    `<h2>${esc(d.label)}</h2>` +
    `<div class="meta"><code>${esc(d.id)}</code> · ${esc(d.domain)}${esc(stage)}${esc(role)}</div>` +
    `<p>${esc(d.description.trim())}</p>` +
    (d.refs ? `<div class="refs">${esc(d.refs)}</div>` : "");
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

function checked(kind) {
  return new Set(
    [...document.querySelectorAll(`input[data-kind="${kind}"]:checked`)].map((el) => el.value)
  );
}

function applyFilter(cy) {
  const domains = checked("domain");
  const types = checked("etype");
  cy.nodes().forEach((n) => {
    n.style("display", domains.has(n.data("domain")) ? "element" : "none");
  });
  cy.edges().forEach((e) => {
    const okType = types.has(e.data("type"));
    const okEnds = e.source().visible() && e.target().visible();
    e.style("display", okType && okEnds ? "element" : "none");
  });
  const vn = cy.nodes(":visible").length;
  const ve = cy.edges(":visible").length;
  status.textContent = vn + " nodes · " + ve + " edges";
}

async function init() {
  let data;
  try {
    data = await loadData();
  } catch (err) {
    document.getElementById("wrap").innerHTML =
      `<div class="err"><p>Could not load <code>data/nodes.yaml</code> / <code>data/edges.yaml</code>.</p>` +
      `<p>From the repository root run:</p>` +
      `<p><code>python -m http.server 8000</code></p>` +
      `<p>then open <code>http://localhost:8000/viewer/</code>.</p>` +
      `<p>${esc(err && err.message)}</p></div>`;
    return;
  }

  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: toElements(data.nodes, data.edges),
    layout: layoutOpts,
    minZoom: 0.2,
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
          "text-max-width": 90,
          "text-valign": "bottom",
          "text-margin-y": 4,
          width: 18,
          height: 18,
          "background-color": (el) => DOMAIN_COLOR[el.data("domain")] || "#888",
          "border-width": 1,
          "border-color": "#111"
        }
      },
      {
        selector: "node[stage != '']",
        style: { width: 24, height: 24, "border-width": 2, "border-color": "#f2e6b8" }
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

  cy.on("tap", "node", (evt) => showNode(evt.target.data()));
  cy.on("tap", "edge", (evt) => showEdge(evt.target.data()));
  cy.on("tap", (evt) => {
    if (evt.target === cy) {
      detail.innerHTML =
        `<p class="empty">${data.nodes.length} nodes, ${data.edges.length} edges. Filter with the checkboxes.</p>`;
    }
  });

  document.querySelectorAll("input[type=checkbox]").forEach((el) => {
    el.addEventListener("change", () => applyFilter(cy));
  });
  document.getElementById("fit").addEventListener("click", () => {
    cy.fit(cy.elements(":visible"), 30);
  });
  document.getElementById("relayout").addEventListener("click", () => {
    cy.layout(layoutOpts).run();
  });

  applyFilter(cy);
}

init();
