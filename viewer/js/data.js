export const EDGE_COLOR = {
  gold: "#c9a227",
  cyan: "#3ec1d3",
  magenta: "#d4539b",
  green: "#3fa36a",
  red: "#d4544a",
  orange: "#d47a2c"
};

export const CLUSTER_COLOR = {
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
  hellenic: "#8a6048",
  roman: "#9a3a3a",
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

const COMMUNITY_COLOR = [
  "#f4efe4",
  "#7ec8e3",
  "#e07a3d",
  "#3fa36a",
  "#d47a2c",
  "#c9a227",
  "#8f8fd4",
  "#d4544a",
  "#6b8ee8",
  "#c46b2b",
  "#1f7a88",
  "#c45ad4"
];

export const EDGE_TYPES = ["gold", "cyan", "magenta", "green", "red", "orange"];
export const FLOW_TYPES = ["gold", "green", "red"];
export const MAP_TYPES = ["cyan", "magenta", "orange"];
export const SLOT_TYPES = new Set(["gold", "cyan", "magenta"]);
export const LATERALS = new Set(["orange", "cyan"]);
export const HEAVY_MIN = 3;
export const HEAVY_CAP = 3;
export const EDGE_MEANING = {
  gold: "constitutes",
  cyan: "same slot, not the same thing",
  magenta: "same slot, opposite valuation",
  green: "returns",
  red: "falls / shatters",
  orange: "mixes"
};
export const ZOOM_SHOW_PRINCIPLES = 1.15;
export const TYPE_PREF = { gold: 0, green: 1, cyan: 2, orange: 3, red: 4, magenta: 5 };
export const FINDING_ORDER = ["magenta", "orange", "red", "green", "gold", "cyan"];
export const LOUD_BRIDGES = new Set(["magenta", "orange", "red", "green", "gold"]);

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function clusterColor(name) {
  if (CLUSTER_COLOR[name]) return CLUSTER_COLOR[name];
  let h = 0;
  const label = String(name || "");
  for (let i = 0; i < label.length; i += 1) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 42% 55%)`;
}

export function communityColor(id) {
  const n = Number(id);
  if (!n) return "#888";
  if (n <= COMMUNITY_COLOR.length) return COMMUNITY_COLOR[n - 1];
  return `hsl(${(n * 47) % 360} 45% 58%)`;
}

export function mixLabel(counts, total) {
  const parts = EDGE_TYPES.map((t) => [t, counts[t] || 0])
    .filter(([, n]) => n > 0)
    .sort(
      (a, b) =>
        b[1] - a[1] ||
        FINDING_ORDER.indexOf(a[0]) - FINDING_ORDER.indexOf(b[0])
    );
  const body = parts.map(([t, n]) => `${t} ${n}`).join(" · ");
  const sum = total == null ? parts.reduce((s, [, n]) => s + n, 0) : total;
  return body ? `${sum} · ${body}` : String(sum);
}

export function shortMix(counts, total) {
  let best = "";
  let n = 0;
  EDGE_TYPES.forEach((t) => {
    const count = counts[t] || 0;
    if (count > n) {
      n = count;
      best = t;
    }
  });
  const sum = total == null ? EDGE_TYPES.reduce((s, t) => s + (counts[t] || 0), 0) : total;
  return best ? `${sum} · ${best}` : String(sum);
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function dataUrl(name) {
  return new URL("../../data/" + name, import.meta.url).href;
}

async function loadYaml(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + " → " + res.status);
  return globalThis.jsyaml.load(await res.text());
}

export async function loadData() {
  const nodesDoc = await loadYaml(dataUrl("nodes.yaml"));
  const edgesDoc = await loadYaml(dataUrl("edges.yaml"));
  return { nodes: nodesDoc.nodes, edges: edgesDoc.edges };
}

export async function loadLatest() {
  try {
    const doc = await loadYaml(dataUrl("latest.yaml"));
    const nodes = (doc && doc.nodes) || [];
    return {
      pass: (doc && doc.pass) || "",
      label: (doc && doc.label) || "",
      nodes: nodes.filter(Boolean)
    };
  } catch (err) {
    return { pass: "", label: "", nodes: [] };
  }
}

export async function loadReadings() {
  const doc = await loadYaml(dataUrl("readings.yaml"));
  const readings = (doc && doc.readings) || [];
  if (!Array.isArray(readings)) throw new Error("readings.yaml has no readings list");
  return readings;
}

export async function loadView() {
  const path = dataUrl("view.json");
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + " → " + res.status);
  return await res.json();
}

export function toElements(nodes, edges, communities) {
  const comm = communities || {};
  const els = nodes.map((n) => ({
    data: {
      id: n.id,
      label: n.label,
      kind: n.kind || "principle",
      cluster: n.cluster || "",
      role: n.role || "",
      description: n.description || "",
      refs: (n.refs || []).join(" · "),
      community: comm[n.id] || ""
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
        versions: (e.versions || []).join(", "),
        note: e.note || ""
      }
    });
  });
  return els;
}
