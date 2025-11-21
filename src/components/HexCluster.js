import React, { useEffect, useRef, useState } from "react";
import "../css/HexCluster.scss";

export default function HexCluster({
    initialN = 4,
    showControls = true,
    verticalOffsetPx = -40, // lift the cluster a bit
}) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    const ptsRef = useRef([]);              // particles
    const modeRef = useRef("hex");          // "hex" | "square"
    const extrasPhaseRef = useRef("hidden"); // "hidden" | "fadingIn" | "shown"
    const extrasAlphaRef = useRef(0);       // 0..1
    const mathBoxRef = useRef(null);

    // responsive canvas size (CSS pixels)
    const [size, setSize] = useState({ w: 900, h: 900 });

    // n >= 2 for this morph visualization
    const [n, setN] = useState(Math.max(2, Math.floor(initialN || 2)));

    // Wedge colors by index (0–5):
    //   (5,0) = blue family
    //   (1,2) = green family
    //   (3,4) = warm/orange family
    const wedgeFill = [
    "#9ec5ff", // 0: soft sky blue
    "#9fe3b0", // 1: light mint green
    "#59c484", // 2: richer green
    "#ffb88a", // 3: soft peach
    "#ff7f5f", // 4: warm coral
    "#346cbf", // 5: deeper blue
    ];

    // Extra rectangle (square-only): purple family
    const extra1 = "#c7a4ff"; // lighter lavender
    const extra2 = "#8b6bff"; // deeper violet
    
    const centerColor = "#333333";
    const stroke = "#fff";

    const SQRT3 = Math.sqrt(3);
    const DIRS = [
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [0, 1],
    ];

    const MARGIN = 18;
    const GAPU = 0.06; // slight spacing between circles

    // Wedge → square triangles; 8 square "octants"
    // Rectangles: (0,1)=top, (2,3)=right, (4,5)=bottom, (6,7)=left
    // We use 6 of them for the hex wedges; the remaining pair (3,4) is the added rectangle.
    const TRI_FOR_WEDGE = [0, 1, 2, 5, 6, 7];
    const EXTRA_TRIS = [3, 4]; // the lower-right rectangle

    // ===== Resize observer for responsive canvas =====
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

    // ===== Geometry helpers =====
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
            let q = 0;
            let p = -ring;
            const arr = [];
            const stepDirs = [0, 5, 4, 3, 2, 1]; // E, SE, SW, W, NW, NE
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
        const out = [];
        for (let k = 0; k < 6; k++) {
            out.push(ringArray.slice(k * r, k * r + r));
        }
        return out;
    }

    function buildWedgesBySides(rings, radius) {
        const wedges = Array.from({ length: 6 }, () => []);
        for (let r = 1; r <= radius; r++) {
            const sides = ringSides(rings[r], r);
            for (let k = 0; k < 6; k++) {
                wedges[k].push(...sides[k]);
            }
        }
        return wedges;
    }

    // Your working square partition:
    // Rectangles: (0,1)=top, (2,3)=right, (4,5)=bottom, (6,7)=left
    // Extras: (3,4) => lower-right rectangle
    function buildSquareOctantTriangles(k) {
        const L = Array.from({ length: 8 }, () => []);

        for (let d = 1; d <= k; d++) {
            for (let i = 1; i <= d; i++) L[0].push([-d - 1 + i, -d]); // top-left half
            for (let i = 1; i <= d; i++) L[1].push([i - 1, -d]);     // top-right half
            for (let i = 1; i <= d; i++) L[2].push([d, -d - 1 + i]); // right-top half
            for (let i = 1; i <= d; i++) L[3].push([d, i - 1]);      // right-bottom
            for (let i = 1; i <= d; i++) L[4].push([d + 1 - i, d]);  // bottom-right
            for (let i = 1; i <= d; i++) L[5].push([-i + 1, d]);     // bottom-left
            for (let i = 1; i <= d; i++) L[6].push([-d, d + 1 - i]); // left-bottom
            for (let i = 1; i <= d; i++) L[7].push([-d, -i + 1]);    // left-top
        }

        return L;
    }

    function minHexNeighborDistUnit() {
        let d = Infinity;
        for (const [dq, dr] of DIRS) {
            const [x, y] = hexToPixelUnit(dq, dr, 1);
            const dist = Math.hypot(x, y);
            if (dist < d) d = dist;
        }
        return d;
    }

    function measureBoundsHexUnit(nLocal, ru) {
        const radius = nLocal - 1;
        const cells = buildCells(radius);
        let minX = 1e9,
            maxX = -1e9,
            minY = 1e9,
            maxY = -1e9;
        cells.forEach(({ q, r }) => {
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
        const lists = buildSquareOctantTriangles(k);
        let minX = -ru,
            maxX = ru,
            minY = -ru,
            maxY = ru; // include center
        for (const tri of lists) {
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
        const ru = Math.max(0.02, Math.min(rHexU, rSqU));

        const hexB = measureBoundsHexUnit(nLocal, ru);
        const sqB = measureBoundsSquareUnit(nLocal, ru);
        const needW = Math.max(hexB.width, sqB.width);
        const needH = Math.max(hexB.height, sqB.height);
        const scale = Math.max(
            0.01,
            Math.min((cssW - 2 * MARGIN) / needW, (cssH - 2 * MARGIN) / needH)
        );

        const g = scale; // square grid step
        const sUnit = (2 * (ru + GAPU)) / dHexU;
        const s = sUnit * scale; // hex side in pixels
        const r = ru * scale; // circle radius
        return { s, g, r };
    }

    function buildPositions(nLocal, cssW, cssH) {
        const { s, g, r } = computeUnifiedScale(nLocal, cssW, cssH);
        const CX = cssW / 2;
        const CY = cssH / 2 + verticalOffsetPx;

        const k = nLocal - 1;

        // Hex positions
        const rings = buildRingsCW(k);
        const wedges = buildWedgesBySides(rings, k);
        const hexPos = {
            center: (() => {
                const [x, y] = hexToPixelUnit(0, 0, s);
                return { x: CX + x, y: CY + y };
            })(),
            wedges: wedges.map((wg) =>
                wg.map(([q, rVal]) => {
                    const [x, y] = hexToPixelUnit(q, rVal, s);
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

        const T = (k * (k + 1)) / 2;
        return { r, hexPos, sqPos, T };
    }

    // Build ptsRef.current with new geometry
    function rebuildParticles(nLocal, cssW, cssH) {
        const { r, hexPos, sqPos, T } = buildPositions(nLocal, cssW, cssH);
        const pts = [];

        const useSquare = modeRef.current === "square";

        // Center
        pts.push({
            group: "center",
            color: centerColor,
            idx: 0,
            hex: hexPos.center,
            sq: sqPos.center,
            x: useSquare ? sqPos.center.x : hexPos.center.x,
            y: useSquare ? sqPos.center.y : hexPos.center.y,
            rad: r,
        });

        // 6 wedges mapped to 6 triangles
        for (let w = 0; w < 6; w++) {
            const triIdx = TRI_FOR_WEDGE[w];
            for (let i = 0; i < T; i++) {
                const H = hexPos.wedges[w][i];
                const S = sqPos.tris[triIdx][i];
                pts.push({
                    group: `wedge${w}`,
                    color: wedgeFill[w],
                    idx: i,
                    hex: H,
                    sq: S,
                    x: useSquare ? S.x : H.x,
                    y: useSquare ? S.y : H.y,
                    rad: r,
                });
            }
        }

        // Extras (two triangles making the lower-right rectangle)
        for (let ti = 0; ti < EXTRA_TRIS.length; ti++) {
            const t = EXTRA_TRIS[ti];
            for (let i = 0; i < T; i++) {
                const S = sqPos.tris[t][i];
                pts.push({
                    group: `extra${t}`,
                    color: ti === 0 ? extra1 : extra2,
                    idx: i,
                    hex: S, // same in both layouts
                    sq: S,
                    x: S.x,
                    y: S.y,
                    rad: r,
                });
            }
        }

        ptsRef.current = pts;
    }

    // ===== Canvas / drawing =====
    function resizeBackingStore() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { w, h } = size;
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function updateMathBox() {
        const el = mathBoxRef.current;
        if (!el) return;

        const k = n - 1;
        const T = (k * (k + 1)) / 2;
        const side = 2 * n - 1;
        const hexCount = 1 + 6 * T;
        const squareCount = side * side;

        const mode = modeRef.current;
        const phase = extrasPhaseRef.current;

        if (mode === "hex") {
            el.innerHTML = `
                <span class="hex-math-label">Hexagon:</span>
                <span class="hex-math-value">1 center + 6 triangles (T<sub>${k}</sub> = ${T} each) = ${hexCount} circles</span>
            `;
        } else {
            el.innerHTML = `
                <span class="hex-math-label">Square:</span>
                <span class="hex-math-value">1 center + 8 triangles (T<sub>${k}</sub> = ${T} each) = ${squareCount} circles = (${side})²</span>
            `;
        }
    }

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = parseFloat(getComputedStyle(canvas).width);
        const H = parseFloat(getComputedStyle(canvas).height);

        ctx.clearRect(0, 0, W, H);

        const currentMode = modeRef.current;
        const showExtras =
            currentMode === "square" && extrasPhaseRef.current !== "hidden";

        const extraGroups = EXTRA_TRIS.map((t) => `extra${t}`);
        const wedgeGroups = [
            "wedge0",
            "wedge1",
            "wedge2",
            "wedge3",
            "wedge4",
            "wedge5",
        ];
        const order = showExtras
            ? [...extraGroups, ...wedgeGroups, "center"]
            : [...wedgeGroups, "center"];

        for (const g of order) {
            for (const p of ptsRef.current) {
                if (p.group !== g) continue;
                if (g.startsWith("extra") && !showExtras) continue;

                const savedAlpha = ctx.globalAlpha;
                if (g.startsWith("extra")) {
                    ctx.globalAlpha = extrasAlphaRef.current;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = stroke;
                ctx.stroke();

                ctx.globalAlpha = savedAlpha;
            }
        }

        updateMathBox();
    }

    // ===== Effects: rebuild on size/n =====
    useEffect(() => {
        if (!canvasRef.current) return;
        resizeBackingStore();
        rebuildParticles(n, size.w, size.h);

        // Keep extras consistent with current mode after rebuilding
        if (modeRef.current === "square") {
            extrasPhaseRef.current = "shown";
            extrasAlphaRef.current = 1;
        } else {
            extrasPhaseRef.current = "hidden";
            extrasAlphaRef.current = 0;
        }

        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, n]);

    // ===== Morph animation =====
    const MOVE_DUR = 600;
    const FADE_DUR = 350;
    const EXTRA_DELAY = 150;

    const easeInOut = (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    function startMorph(nextMode) {
        // cancel any existing animation
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        modeRef.current = nextMode;
        extrasPhaseRef.current = "hidden";
        extrasAlphaRef.current = 0;

        const from = ptsRef.current.map((p) => ({ x: p.x, y: p.y }));
        const to = ptsRef.current.map((p) =>
            nextMode === "hex" ? p.hex : p.sq
        );

        const t0 = performance.now();

        const move = (now) => {
            const t = Math.min(1, (now - t0) / MOVE_DUR);
            const tt = easeInOut(t);

            for (let i = 0; i < ptsRef.current.length; i++) {
                ptsRef.current[i].x = lerp(from[i].x, to[i].x, tt);
                ptsRef.current[i].y = lerp(from[i].y, to[i].y, tt);
            }

            draw();

            if (t < 1) {
                rafRef.current = requestAnimationFrame(move);
                return;
            }

            // movement finished
            rafRef.current = null;

            if (nextMode === "square") {
                const delayStart = performance.now();

                const fade = (now2) => {
                    const elapsed = now2 - delayStart;

                    if (elapsed < EXTRA_DELAY) {
                        extrasPhaseRef.current = "hidden";
                        extrasAlphaRef.current = 0;
                        draw();
                        rafRef.current = requestAnimationFrame(fade);
                        return;
                    }

                    const tf = Math.min(
                        1,
                        (elapsed - EXTRA_DELAY) / FADE_DUR
                    );

                    extrasPhaseRef.current = "fadingIn";
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
                // back to hex: extras remain hidden
                extrasPhaseRef.current = "hidden";
                extrasAlphaRef.current = 0;
                draw();
            }
        };

        rafRef.current = requestAnimationFrame(move);
    }

    // ===== Keyboard controls =====
    useEffect(() => {
        const handler = (e) => {
            if (
                e.target &&
                (e.target.tagName === "INPUT" ||
                    e.target.tagName === "TEXTAREA" ||
                    e.target.isContentEditable)
            ) {
                return;
            }
            const key = e.key.toLowerCase();
            if (key === "h") {
                startMorph("hex");
            } else if (key === "s") {
                startMorph("square");
            } else if (e.key === "-") {
                setN((v) => Math.max(2, v - 1));
            } else if (e.key === "+" || e.key === "=") {
                setN((v) => v + 1);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // ===== UI handlers =====
    const decN = () => setN((v) => Math.max(2, v - 1));
    const incN = () => setN((v) => v + 1);
    const toggleMode = () =>
        startMorph(modeRef.current === "hex" ? "square" : "hex");

    // ===== Render =====
    return (
        <div className="hex-page">
            <h1>Centered Hexagonal Numbers</h1>

            <main className="hex-main">
                {/* Live math panel - horizontal pill */}
                <div
                    ref={mathBoxRef}
                    className="hex-math-pill"
                />

                <div
                    ref={wrapRef}
                    className="hex-canvas-container"
                >
                    <canvas
                        ref={canvasRef}
                        className="hex-canvas"
                        onClick={toggleMode}
                    />

                    {showControls && (
                        <>
                            {/* n label - top center */}
                            <div className="hex-n-label">
                                n = {n}
                            </div>

                            {/* Minus button - top left */}
                            <button
                                type="button"
                                onClick={decN}
                                aria-label="Decrease n"
                                className="hex-control-btn hex-btn-minus"
                            >
                                –
                            </button>

                            {/* Plus button - top right */}
                            <button
                                type="button"
                                onClick={incN}
                                aria-label="Increase n"
                                className="hex-control-btn hex-btn-plus"
                            >
                                +
                            </button>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
