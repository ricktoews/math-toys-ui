import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, InputGroup, Form } from "react-bootstrap";

/**
 * Responsive HexCluster for React
 * - Auto-sizes canvas to parent container width (square)
 * - HiDPI crisp lines
 * - Toggle triangles ↔ rings (buttons)
 * - Show/hide numbers (button)
 * - Robust mobile-friendly "n" input with +/- controls
 */
export default function HexCluster({
  initialN = 4,
  showControls = true,
  // Optional: override how high the cluster sits (fraction of canvas height; negative raises)
  verticalOffsetFactor = -0.14, // ~ -125px on a 900px canvas
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  // Responsive canvas size (CSS pixels)
  const [size, setSize] = useState({ w: 900, h: 900 });

  // n: validated number; rawN: text shown in input (can be empty while editing)
  const [n, setN] = useState(Math.max(1, Math.floor(initialN)));
  const [rawN, setRawN] = useState(String(Math.max(1, Math.floor(initialN))));

  const [showNums, setShowNums] = useState(true);
  const [colorByRing, setColorByRing] = useState(false);

  // Palettes
  const pastel = useMemo(
    () => ["#bcd4e6","#d0f0c0","#ffe4b5","#f7c8d0","#e8d3ff","#faf3b3"],
    []
  );
  // Rings palette = triangles + 2 harmonious additions
  const ringPastel = useMemo(
    () => [...pastel, "#c7e6e2", "#f5d6b0"],
    [pastel]
  );

  // Layout/paint constants
  const margin = 24;
  const strokeColor = "#666";
  const neutralFill = "#eee";
  const textColor = "#333";

  // Axial directions (flat-top), CW: E, NE, NW, W, SW, SE
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
  const key = (q, r) => `${q},${r}`;

  // ===== Responsive sizing =====
  useEffect(() => {
    if (!wrapRef.current) return;

    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(240, Math.floor(cr.width)); // keep sensible minimum
      const h = w; // square canvas
      setSize({ w, h });
    });

    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ===== Hex helpers & builders =====
  function computeSideLength(radius, cssW, cssH, m = margin) {
    if (radius <= 0) return Math.min(cssW, cssH) / 8; // nice center size
    const maxHalfX = 1.5 * radius + 1;
    const maxHalfY = Math.sqrt(3) * 1.5 * radius + 1;
    const sX = (cssW / 2 - m) / maxHalfX;
    const sY = (cssH / 2 - m) / maxHalfY;
    return Math.max(6, Math.min(sX, sY));
  }

  function buildCells(radius) {
    const cells = new Map();
    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        const z = -q - r;
        if (Math.abs(z) <= radius) cells.set(key(q, r), { q, r });
      }
    }
    return cells;
  }

  function buildRingsCW(radius) {
    const rings = [];
    rings[0] = [[0, 0]];
    for (let ring = 1; ring <= radius; ring++) {
      let q = 0, p = -ring;
      const arr = [];
      const stepDirs = [0, 5, 4, 3, 2, 1]; // E, SE, SW, W, NW, NE
      for (let side = 0; side < 6; side++) {
        const [dq, dp] = DIRS[stepDirs[side]];
        for (let i = 0; i < ring; i++) {
          arr.push([q, p]);
          q += dq; p += dp;
        }
      }
      rings[ring] = arr;
    }
    return rings;
  }

  const ringSides = (ringArray, r) =>
    Array.from({ length: 6 }, (_, k) => ringArray.slice(k * r, k * r + r));

  function buildWedgesBySides(rings, radius) {
    const wedges = Array.from({ length: 6 }, () => []);
    for (let r = 1; r <= radius; r++) {
      const sides = ringSides(rings[r], r);
      for (let k = 0; k < 6; k++) wedges[k].push(...sides[k]);
    }
    return wedges;
  }

  function buildNumbering(rings, radius) {
    const numbering = new Map();
    let num = 1;
    numbering.set("0,0", num++);
    for (let r = 1; r <= radius; r++) {
      for (const [q, p] of rings[r]) numbering.set(key(q, p), num++);
    }
    return numbering;
  }

  // ===== Draw =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w, h } = size;
    const dpr = window.devicePixelRatio || 1;

    // HiDPI backing store
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const radius = Math.max(0, n - 1);
    const s = computeSideLength(radius, w, h, margin);
    const R = s;

    // Center point with adaptive vertical offset
    const vo = Math.round(h * verticalOffsetFactor); // e.g. -0.14 * h
    const CX = w / 2;
    const CY = h / 2 + vo;

    const hexToPixel = (q, r) => {
      const x = 1.5 * s * q;
      const y = Math.sqrt(3) * s * (r + q / 2);
      return [CX + x, CY + y];
    };

    const drawHex = (x, y, fill, lineWidth = 1.5, stroke = strokeColor) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const vx = x + R * Math.cos(a);
        const vy = y + R * Math.sin(a);
        i ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineJoin = "round";
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const cells = buildCells(radius);
    const rings = buildRingsCW(radius);
    const wedges = buildWedgesBySides(rings, radius);
    const numbering = buildNumbering(rings, radius);

    ctx.clearRect(0, 0, w, h);

    // Base
    cells.forEach(({ q, r }) => {
      const [x, y] = hexToPixel(q, r);
      drawHex(x, y, neutralFill);
    });

    // Fill: triangles or rings
    if (n >= 2) {
      if (!colorByRing) {
        wedges.forEach((wedge, i) => {
          const fill = pastel[i % pastel.length];
          wedge.forEach(([q, p]) => {
            const [x, y] = hexToPixel(q, p);
            drawHex(x, y, fill);
          });
        });
      } else {
        for (let r = 1; r <= radius; r++) {
          const fill = ringPastel[(r - 1) % ringPastel.length];
          rings[r].forEach(([q, p]) => {
            const [x, y] = hexToPixel(q, p);
            drawHex(x, y, fill);
          });
        }
      }
    }

    // Center on top
    const [cx, cy] = hexToPixel(0, 0);
    drawHex(cx, cy, "#9dc5bb");

    // Numbers
    if (showNums) {
      const fontSize = Math.max(9, Math.min(16, Math.round(0.28 * s)));
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      numbering.forEach((num, k) => {
        const [q, r] = k.split(",").map(Number);
        const [x, y] = hexToPixel(q, r);
        ctx.fillText(num, x, y);
      });
    }
  }, [n, showNums, colorByRing, size, verticalOffsetFactor, pastel, ringPastel]);

  // ===== Controls =====

  const applyN = (candidate) => {
    const parsed = parseInt(candidate, 10);
    const valid = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    setN(valid);
    setRawN(String(valid));
  };

  const onInputChange = (e) => {
    // Let the user clear/enter freely
    setRawN(e.target.value);
  };

  const onInputBlur = () => {
    applyN(rawN);
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // triggers onBlur/validation
    }
  };

  const decN = () => applyN((n - 1).toString());
  const incN = () => applyN((n + 1).toString());
  const cycleN = () => applyN((n >= 6 ? 2 : n + 1).toString());

  const downloadPNG = () => {
    const a = document.createElement("a");
    a.download = `hex_n${n}_${colorByRing ? "rings" : "triangles"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      {showControls && (
        <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
          <InputGroup style={{ width: 220 }}>
            <InputGroup.Text>n</InputGroup.Text>
            <Form.Control
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1+"
              value={rawN}
              onChange={onInputChange}
              onBlur={onInputBlur}
              onKeyDown={onInputKeyDown}
            />
            <Button variant="outline-secondary" onClick={decN} disabled={n <= 1}>
              –
            </Button>
            <Button variant="outline-secondary" onClick={incN}>
              +
            </Button>
          </InputGroup>

          <ButtonGroup>
            <Button
              variant={showNums ? "primary" : "outline-secondary"}
              onClick={() => setShowNums((v) => !v)}
            >
              {showNums ? "Hide numbers" : "Show numbers"}
            </Button>
            <Button
              variant={colorByRing ? "primary" : "outline-secondary"}
              onClick={() => setColorByRing((v) => !v)}
            >
              {colorByRing ? "Color by rings" : "Color by triangles"}
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button variant="outline-secondary" onClick={cycleN}>
              Cycle n (2→6)
            </Button>
            <Button className="app-btn" variant="primary" onClick={downloadPNG}>
              Download PNG
            </Button>
          </ButtonGroup>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          border: "1px solid #ccc",
          background: "#fff",
          width: "100%",
          height: "auto",      // height is controlled via backing store; CSS keeps aspect
          aspectRatio: "1 / 1" // ensure square box in modern browsers
        }}
        onClick={cycleN}
      />
    </div>
  );
}
