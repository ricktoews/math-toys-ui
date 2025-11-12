import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, InputGroup, Form } from "react-bootstrap";

export default function HexCluster({
  width = 900,
  height = 900,
  initialN = 4,
  showControls = true,
}) {
  const canvasRef = useRef(null);
  const [n, setN] = useState(Math.max(1, Math.floor(initialN)));
  const [showNums, setShowNums] = useState(true);
  const [colorByRing, setColorByRing] = useState(false);

  // --- color palettes ---
  const pastel = ["#bcd4e6","#d0f0c0","#ffe4b5","#f7c8d0","#e8d3ff","#faf3b3"];
  const ringPastel = [...pastel, "#c7e6e2", "#f5d6b0"]; // 8 total, same style

  // layout constants
  const margin = 24;
  const strokeColor = "#666";
  const neutralFill = "#eee";
  const textColor = "#333";
  const verticalOffset = -125; // raise cluster upward

  // directions
  const DIRS = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ];
  const key = (q, r) => `${q},${r}`;

  function computeSideLength(radius, cssW, cssH, m = margin) {
    if (radius <= 0) return 60;
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
      const stepDirs = [0, 5, 4, 3, 2, 1];
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
    Array.from({ length: 6 }, (_, k) =>
      ringArray.slice(k * r, k * r + r)
    );

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

  // draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const radius = Math.max(0, n - 1);
    const s = computeSideLength(radius, width, height, margin);
    const R = s;
    const CX = width / 2;
    const CY = height / 2 + verticalOffset;

    const hexToPixel = (q, r) => {
      const x = 1.5 * s * q;
      const y = Math.sqrt(3) * s * (r + q / 2);
      return [CX + x, CY + y];
    };

    const drawHex = (x, y, fill) => {
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
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const cells = buildCells(radius);
    const rings = buildRingsCW(radius);
    const wedges = buildWedgesBySides(rings, radius);
    const numbering = buildNumbering(rings, radius);

    ctx.clearRect(0, 0, width, height);

    // base
    cells.forEach(({ q, r }) => {
      const [x, y] = hexToPixel(q, r);
      drawHex(x, y, neutralFill);
    });

    // fill
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

    // center
    const [cx, cy] = hexToPixel(0, 0);
    drawHex(cx, cy, "#9dc5bb");

    // numbers
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
  }, [n, showNums, colorByRing, width, height]);

  const cycleN = () => setN((prev) => (prev >= 6 ? 2 : prev + 1));
  const downloadPNG = () => {
    const a = document.createElement("a");
    a.download = `hex_n${n}_${colorByRing ? "rings" : "triangles"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div>
      {showControls && (
        <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
          <InputGroup style={{ width: 160 }}>
            <InputGroup.Text>n</InputGroup.Text>
            <Form.Control
              type="number"
              min={1}
              value={n}
              onChange={(e) => setN(Math.max(1, Math.floor(+e.target.value || 1)))}
            />
          </InputGroup>

          {/* Button toggles */}
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
        width={width}
        height={height}
        style={{
          border: "1px solid #ccc",
          background: "#fff",
          width,
          height,
          cursor: "pointer",
        }}
        onClick={cycleN}
      />
    </div>
  );
}
