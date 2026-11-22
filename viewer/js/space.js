import { EDGE_COLOR, clusterColor } from "./data.js";
import { state } from "./state.js";

const TYPE_ORDER = ["gold", "cyan", "magenta", "green", "red", "orange"];

export function mountSpace(canvas, onPick) {
  const ctx = canvas.getContext("2d");
  let yaw = 0.7;
  let pitch = 0.35;
  let dist = 4.4;
  let nodes = [];
  let edges = [];
  let level = "world";
  let focusChunk = -1;
  let focusSchool = "";
  let focusCluster = "";
  let running = false;
  let frameId = 0;
  let drag = null;
  let moved = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  }

  function chunkTitle(cy, clusters) {
    const titles = clusters.map((c) => {
      const systems = cy.nodes().filter((n) => n.data("kind") === "system" && n.data("cluster") === c);
      if (systems.length === 1) return systems[0].data("label") || c;
      const first = systems.length ? systems[0].data("label") : c;
      return (first || c) + " +" + Math.max(systems.length - 1, 0);
    });
    if (titles.length <= 2) return titles.join(" · ");
    return titles[0] + " · " + titles[1] + " +" + (titles.length - 2);
  }

  function rebuild() {
    const cy = state.cy;
    nodes = [];
    edges = [];
    if (!cy) return;
    const ring = (state.view && state.view.ring) || [];
    const rank = new Map(ring.map((c, i) => [c, i]));
    const clusters = [...new Set(cy.nodes().map((n) => n.data("cluster")).filter(Boolean))];
    clusters.sort((a, b) => (rank.get(a) ?? 1000) - (rank.get(b) ?? 1000) || a.localeCompare(b));
    const size = Math.max(3, Math.ceil(clusters.length / 8));
    const chunks = [];
    for (let i = 0; i < clusters.length; i += size) chunks.push(clusters.slice(i, i + size));
    const principleCount = new Map();
    const principleSlot = new Map();
    cy.nodes().forEach((n) => {
      if (n.data("kind") !== "principle") return;
      const c = n.data("cluster") || "other";
      principleCount.set(c, (principleCount.get(c) || 0) + 1);
    });
    const groupAt = [];
    chunks.forEach((list, i) => {
      const t = (i / chunks.length) * Math.PI * 2 - Math.PI / 2;
      const node = {
        id: "chunk-" + i,
        kind: "group",
        chunk: i,
        label: chunkTitle(cy, list),
        color: "#f2e6b8",
        x: Math.cos(t) * 2.6,
        y: 0,
        z: Math.sin(t) * 2.6
      };
      groupAt[i] = nodes.length;
      nodes.push(node);
    });

    const schoolAt = new Map();
    const principleAt = new Map();
    chunks.forEach((list, i) => {
      const hub = nodes[groupAt[i]];
      const schools = [];
      cy.nodes().forEach((n) => {
        if (n.data("kind") === "system" && list.indexOf(n.data("cluster")) >= 0) schools.push(n);
      });
      schools.sort((a, b) => String(a.data("label")).localeCompare(String(b.data("label"))));
      schools.forEach((n, j) => {
        const t = (j / Math.max(schools.length, 1)) * Math.PI * 2;
        const point = {
          id: n.id(),
          kind: "system",
          chunk: i,
          cluster: n.data("cluster"),
          label: n.data("label") || n.id(),
          color: clusterColor(n.data("cluster")),
          x: hub.x + Math.cos(t) * 0.62,
          y: 0.2,
          z: hub.z + Math.sin(t) * 0.62
        };
        schoolAt.set(point.id, nodes.length);
        nodes.push(point);
      });
      cy.nodes().forEach((n) => {
        if (n.data("kind") !== "principle" || list.indexOf(n.data("cluster")) < 0) return;
        const cluster = n.data("cluster");
        const slot = principleSlot.get(cluster) || 0;
        principleSlot.set(cluster, slot + 1);
        const point = {
          id: n.id(),
          kind: "principle",
          chunk: i,
          cluster,
          slot,
          slots: principleCount.get(cluster) || 1,
          label: n.data("label") || n.id(),
          color: clusterColor(n.data("cluster")),
          x: hub.x,
          y: hub.y,
          z: hub.z
        };
        principleAt.set(point.id, nodes.length);
        nodes.push(point);
      });
    });

    function endpoint(id) {
      if (schoolAt.has(id)) return { index: schoolAt.get(id), chunk: nodes[schoolAt.get(id)].chunk, school: id };
      if (principleAt.has(id)) {
        const node = nodes[principleAt.get(id)];
        return { index: principleAt.get(id), chunk: node.chunk, school: node.school || "", cluster: node.cluster };
      }
      return null;
    }

    const betweenGroups = new Map();
    const betweenSchools = new Map();
    const touches = [];
    cy.edges().forEach((e) => {
      if (e.data("meta")) return;
      const type = e.data("type") || "orange";
      const A = endpoint(e.source().id());
      const B = endpoint(e.target().id());
      if (!A || !B || A.index === B.index) return;
      if (A.chunk !== B.chunk) {
        const key = [Math.min(A.chunk, B.chunk), Math.max(A.chunk, B.chunk), type].join(":");
        betweenGroups.set(key, (betweenGroups.get(key) || 0) + 1);
        return;
      }
      if (A.school && B.school && A.school !== B.school) {
        const sa = schoolAt.get(A.school);
        const sb = schoolAt.get(B.school);
        if (sa == null || sb == null) return;
        const key = [Math.min(sa, sb), Math.max(sa, sb), type].join(":");
        betweenSchools.set(key, (betweenSchools.get(key) || 0) + 1);
        return;
      }
      touches.push({ a: A.index, b: B.index, type, cluster: A.cluster || B.cluster });
    });
    betweenGroups.forEach((count, key) => {
      const [ia, ib, type] = key.split(":");
      edges.push({
        kind: "groups",
        a: groupAt[Number(ia)],
        b: groupAt[Number(ib)],
        type,
        count
      });
    });
    betweenSchools.forEach((count, key) => {
      const [ia, ib, type] = key.split(":");
      edges.push({ kind: "schools", a: Number(ia), b: Number(ib), type, count, chunk: nodes[Number(ia)].chunk });
    });
    touches.forEach((edge) => edges.push({ kind: "touch", ...edge, count: 1 }));
  }

  function rotate(x, y, z) {
    const cyaw = Math.cos(yaw);
    const syaw = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const x1 = x * cyaw + z * syaw;
    const z1 = -x * syaw + z * cyaw;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  }

  function project(x, y, z) {
    const [x1, y1, z1] = rotate(x, y, z);
    const persp = dist / Math.max(0.35, dist + z1);
    const w = canvas.width;
    const h = canvas.height;
    const scale = Math.min(w, h) * 0.28;
    return { x: w / 2 + x1 * persp * scale, y: h / 2 - y1 * persp * scale, depth: z1, s: persp };
  }

  function posed(n) {
    if (level === "school" && n.kind === "principle" && n.cluster === focusCluster) {
      const host = nodes.find((item) => item.id === focusSchool);
      if (host) {
        const t = (n.slot / Math.max(n.slots, 1)) * Math.PI * 2;
        return {
          x: host.x + Math.cos(t) * 0.62,
          y: host.y + Math.sin(t) * 0.62,
          z: host.z
        };
      }
    }
    return n;
  }

  function visibleNode(n) {
    if (level === "world") return n.kind === "group";
    if (level === "group") return n.kind === "group" || (n.kind === "system" && n.chunk === focusChunk);
    if (n.kind === "principle" && n.cluster === focusCluster) return true;
    if (n.id === focusSchool) return true;
    return n.kind === "system" && edges.some((e) => e.kind === "touch" && e.cluster === focusCluster && (nodes[e.a].id === n.id || nodes[e.b].id === n.id));
  }

  function visibleEdge(e) {
    if (level === "world") return e.kind === "groups";
    if (level === "group") {
      if (e.kind === "schools") return e.chunk === focusChunk;
      if (e.kind === "groups") return nodes[e.a].chunk === focusChunk || nodes[e.b].chunk === focusChunk;
      return false;
    }
    return e.kind === "touch" && e.cluster === focusCluster;
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#9a9284";
    ctx.font = `${13 * dpr}px Segoe UI, Georgia, serif`;
    ctx.textAlign = "left";
    const caption = level === "world"
      ? "Peer groups · drag to rotate · no common ancestor"
      : level === "group"
        ? "Schools in this group · click empty space to step back"
        : "Principles of this school · click empty space to step back";
    ctx.fillText(caption, 16 * dpr, h - 18 * dpr);

    const shown = nodes.map((n) => ({ n, p: project(posed(n).x, posed(n).y, posed(n).z) })).filter((row) => visibleNode(row.n));
    const lines = [];
    edges.forEach((e) => {
      if (!visibleEdge(e)) return;
      const A = posed(nodes[e.a]);
      const B = posed(nodes[e.b]);
      const shift = (TYPE_ORDER.indexOf(e.type) - 2.5) * 0.06;
      const dx = B.x - A.x;
      const dz = B.z - A.z;
      const len = Math.hypot(dx, dz) || 1;
      lines.push({
        e,
        a: project(A.x + (-dz / len) * shift, A.y, A.z + (dx / len) * shift),
        b: project(B.x + (-dz / len) * shift, B.y, B.z + (dx / len) * shift)
      });
    });
    lines.sort((p, q) => p.a.depth + p.b.depth - (q.a.depth + q.b.depth));
    lines.forEach((line) => {
      ctx.strokeStyle = EDGE_COLOR[line.e.type] || "#888";
      ctx.globalAlpha = line.e.kind === "groups" && level !== "world" ? 0.35 : 0.92;
      ctx.lineWidth = Math.min(8, 1.2 + Math.sqrt(line.e.count) * 1.1) * dpr;
      ctx.beginPath();
      ctx.moveTo(line.a.x, line.a.y);
      ctx.lineTo(line.b.x, line.b.y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    shown.sort((a, b) => a.p.depth - b.p.depth);
    shown.forEach(({ n, p }) => {
      const radius = (n.kind === "group" ? 18 : n.kind === "system" ? 12 : 5) * p.s * dpr;
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(n.kind === "principle" ? 3 : 7, radius), 0, Math.PI * 2);
      ctx.fill();
      if (n.kind !== "principle") {
        ctx.strokeStyle = n.chunk === focusChunk && n.kind === "group" ? "#fff" : "#f2e6b8";
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        ctx.fillStyle = "#f4efe4";
        ctx.font = `${12 * dpr}px Segoe UI, Georgia, serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, p.x, p.y - radius - 8 * dpr);
      }
    });
  }

  function pick(px, py) {
    const dpr = window.devicePixelRatio || 1;
    const x = px * dpr;
    const y = py * dpr;
    let best = null;
    let bestD = 26 * dpr;
    nodes.forEach((n) => {
      if (!visibleNode(n) || n.kind === "principle") return;
      const p = project(n.x, n.y, n.z);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        best = n;
        bestD = d;
      }
    });
    return best;
  }

  function loop() {
    if (!running) return;
    draw();
    frameId = requestAnimationFrame(loop);
  }

  canvas.addEventListener("pointerdown", (ev) => {
    drag = { x: ev.clientX, y: ev.clientY, yaw, pitch };
    moved = 0;
    canvas.classList.add("dragging");
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener("pointermove", (ev) => {
    if (!drag) return;
    const dx = ev.clientX - drag.x;
    const dy = ev.clientY - drag.y;
    moved = Math.max(moved, Math.hypot(dx, dy));
    yaw = drag.yaw + dx * 0.008;
    pitch = Math.max(-1.15, Math.min(1.15, drag.pitch + dy * 0.008));
  });
  function endDrag(ev) {
    if (!drag) return;
    canvas.classList.remove("dragging");
    if (moved < 5) {
      const rect = canvas.getBoundingClientRect();
      const hit = pick(ev.clientX - rect.left, ev.clientY - rect.top);
      if (!hit) {
        if (level === "school") level = "group";
        else if (level === "group") {
          level = "world";
          focusChunk = -1;
          dist = 4.4;
        }
      } else if (level === "world" && hit.kind === "group") {
        level = "group";
        focusChunk = hit.chunk;
        dist = 2.8;
      } else if (hit.kind === "system") {
        level = "school";
        focusChunk = hit.chunk;
        focusSchool = hit.id;
        focusCluster = hit.cluster || "";
        dist = 2.2;
        if (onPick) onPick(hit.id);
      }
    }
    drag = null;
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", () => { drag = null; canvas.classList.remove("dragging"); });
  canvas.addEventListener("wheel", (ev) => {
    if (!running) return;
    ev.preventDefault();
    dist = Math.max(1.5, Math.min(9, dist * (ev.deltaY > 0 ? 1.08 : 0.92)));
  }, { passive: false });
  window.addEventListener("resize", () => { if (running) resize(); });

  return {
    show() {
      running = true;
      level = "world";
      focusChunk = -1;
      focusSchool = "";
      focusCluster = "";
      dist = 4.4;
      canvas.classList.add("on");
      resize();
      rebuild();
      cancelAnimationFrame(frameId);
      loop();
    },
    hide() {
      running = false;
      canvas.classList.remove("on");
      cancelAnimationFrame(frameId);
    },
    rebuild() {
      if (!running) return;
      rebuild();
    },
    resize() {
      if (!running) return;
      resize();
    }
  };
}
