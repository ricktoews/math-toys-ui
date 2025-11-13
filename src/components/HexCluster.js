import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, ButtonGroup } from "react-bootstrap";

export default function HexCluster({
  initialN = 4,
  showControls = true,
  verticalOffsetPx = -40,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // Responsive square (CSS pixels)
  const [size, setSize] = useState({ w: 900, h: 900 });

  const [n, setN] = useState(Math.max(2, Math.floor(initialN)));
  const [mode, setMode] = useState("hex"); // 'hex' | 'square'

  // Animation/particles
  const ptsRef = useRef([]); // array of {group, idx, color, rad, hex:{x,y}, sq:{x,y}, x,y}
  const extrasPhaseRef = useRef("hidden"); // 'hidden' | 'fadingIn' | 'shown'
  const extrasAlphaRef = useRef(0);

  // Visuals
  const wedgeFill = useMemo(
    () => ["#bcd4e6", "#d0f0c0", "#ffe4b5", "#f7c8d0", "#e8d3ff", "#faf3b3"],
    []
  );
  const extra1 = "#f5d6b0";
  const extra2 = "#c7e6e2";
  const centerColor = "#9dc5bb";
  const stroke = "#555";

  // Axial dirs (flat-top): E, NE, NW, W, SW, SE
  const DIRS = useMemo(
    () => [
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
    ],
    []
  );

  // ===== Responsive canvas =====
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(320, Math.floor(cr.width));
      setSize({ w, h: w });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ===== Geometry builders (unit scale first) =====
  const SQRT3 = Math.sqrt(3);

  function hexToPixelUnit(q, r, sUnit) {
    const x = 1.5 * sUnit * q;
    const y = SQRT3 * sUnit * (r + q / 2);
    return [x, y];
  }

  function buildCells(radius) {
    const cells = new Map();
    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        const z = -q - r;
        if (Math.abs(z) <= radius) cells.set(`${q},${r}`, { q, r });
      }
    }
    return cells;
  }

  function buildRingsCW(radius) {
    const rings = [];
    rings[0] = [[0, 0]];
    for (let ring = 1; ring <= radius; ring++) {
      let q = 0,
        p = -ring;
      const arr = [];
      const stepDirs = [0, 5, 4, 3, 2, 1]; // E, SE, SW, W, NW, NE (clockwise)
      for (let side = 0; side < 6; side++) {
        const [dq, dp] = DIRS[stepDirs[side]];
        for (let i = 0; i < ring; i++) {
          arr.push([q, p]);
          q += dq;
          p += dp;
        }
      }
      rings[ring] = arr;
    }
    return rings;
  }

  function ringSides(ringArray, r) {
    return Array.from({ length: 6 }, (_, k) =>
      ringArray.slice(k * r, k * r + r)
    );
  }

  function buildWedgesBySides(rings, radius) {
    const wedges = Array.from({ length: 6 }, () => []);
    for (let r = 1; r <= radius; r++) {
      const sides = ringSides(rings[r], r);
      for (let k = 0; k < 6; k++) wedges[k].push(...sides[k]);
    }
    return wedges;
  }

  function buildSquareOctantTriangles(k) {
    // 8 right-triangles that make the (2k+1) square
    const L = Array.from({ length: 8 }, () => []);
    for (let d = 1; d <= k; d++) {
      for (let i = 1; i <= d; i++) L[0].push([-d - 1 + i, -d]); // top-left
      for (let i = 1; i <= d; i++) L[1].push([i - 1, -d]); // top-right   => top rect = (0,1)
      for (let i = 1; i <= d; i++) L[2].push([d, -d - 1 + i]); // right-top
      for (let i = 1; i <= d; i++) L[3].push([d, i - 1]); // right-bottom => right rect = (2,3)
      for (let i = 1; i <= d; i++) L[4].push([d + 1 - i, d]); // bottom-right
      for (let i = 1; i <= d; i++) L[5].push([-i + 1, d]); // bottom-left  => bottom rect = (4,5)
      for (let i = 1; i <= d; i++) L[6].push([-d, d + 1 - i]); // left-bottom
      for (let i = 1; i <= d; i++) L[7].push([-d, -i + 1]); // left-top     => left rect = (6,7)
    }
    return L;
  }

  // ===== Unified sizing =====
  const MARGIN = 18;
  const GAPU = 0.06; // tiny unit gap so dots don't touch

  function minHexNeighborDistUnit() {
    let d = Infinity;
    for (const [dq, dr] of DIRS) {
      const [x, y] = hexToPixelUnit(dq, dr, 1);
      d = Math.min(d, Math.hypot(x, y));
    }
    return d;
  }

  function measureBoundsHexUnit(nLocal, ru) {
    const rad = nLocal - 1;
    const c = buildCells(rad);
    let minX = 1e9,
      maxX = -1e9,
      minY = 1e9,
      maxY = -1e9;
    c.forEach(({ q, r }) => {
      const [x, y] = hexToPixelUnit(q, r, 1);
      minX = Math.min(minX, x - ru);
      maxX = Math.max(maxX, x + ru);
      minY = Math.min(minY, y - ru);
      maxY = Math.max(maxY, y + ru);
    });
    return { width: maxX - minX, height: maxY - minY };
  }

  function measureBoundsSquareUnit(nLocal, ru) {
    const k = nLocal - 1;
    const L = buildSquareOctantTriangles(k);
    let minX = -ru,
      maxX = ru,
      minY = -ru,
      maxY = ru; // include center
    for (const tri of L) {
      for (const [ix, iy] of tri) {
        minX = Math.min(minX, ix - ru);
        maxX = Math.max(maxX, ix + ru);
        minY = Math.min(minY, iy - ru);
        maxY = Math.max(maxY, iy + ru);
      }
    }
    return { width: maxX - minX, height: maxY - minY };
  }

  function computeUnifiedScale(nLocal, cssW, cssH) {
    const dHexU = minHexNeighborDistUnit();
    const rHexU = 0.5 * dHexU - GAPU;
    const rSqU = 0.5 * 1 - GAPU;
    const ru = Math.max(0.02, Math.min(rHexU, rSqU)); // unit circle radius

    const hexB = measureBoundsHexUnit(nLocal, ru);
    const sqB = measureBoundsSquareUnit(nLocal, ru);
    const needW = Math.max(hexB.width, sqB.width);
    const needH = Math.max(hexB.height, sqB.height);
    const scale = Math.max(
      0.01,
      Math.min((cssW - 2 * MARGIN) / needW, (cssH - 2 * MARGIN) / needH)
    );

    const g = scale; // grid (square) unit pixel size
    const sUnit = (2 * (ru + GAPU)) / dHexU; // hex side length in unit coords
    const s = sUnit * scale; // hex side length in pixels
    const r = ru * scale; // circle radius in pixels
    return { s, g, r };
  }

  // ===== Build positions and particle set =====
  const TRI_FOR_WEDGE = [0, 1, 2, 5, 6, 7]; // 6 used triangles
  const EXTRA_TRIS = [3, 4]; // the remaining rectangle (right-bottom, bottom-right)

  function buildPositions(nLocal, W, H) {
    const { s, g, r } = computeUnifiedScale(nLocal, W, H);
    const CX = W / 2;
    const CY = H / 2 + verticalOffsetPx;

    const k = nLocal - 1;

    // Hex positions
    const rings = buildRingsCW(k);
    const wedges = buildWedgesBySides(rings, k);
    const hexPos = {
      center: (function () {
        const [x, y] = hexToPixelUnit(0, 0, s);
        return { x: CX + x, y: CY + y };
      })(),
      wedges: wedges.map((wg) =>
        wg.map(([q, rq]) => {
          const [x, y] = hexToPixelUnit(q, rq, s);
          return { x: CX + x, y: CY + y };
        })
      ),
    };

    // Square positions
    const lists = buildSquareOctantTriangles(k);
    const toPix = (ix, iy) => ({ x: CX + ix * g, y: CY + iy * g });
    const sqPos = {
      center: toPix(0, 0),
      tris: lists.map((a) => a.map(([ix, iy]) => toPix(ix, iy))),
    };

    return { r, hexPos, sqPos, T: (k * (k + 1)) / 2, k };
  }

  function rebuildParticles(nLocal, W, H, targetMode) {
    const { r, hexPos, sqPos, T } = buildPositions(nLocal, W, H);
    const pts = [];

    // Center
    pts.push({
      group: "center",
      color: centerColor,
      idx: 0,
      hex: hexPos.center,
      sq: sqPos.center,
      x: targetMode === "hex" ? hexPos.center.x : sqPos.center.x,
      y: targetMode === "hex" ? hexPos.center.y : sqPos.center.y,
      rad: r,
    });

    // 6 wedges → mapped 6 triangles
    for (let w = 0; w < 6; w++) {
      const triIdx = TRI_FOR_WEDGE[w];
      for (let i = 0; i < T; i++) {
        const Hpos = hexPos.wedges[w][i];
        const Spos = sqPos.tris[triIdx][i];
        pts.push({
          group: `wedge${w}`,
          color: wedgeFill[w],
          idx: i,
          hex: Hpos,
          sq: Spos,
          x: targetMode === "hex" ? Hpos.x : Spos.x,
          y: targetMode === "hex" ? Hpos.y : Spos.y,
          rad: r,
        });
      }
    }

    // 2 extra triangles (hidden when hex)
    for (let ti = 0; ti < EXTRA_TRIS.length; ti++) {
      const t = EXTRA_TRIS[ti];
      for (let i = 0; i < T; i++) {
        const Spos = sqPos.tris[t][i];
        const OFF = { x: -99999, y: -99999 };
        pts.push({
          group: `extra${t}`,
          color: ti === 0 ? extra1 : extra2,
          idx: i,
          hex: OFF,
          sq: Spos,
          x: targetMode === "square" ? Spos.x : OFF.x,
          y: targetMode === "square" ? Spos.y : OFF.y,
          rad: r,
        });
      }
    }

    ptsRef.current = pts;
  }

  // ===== Draw =====
  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = parseFloat(getComputedStyle(canvas).width);
    const H = parseFloat(getComputedStyle(canvas).height);

    ctx.clearRect(0, 0, W, H);

    // extras visibility
    const showExtras = mode === "square" && extrasPhaseRef.current !== "hidden";
    const order = showExtras
      ? ["extra3", "extra4", "wedge0", "wedge1", "wedge2", "wedge3", "wedge4", "wedge5", "center"]
      : ["wedge0", "wedge1", "wedge2", "wedge3", "wedge4", "wedge5", "center"];

    for (const g of order) {
      for (const p of ptsRef.current) {
        if (p.group !== g) continue;
        if (g.startsWith("extra") && !showExtras) continue;

        const saved = ctx.globalAlpha;
        if (g.startsWith("extra")) ctx.globalAlpha = extrasAlphaRef.current;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = stroke;
        ctx.stroke();

        ctx.globalAlpha = saved;
      }
    }
  }

  // ===== Canvas setup & rebuild on size/n/mode changes =====
  function syncToMode() {
    for (const p of ptsRef.current) {
      const tgt = mode === "hex" ? p.hex : p.sq;
      p.x = tgt.x;
      p.y = tgt.y;
    }
  }

  function resizeBackingStore() {
    const canvas = canvasRef.current;
    const { w, h } = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    resizeBackingStore();
    rebuildParticles(n, size.w, size.h, mode);
    if (mode === "square") {
      extrasPhaseRef.current = "shown";
      extrasAlphaRef.current = 1;
    } else {
      extrasPhaseRef.current = "hidden";
      extrasAlphaRef.current = 0;
    }
    syncToMode();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, n]);

  // ===== Morph animation (always on) =====
  const MOVE_DUR = 600; // ms
  const FADE_DUR = 350; // ms
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  function startMorph(next) {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setMode(next);

    const from = ptsRef.current.map((p) => ({ x: p.x, y: p.y }));
    const to = ptsRef.current.map((p) => (next === "hex" ? p.hex : p.sq));

    extrasPhaseRef.current = "hidden";
    extrasAlphaRef.current = 0;

    const start = performance.now();
    const move = (now) => {
      const t = Math.min(1, (now - start) / MOVE_DUR);
      const tt = easeInOut(t);
      for (let i = 0; i < ptsRef.current.length; i++) {
        ptsRef.current[i].x = lerp(from[i].x, to[i].x, tt);
        ptsRef.current[i].y = lerp(from[i].y, to[i].y, tt);
      }
      draw();
      if (t < 1) {
        rafRef.current = requestAnimationFrame(move);
      } else {
        rafRef.current = null;
        if (next === "square") {
          const fStart = performance.now();
          extrasPhaseRef.current = "fadingIn";
          extrasAlphaRef.current = 0;
          const fade = (now2) => {
            const tf = Math.min(1, (now2 - fStart) / FADE_DUR);
            extrasAlphaRef.current = tf;
            draw();
            if (tf < 1) {
              rafRef.current = requestAnimationFrame(fade);
            } else {
              extrasPhaseRef.current = "shown";
              extrasAlphaRef.current = 1;
              rafRef.current = null;
              draw();
            }
          };
          rafRef.current = requestAnimationFrame(fade);
        } else {
          draw();
        }
      }
    };
    rafRef.current = requestAnimationFrame(move);
  }

  // ===== Controls =====
  const decN = () => {
    const v = Math.max(2, n - 1);
    if (v === n) return;
    setN(v);
  };
  const incN = () => setN(n + 1);
  const toggleMode = () => startMorph(mode === "hex" ? "square" : "hex");

  const downloadPNG = () => {
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `morph_n${n}_${mode}_${stamp}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && e.target.closest && e.target.closest("input,textarea,select")) return;
      const k = (e.key || "").toLowerCase();
      if (k === "h") startMorph("hex");
      if (k === "s") startMorph("square");
      if (e.key === "-") decN();
      if (e.key === "=" || e.key === "+") incN(); // US kb: '=' is '+' with shift
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, mode]);

  // Rebuild particles when mode updates so immediate redraws use new targets
  useEffect(() => {
    rebuildParticles(n, size.w, size.h, mode);
    syncToMode();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      {showControls && (
        <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
          <ButtonGroup aria-label="Set n">
            <Button variant="outline-secondary" onClick={decN} title="Decrease n">
              –
            </Button>
            <Button variant="light" disabled style={{ minWidth: 56 }}>
              n: {n}
            </Button>
            <Button variant="outline-secondary" onClick={incN} title="Increase n">
              +
            </Button>
          </ButtonGroup>

          <Button
            className="app-btn"
            variant="primary"
            onClick={toggleMode}
            title={mode === "hex" ? "Show: Square (add 2 triangles)" : "Show: Hex (remove 2 triangles)"}
          >
            {mode === "hex" ? "Show: Square (add 2 triangles)" : "Show: Hex (remove 2 triangles)"}
          </Button>

          <Button className="app-btn" variant="outline-secondary" onClick={downloadPNG}>
            Download PNG
          </Button>

          <div className="ms-auto small text-muted">
            Click canvas to toggle • Keys: H (hex), S (square)
          </div>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            border: "1px solid #ccc",
            background: "#fff",
            width: "100%",
            height: "auto",
            aspectRatio: "1 / 1",
            cursor: "pointer",
          }}
          onClick={toggleMode}
        />
        {/* Live math panel */}
        <div
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            background: "#ffffffd8",
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            lineHeight: 1.3,
            boxShadow: "0 2px 12px rgba(0,0,0,.06)",
          }}
        >
          {(() => {
            const k = n - 1;
            const Tk = (k * (k + 1)) / 2;
            const side = 2 * n - 1;
            const shownHex = 1 + 6 * Tk;
            const shownSquare = side * side;
            return (
              <>
                <div>
                  <strong>Live math</strong>
                </div>
                <div>
                  n = <code>{n}</code>, k = n−1 = <code>{k}</code>, T<sub>k</sub> = <code>{Tk}</code>
                </div>
                <div>
                  (2n−1)² = <code>({side})² = {side * side}</code>
                </div>
                <div className="text-muted">
                  Identity: <code>1 + 6·T<sub>k</sub> + 2·T<sub>k</sub> = (2n−1)²</code>
                </div>
                <div className="text-muted">
                  now showing:&nbsp;
                  {mode === "square" ? (
                    <code>
                      1 + 6·T<sub>k</sub> + 2·T<sub>k</sub> = {shownSquare}
                    </code>
                  ) : (
                    <code>1 + 6·T<sub>k</sub> = {shownHex}</code>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

HexCluster.propTypes = {
  initialN: PropTypes.number,
  showControls: PropTypes.bool,
  verticalOffsetPx: PropTypes.number,
};
