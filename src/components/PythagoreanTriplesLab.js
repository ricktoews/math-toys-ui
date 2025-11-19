import React, { useState, useMemo } from "react";
import "../css/PythagoreanTriplesLab.scss";
import PythagSquare from "./PythagSquare";

const PRESET_CORNERS = [1, 2, 3, 4, 5];
const DEFAULT_MAX_C = 5000;
const MAX_RESULTS = 50;

function gcd(a, b) {
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return Math.abs(a);
}

function gcd3(a, b, c) {
    return gcd(gcd(a, b), c);
}

function factorize(n) {
    const factors = [];
    let num = Math.abs(n);
    let p = 2;

    while (p * p <= num) {
        let count = 0;
        while (num % p === 0) {
            num /= p;
            count++;
        }
        if (count > 0) {
            factors.push({ prime: p, exp: count });
        }
        p = p === 2 ? 3 : p + 2; // 2,3,5,7,...
    }

    if (num > 1) {
        factors.push({ prime: num, exp: 1 });
    }

    return factors;
}

function factorsToString(factors) {
    if (factors.length === 0) return "1";
    return factors
        .map(({ prime, exp }) => (exp === 1 ? `${prime}` : `${prime}^${exp}`))
        .join(" · ");
}

function generateTriples(k, maxC, maxResults) {
    const triples = [];
    const absK = Math.abs(k);
    if (absK === 0) return triples;

    for (let a = 3; a <= maxC; a++) {
        const a2 = a * a;
        const k2 = absK * absK;
        const numerator = a2 - k2;
        const denominator = 2 * absK;

        if (numerator <= 0) continue;
        if (numerator % denominator !== 0) continue;

        const b = numerator / denominator;
        const c = b + absK;

        if (!Number.isInteger(b) || b <= 0 || c > maxC) continue;
        if (a >= b) continue; // enforce ordering a < b < c

        const g = gcd3(a, b, c);
        const primitive = g === 1;

        triples.push({ a, b, c, primitive, gcd: g });

        if (triples.length >= maxResults) break;
    }

    return triples;
}


