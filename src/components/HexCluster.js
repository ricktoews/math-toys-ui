import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";

export default function HexCluster({
    initialN = 4,
    showControls = true,
    verticalOffsetPx = -40, // subtle lift like the standalone
}) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    // Keep React state minimal: just size, n, and mode
    const [size, setSize] = useState({ w: 900, h: 900 });
    const [n, setN] = useState(Math.max(2, Math.floor(initialN)));
    const [mode, setMode] = useState("hex");
    const modeRef = useRef("hex");


    // Animation/particles live in refs so React renders don't break tweens
    const ptsRef = useRef([]); // [{group, idx, color, rad, hex:{x,y}, sq:{x,y}, x,y}]

    const extrasPhaseRef = useRef("hidden"); // 'hidden' | 'fadingIn' | 'shown'
    const extrasAlphaRef = useRef(0);

    // Visual constants
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

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    // Responsive square canvas
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

    // ===== Standalone geometry (ported verbatim) =====
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

    // *** This is the exact scheme that makes rectangles line up cleanly ***
    function buildSquareOctantTriangles(k) {
        // Rectangles: (0,1)=top, (2,3)=right, (4,5)=bottom, (6,7)=left
        // We keep (3,4) as the "added" lower-right rectangle.
        const L = Array.from({ length: 8 }, () => []);

        for (let d = 1; d <= k; d++) {
            for (let i = 1; i <= d; i++)L[0].push([-d - 1 + i, -d]); // top-left half
            for (let i = 1; i <= d; i++)L[1].push([i - 1, -d]);   // top-right half  => top rectangle = (0,1)
            for (let i = 1; i <= d; i++)L[2].push([d, -d - 1 + i]); // right-top half
            for (let i = 1; i <= d; i++)L[3].push([d, i - 1]);   // right-bottom    => right rectangle = (2,3)
            for (let i = 1; i <= d; i++)L[4].push([d + 1 - i, d]); // bottom-right
            for (let i = 1; i <= d; i++)L[5].push([-i + 1, d]);   // bottom-left     => bottom rectangle = (4,5)
            for (let i = 1; i <= d; i++)L[6].push([-d, d + 1 - i]); // left-bottom
            for (let i = 1; i <= d; i++)L[7].push([-d, -i + 1]);   // left-top        => left rectangle = (6,7)
        }

        return L;
    }

    // Unified sizing to fit both hex & square layouts
    const MARGIN = 18;
    const GAPU = 0.06; // small gap so circles don’t touch

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

    // Mapping (same as standalone that worked)
    const TRI_FOR_WEDGE = [0, 1, 2, 5, 6, 7]; // use 6 triangles to make 3 rectangles
    const EXTRA_TRIS = [3, 4]; // lower-right rectangle to be added/faded

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

        return { r, hexPos, sqPos, T: (k * (k + 1)) / 2 };
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


        // Two extra triangles (the remaining rectangle)
        for (let ti = 0; ti < EXTRA_TRIS.length; ti++) {
            const t = EXTRA_TRIS[ti];
            for (let i = 0; i < T; i++) {
                const S = sqPos.tris[t][i];

                pts.push({
                    group: `extra${t}`,
                    color: ti === 0 ? extra1 : extra2,
                    idx: i,
                    hex: S,      // same as sq
                    sq: S,
                    x: S.x,
                    y: S.y,
                    rad: r,
                });
            }
        }



        ptsRef.current = pts;
    }

    // ===== Rendering =====
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

    function syncToMode() {
        for (const p of ptsRef.current) {
            const tgt = mode === "hex" ? p.hex : p.sq;
            p.x = tgt.x;
            p.y = tgt.y;
        }
    }

    function draw() {
        const canvas = canvasRef.current;
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

                const saved = ctx.globalAlpha;
                if (g.startsWith("extra")) {
                    ctx.globalAlpha = extrasAlphaRef.current; // 0..1 when fading/shown
                }

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



    // ===== Init / rebuild on size & n =====
    useEffect(() => {
        if (!canvasRef.current) return;
        resizeBackingStore();
        rebuildParticles(n, size.w, size.h, modeRef.current);
        // keep them consistent with current mode
        /*
        if (modeRef.current === "square") {
          extrasPhaseRef.current = "shown";
          extrasAlphaRef.current = 1;
        } else {
          extrasPhaseRef.current = "hidden";
          extrasAlphaRef.current = 0;
        }
          */
        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, n]);


    // ===== Morph (always animated) =====
    const MOVE_DUR = 600;  // ms
    const FADE_DUR = 350;  // ms
    const EXTRA_DELAY = 150; // ms between end of move and start of fade

    const easeInOut = (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    function startMorph(nextMode) {
        // cancel any running animation
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        // use the ref for immediate canvas logic;
        // we'll update React state AFTER the whole sequence is done
        modeRef.current = nextMode;

        // hide extras at the start of every morph
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

            // movement is finished
            rafRef.current = null;

            if (nextMode === "square") {
                // delay, then fade in extras
                const delayStart = performance.now();

                const fade = (now2) => {
                    const elapsed = now2 - delayStart;

                    if (elapsed < EXTRA_DELAY) {
                        // still waiting, extras stay hidden
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
                        // NOW tell React the mode is "square"
                        setMode("square");
                    }
                };

                rafRef.current = requestAnimationFrame(fade);
            } else {
                // going back to hex: extras stay hidden
                extrasPhaseRef.current = "hidden";
                extrasAlphaRef.current = 0;
                draw();
                setMode("hex");
            }
        };

        // start the motion
        rafRef.current = requestAnimationFrame(move);
    }


    // Rebuild on mode change so future draws target the right endpoints
    useEffect(() => {
        rebuildParticles(n, size.w, size.h, mode);
        syncToMode();
        if (mode === "square") {
            extrasPhaseRef.current = "shown";
            extrasAlphaRef.current = 1;
        }
        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e) => {
            if (e.target && e.target.closest && e.target.closest("input,textarea,select")) return;
            const k = (e.key || "").toLowerCase();
            if (k === "h") startMorph("hex");
            if (k === "s") startMorph("square");
            if (e.key === "-") setN((v) => Math.max(2, v - 1));
            if (e.key === "=" || e.key === "+") setN((v) => v + 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Controls
    const decN = () => setN((v) => Math.max(2, v - 1));
    const incN = () => setN((v) => v + 1);
    const toggleMode = () => startMorph(mode === "hex" ? "square" : "hex");

    const downloadPNG = () => {
        const a = document.createElement("a");
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        a.download = `morph_n${n}_${mode}_${stamp}.png`;
        a.href = canvasRef.current.toDataURL("image/png");
        a.click();
    };

    return (
        <div ref={wrapRef} style={{ width: "100%" }}>
            {showControls && (
                <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                    <ButtonGroup aria-label="Set n">
                        <Button variant="outline-secondary" onClick={decN} title="Decrease n">–</Button>
                        <Button variant="light" disabled style={{ minWidth: 56 }}>n: {n}</Button>
                        <Button variant="outline-secondary" onClick={incN} title="Increase n">+</Button>
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
        </div>
    );
}
