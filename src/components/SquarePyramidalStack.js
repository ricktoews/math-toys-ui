import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../css/SquarePyramidalStack.scss';

// --- helper math functions + tiny tests ---
function triangularNumber(n) {
  return (n * (n + 1)) / 2;
}
function tetrahedralNumber(n) {
  return (n * (n + 1) * (n + 2)) / 6;
}

// sanity checks (keep these)
console.assert(triangularNumber(1) === 1, 'triangularNumber(1) should be 1');
console.assert(triangularNumber(4) === 10, 'triangularNumber(4) should be 10');
console.assert(tetrahedralNumber(1) === 1, 'tetrahedralNumber(1) should be 1');
console.assert(tetrahedralNumber(4) === 20, 'tetrahedralNumber(4) should be 20');

export default function SquarePyramidalStack({
  initialTiers = 5,
  maxTiers = 15,
  height = 500, // px
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const groupRef = useRef(null);
  const instancedRef = useRef(null);
  const baseMeshRef = useRef(null);
  const sphereMatRef = useRef(null);

  const [tiers, setTiers] = useState(initialTiers);
  const [colorMode, setColorMode] = useState('tetra'); // 'tetra' | 'layer'
  const [autoRotate, setAutoRotate] = useState(true);

  const buildStackRef = useRef(null);

  // --- one-time scene setup ---
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1020');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.up.set(0, 0, 1); // Z axis is "up"
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0, -2.0);
    controls.enablePan = false; // Prevent panning that would move the target
    controlsRef.current = controls;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.8);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(6, 9, 11);
    scene.add(dir);

    const sphereMat = new THREE.MeshStandardMaterial({
      color: '#d7e3ff',
      metalness: 0.2,
      roughness: 0.3,
    });
    sphereMatRef.current = sphereMat;

    function resizeRendererToDisplaySize() {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      rendererRef.current.setSize(clientWidth, clientHeight);
      cameraRef.current.aspect = clientWidth / clientHeight;
      cameraRef.current.updateProjectionMatrix();
    }

    resizeRendererToDisplaySize();
    window.addEventListener('resize', resizeRendererToDisplaySize);

    // ---------------- buildStack ----------------
    buildStackRef.current = function buildStack(tiersValue, colorModeValue) {
      const group = groupRef.current;
      const sphereMatLocal = sphereMatRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!group || !sphereMatLocal || !scene || !camera || !controls) return;

      // Clear previous mesh/base
      if (instancedRef.current) {
        group.remove(instancedRef.current);
        instancedRef.current.geometry.dispose();
        instancedRef.current = null;
      }
      if (baseMeshRef.current) {
        scene.remove(baseMeshRef.current);
        baseMeshRef.current.geometry.dispose();
        baseMeshRef.current.material.dispose();
        baseMeshRef.current = null;
      }

      // --- layout vs sphere size ---
      const layoutRadius = 3 / (tiersValue + 3); // center-to-center driver
      const sphereRadius = 0.92 * layoutRadius;  // keep distinct spheres (small gap)

      const a = 2 * layoutRadius; // spacing in X/Y (centers)
      const v = 2 * layoutRadius; // spacing in Z (centers)

      const pts = [];
      const which = [];   // 0 = large tetrahedron, 1 = small tetrahedron
      const layers = [];  // 1..tiersValue

      // Build two right-triangular tetrahedra whose union at level n is an n×n square
      for (let n = 1; n <= tiersValue; n++) {
        const side = n;
        const z = (tiersValue - n) * v; // largest layer at the bottom
        const offset = (side - 1) / 2;
        for (let i = 0; i < side; i++) {
          for (let j = 0; j < side; j++) {
            const x = (i - offset) * a;
            const y = (j - offset) * a;
            if (i >= j) {
              pts.push(new THREE.Vector3(x, y, z));
              which.push(0);
              layers.push(n);
            } else if (n > 1) {
              pts.push(new THREE.Vector3(x, y, z));
              which.push(1);
              layers.push(n);
            }
          }
        }
      }

      // Instead of centering vertically, anchor the base at a consistent position
      const boxCenters = new THREE.Box3().setFromPoints(pts);
      const baseZ = boxCenters.min.z; // Find the lowest point (base)
      const targetBaseZ = -2.1; // Target position for the base (lowered)
      const zShift = targetBaseZ - baseZ;
      for (const p of pts) p.z += zShift;

      // Build instanced spheres
      const geo = new THREE.SphereGeometry(sphereRadius, 32, 32);
      const instanced = new THREE.InstancedMesh(geo, sphereMatLocal, pts.length);
      instancedRef.current = instanced;

      const matrix = new THREE.Matrix4();
      const color = new THREE.Color();
      for (let index = 0; index < pts.length; index++) {
        const p = pts[index];
        matrix.makeTranslation(p.x, p.y, p.z);
        instanced.setMatrixAt(index, matrix);

        if (colorModeValue === 'tetra') {
          color.set(which[index] === 0 ? '#0080dd' : '#00e0ff');
        } else {
          const level = layers[index];
          color.set(level % 2 === 0 ? '#0080dd' : '#00e0ff');
        }
        instanced.setColorAt(index, color);
      }

      instanced.instanceMatrix.needsUpdate = true;
      if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
      group.add(instanced);

      // --- Camera framing: fit the *centers* plus a margin for sphere radius ---
      const VIEW_FIT = 0.72; // baseline closeness (lower = closer)

      // Inflate the center-lattice box by sphere radius so small tiers don't clip
      const camBox = boxCenters.clone();
      camBox.min.addScalar(-sphereRadius);
      camBox.max.addScalar(sphereRadius);

      const size = new THREE.Vector3();
      camBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || (4 * layoutRadius);
      const dist = maxDim * VIEW_FIT / Math.tan((Math.PI * camera.fov) / 360);

      camera.position.set(dist, dist, dist);
      controls.target.set(0, 0, -2.0);
      camera.lookAt(0, 0, -2.0);
    };
    // --------------------------------------------------

    // initial build
    if (buildStackRef.current) buildStackRef.current(initialTiers, 'tetra');

    // animation loop
    let frameId;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // cleanup on unmount
    return () => {
      window.removeEventListener('resize', resizeRendererToDisplaySize);
      if (frameId) cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- rebuild stack when tiers or colorMode changes ---
  useEffect(() => {
    if (buildStackRef.current) buildStackRef.current(tiers, colorMode);
  }, [tiers, colorMode]);

  // --- keep autoRotate in sync ---
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // stats for the white box
  const bigTet = tetrahedralNumber(tiers);
  const smallTet = tetrahedralNumber(Math.max(tiers - 1, 0));
  const squarePyr = (tiers * (tiers + 1) * (2 * tiers + 1)) / 6;
  const sphereCount = squarePyr; // identity: P_n = T_n + T_{n-1}

  const decTiers = () => setTiers((v) => Math.max(1, v - 1));
  const incTiers = () => setTiers((v) => Math.min(maxTiers, v + 1));

  // --- JSX ---
  return (
    <div className="sqpyr-page">
      <h1>Square Pyramidal Numbers</h1>

      <main className="sqpyr-main">
        {/* Info pill */}
        <div className="sqpyr-info-pill">
          <span className="sqpyr-info-label">Structure:</span>
          <span className="sqpyr-info-value">
            P<sub>{tiers}</sub> = {squarePyr} spheres = 
            T<sub>{tiers - 1}</sub> ({smallTet}) + T<sub>{tiers}</sub> ({bigTet})
          </span>
        </div>

        <div className="sqpyr-canvas-container">
          <div ref={mountRef} className="sqpyr-canvas-host" />

          {/* Top center controls */}
          <div className="sqpyr-top-controls">
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={autoRotate ? "sqpyr-toggle-btn sqpyr-toggle-on" : "sqpyr-toggle-btn sqpyr-toggle-off"}
              aria-label="Toggle auto-rotate"
            >
              Auto-rotate: {autoRotate ? 'On' : 'Off'}
            </button>

            <div className="sqpyr-color-group">
              <button
                type="button"
                onClick={() => setColorMode('tetra')}
                className={colorMode === 'tetra' ? "sqpyr-color-btn sqpyr-color-left sqpyr-color-active" : "sqpyr-color-btn sqpyr-color-left"}
              >
                By tetrahedra
              </button>
              <button
                type="button"
                onClick={() => setColorMode('layer')}
                className={colorMode === 'layer' ? "sqpyr-color-btn sqpyr-color-right sqpyr-color-active" : "sqpyr-color-btn sqpyr-color-right"}
              >
                By layer
              </button>
            </div>
          </div>

          {/* Minus button - top left */}
          <button
            type="button"
            onClick={decTiers}
            aria-label="Decrease tiers"
            className="sqpyr-control-btn sqpyr-btn-minus"
          >
            –
          </button>

          {/* Plus button - top right */}
          <button
            type="button"
            onClick={incTiers}
            aria-label="Increase tiers"
            className="sqpyr-control-btn sqpyr-btn-plus"
          >
            +
          </button>
        </div>
      </main>
    </div>
  );
}