function TriplesList({ triples, onSelectTriple }) {
    if (triples.length === 0) {
        return (
            <section className="pt-triples">
                <div className="pt-card">
                    <div className="pt-card-title">Triples</div>
                    <p>No triples found for this corner within the current range.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-triples">
            <div className="pt-card">
                <table className="pt-table">
                    <thead>
                        <tr>
                            <th>Triple</th>
                            <th>Equation</th>
                            <th>gcd(a, b, c)</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {triples.map((t, idx) => (
                            <tr key={`${t.a}-${t.b}-${t.c}-${idx}`}>
                                <td>{t.a}, {t.b}, {t.c}</td>
                                <td>{t.a}² + {t.b}² = {t.c}²</td>
                                <td className="pt-gcd-cell">
                                    {t.gcd === 1 ? (
                                        <span className="pt-gcd-star-svg" title="Primitive triple">
                                            <svg
                                                viewBox="0 0 100 100"
                                                className="pt-star-icon"
                                                aria-hidden="true"
                                            >
                                                <polygon
                                                    points="50,8 61,38 93,38 67,58 78,90 50,72 22,90 33,58 7,38 39,38"
                                                    className="pt-star-shape"
                                                />
                                                <text
                                                    x="50"
                                                    y="57"     // ← OPTICAL CENTER
                                                    textAnchor="middle"
                                                    className="pt-star-text"
                                                >
                                                    1
                                                </text>
                                            </svg>
                                        </span>
                                    ) : (
                                        t.gcd
                                    )}
                                </td>


                                <td>
                                    <button
                                        className="pt-btn pt-btn-secondary"
                                        onClick={() => onSelectTriple(t)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </section>
    );
}

function TripleModal({ triple, onClose }) {
    if (!triple) return null;

    const { a, b, c, primitive, gcd: g } = triple;
    const commonFactorStr = primitive
        ? null
        : factorsToString(factorize(g)); // e.g. "2 · 3²"

    return (
        <div className="pt-modal-backdrop" onClick={onClose}>
            <div
                className="pt-modal"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <header className="pt-modal-header">
                    <div className="pt-modal-title">
                        A = {a}, B = {b}, C = {c}
                    </div>

                    <button
                        className="pt-modal-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </header>

                <div className="pt-modal-body">
                    <p>
                        {a}² = {a * a}, {b}² = {b * b}, {c}² = {c * c}
                    </p>

                    {/* NEW: primitive / common-factor info */}
                    <p>
                        {primitive ? (
                            <>
                                <strong>Primitive</strong>
                            </>
                        ) : (
                            <>
                                (gcd = {g}
                                {commonFactorStr && <> = {commonFactorStr}</>})
                            </>
                        )}
                    </p>

                    {/* Your grid visualizer goes here */}
                    <div className="pt-modal-grid-wrapper">
                        {c <= 50 && <PythagSquare triple={[a, b, c]} />}
                    </div>
                </div>

                <footer className="pt-modal-footer">
                    <button className="pt-btn" onClick={onClose}>
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
}


function InfoModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="pt-modal-backdrop" onClick={onClose}>
            <div
                className="pt-modal pt-info-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="pt-modal-header">
                    <h2>How Pythagorean Triples Work</h2>
                    <button className="pt-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </header>
                <div className="pt-modal-body">
                    <p>
                        The classic Pythagorean triple is (3, 4, 5). If you draw squares on
                        each side of the right triangle, the 3×3 and 4×4 squares can be
                        rearranged to exactly fill the 5×5 square.
                    </p>
                    <p>
                        For odd values of a, you can generate a triple using
                        <br />
                        <code>b = (a² − 1) / 2</code> and <code>c = (a² + 1) / 2</code>.
                    </p>
                    <p>
                        On this page, we instead fix the difference c − b (the{" "}
                        <strong>corner value</strong>) and explore all triples that share
                        that difference. The lab lets you:
                    </p>
                    <ul>
                        <li>Choose a corner value c − b</li>
                        <li>See all triples that match it (within a range)</li>
                        <li>Check which of them are primitive (gcd(a, b, c) = 1)</li>
                        <li>Click a triple to visualize it as squares</li>
                    </ul>
                </div>
                <footer className="pt-modal-footer">
                    <button className="pt-btn" onClick={onClose}>
                        Back to Lab
                    </button>
                </footer>
            </div>
        </div>
    );
}



// Only use small primes up to 7 now
const PRIME_OPTIONS = [2, 3, 5, 7];

function PrimeCornerBuilder({ onApply }) {
    const [exponents, setExponents] = useState(
        () => PRIME_OPTIONS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
    );

    const updateExponent = (p, delta) => {
        setExponents((prev) => {
            const next = { ...prev };
            next[p] = Math.max(0, (next[p] || 0) + delta);
            return next;
        });
    };

    const { product, factorStr } = useMemo(() => {
        let prod = 1;
        const parts = [];
        PRIME_OPTIONS.forEach((p) => {
            const e = exponents[p];
            if (e > 0) {
                prod *= p ** e;
                parts.push(e === 1 ? `${p}` : `${p}^${e}`);
            }
        });
        return {
            product: prod,
            factorStr: parts.length ? parts.join(" · ") : "1",
        };
    }, [exponents]);

    const handleApply = () => {
        if (product !== 1) onApply(product);
    };

    return (
        <div className="pt-prime-builder">
            <div className="pt-prime-builder-title">Build corner from small primes</div>

            <div className="pt-prime-row">
                {PRIME_OPTIONS.map((p) => (
                    <div key={p} className="pt-prime-chip">
                        <span className="pt-prime-label">{p}</span>
                        <button
                            type="button"
                            className="pt-prime-btn"
                            onClick={() => updateExponent(p, -1)}
                        >
                            −
                        </button>
                        <span className="pt-prime-exp">exp {exponents[p]}</span>
                        <button
                            type="button"
                            className="pt-prime-btn"
                            onClick={() => updateExponent(p, +1)}
                        >
                            +
                        </button>
                    </div>
                ))}

                {/* circular apply button with checkmark */}
                <button
                    type="button"
                    className="pt-prime-apply-icon"
                    onClick={handleApply}
                    disabled={product === 1}
                    aria-label="Use prime product as corner"
                >
                    ✓
                </button>
            </div>

            <div className="pt-prime-summary">
                <div>
                    Factorization: <strong>{factorStr}</strong>
                </div>
                <div>
                    Product: <strong>{product}</strong>
                </div>
            </div>
        </div>
    );
}

function CornerInfoTooltip({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="pt-corner-tooltip-backdrop" onClick={onClose}>
            <div
                className="pt-corner-tooltip"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pt-corner-tooltip-title">What is the corner?</div>

                <div className="pt-corner-tooltip-graphic">
                    {/* Tiny visual diagram modeled on c = 5, b = 4, a = 3 */}
                    <svg width="150" height="150">
                        {/* c² background */}
                        <rect
                            x="10"
                            y="10"
                            width="100"
                            height="100"
                            fill="#f6f6f6"
                            stroke="#555"
                        />

                        {/* vertical strip on the left: width = c - b */}
                        <rect
                            x="10"
                            y="30"
                            width="20"
                            height="80"
                            fill="#999999"
                            stroke="#f6f6f6"
                            strokeWidth="1"
                        />

                        {/* horizontal strip on top: height = c - b */}
                        <rect
                            x="30"
                            y="10"
                            width="80"
                            height="20"
                            fill="#999999"
                            stroke="#f6f6f6"
                            strokeWidth="1"
                        />

                        {/* corner square (c−b)²: overlaps of the two strips */}
                        <rect
                            x="10"
                            y="10"
                            width="20"
                            height="20"
                            fill="#000099"
                            stroke="#f6f6f6"
                            strokeWidth="1"
                        />

                        {/* b² anchored at lower-right */}
                        <rect
                            x="30"
                            y="30"
                            width="80"
                            height="80"
                            fill="#666"
                            stroke="#f6f6f6"
                            strokeWidth="1"
                        />

                        {/* Labels */}
                        <text x="58" y="72" fontSize="9" fill="#f6f6f6">
                            b²
                        </text>
                        <text x="52" y="126" fontSize="9" fill="#333">
                            c²
                        </text>
                    </svg>
                </div>

                <p className="pt-corner-tooltip-text">
                    We draw the <strong>c²</strong> square and place the{" "}
                    <strong>b²</strong> square snug in the lower right corner. This
                    leaves a vertical strip on the left and a horizontal strip across
                    the top. Each strip has thickness <strong>c − b</strong>.
                </p>
                <p className="pt-corner-tooltip-text">
                    Where those two strips overlap in the upper left, you get a small
                    square of size <strong>(c − b) × (c − b)</strong>. That little
                    square is what we call the <strong>corner</strong>.
                </p>

                <button className="pt-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}


export default function PythagoreanTriplesLab() {
    const [corner, setCorner] = useState(1);
    const [customInput, setCustomInput] = useState("225");
    const [selectedTriple, setSelectedTriple] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showCornerInfo, setShowCornerInfo] = useState(false);

    const [cornerCollapsed, setCornerCollapsed] = useState(false);

    const triples = useMemo(
        () => generateTriples(corner, DEFAULT_MAX_C, MAX_RESULTS),
        [corner]
    );

    // NEW: summary info for the collapsed pill
    const factors = factorize(corner);
    const factorStr = factorsToString(factors);
    const primitiveCount = triples.filter((t) => t.primitive).length;
    const primitivesText = primitiveCount > 0 ? "Yes" : "None";

    const handlePresetClick = (k) => {
        setCorner(k);
        setCustomInput(String(k));
        setCornerCollapsed(true);
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const val = parseInt(customInput, 10);
        if (!Number.isNaN(val) && val !== 0) {
            setCorner(val);
            setCornerCollapsed(true);
        }
    };



    return (
        <div className="pt-page">

            <h1>Pythagorean Triples Lab</h1>

            <main className="pt-main">
                {/* Corner selector */}


                <section className="pt-corner-container">
                    {cornerCollapsed ? (
                        // COLLAPSED PILL (unchanged)
                        <button
                            type="button"
                            className="pt-corner-toggle"
                            onClick={() => setCornerCollapsed(false)}
                        >
                            <span className="pt-summary-label">Corner (c − b)</span>
                            <span className="pt-summary-value">{corner}</span>

                            <span className="pt-summary-sep">·</span>
                            <span className="pt-summary-label">Factors</span>
                            <span className="pt-summary-value">{factorStr}</span>

                            <span className="pt-summary-sep">·</span>
                            <span className="pt-summary-label">Primitives</span>
                            <span className="pt-summary-value">{primitivesText}</span>

                            <span className="pt-corner-toggle-icon">▾</span>
                        </button>
                    ) : (
                        // EXPANDED TOOLS
                        <div className="pt-corner-selector">
                            <div className="pt-section-title">
                                Corner (c − b)
                                <button
                                    type="button"
                                    className="pt-info-icon"
                                    onClick={() => setShowCornerInfo(true)}
                                    aria-label="What is corner?"
                                >
                                    ⓘ
                                </button>
                            </div>


                            <div className="pt-chip-row">
                                {PRESET_CORNERS.map((k) => (
                                    <button
                                        key={k}
                                        className={
                                            corner === k ? "pt-chip pt-chip-active" : "pt-chip"
                                        }
                                        type="button"
                                        onClick={() => handlePresetClick(k)}
                                    >
                                        {k}
                                    </button>
                                ))}

                                {/* Inline corner input + Go */}
                                <form
                                    className="pt-inline-custom"
                                    onSubmit={handleCustomSubmit}
                                >
                                    <span className="pt-inline-label">Corner:</span>
                                    <input
                                        className="pt-input"
                                        type="number"
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                    />
                                    <button className="pt-btn" type="submit">
                                        Go
                                    </button>
                                </form>
                            </div>

                            <PrimeCornerBuilder
                                onApply={(value) => {
                                    setCorner(value);
                                    setCustomInput(String(value));
                                    setCornerCollapsed(true);
                                }}
                            />
                        </div>
                    )}
                </section>


                {/* Triples list */}
                <TriplesList
                    triples={triples}
                    onSelectTriple={(t) => setSelectedTriple(t)}
                />

                {/* Info link */}
                <section className="pt-info-link-section">
                    <button
                        className="pt-info-link"
                        type="button"
                        onClick={() => setShowInfo(true)}
                    >
                        ℹ︎ How this works
                    </button>
                </section>
            </main>

            {/* Modals */}
            <TripleModal
                triple={selectedTriple}
                onClose={() => setSelectedTriple(null)}
            />
            <InfoModal open={showInfo} onClose={() => setShowInfo(false)} />

            <CornerInfoTooltip
                open={showCornerInfo}
                onClose={() => setShowCornerInfo(false)}
            />

        </div>
    );
}
