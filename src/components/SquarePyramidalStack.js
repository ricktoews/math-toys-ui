import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
  initialTiers = 6,
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

      // Center vertically
      const box = new THREE.Box3().setFromPoints(pts);
      const center = new THREE.Vector3();
      box.getCenter(center);
      for (const p of pts) p.z -= center.z;

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

      // --- Camera framing based on center lattice only (ignores sphere size) ---
      // Tuned to “fit” nicely on most screens: lower factor => closer camera => larger on screen
      const VIEW_FIT = 0.72; // sweet spot; try 0.68–0.80 if you want to tweak later

      const size = new THREE.Vector3();
      box.getSize(size); // from centers only
      const maxDim = Math.max(size.x, size.y, size.z) || (4 * layoutRadius);
      const dist = maxDim * VIEW_FIT / Math.tan((Math.PI * camera.fov) / 360);

      camera.position.set(dist, dist, dist);
      controls.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
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

  // styling
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: height,
    maxHeight: '100%',
    background: '#0b1020',
    color: '#e8f0ff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
  };
  const headerStyle = {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    fontSize: '13px',
  };
  const controlsStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 'auto' };
  const ctrlBlockStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#12172b',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
  };
  const viewStyle = { position: 'relative', flex: 1 };
  const statsStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    background: '#ffffff',
    color: '#000000',
    border: '1px solid rgba(0,0,0,0.2)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    lineHeight: 1.4,
  };
  const canvasHostStyle = { width: '100%', height: '100%' };

  // --- JSX ---
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          Square Pyramidal (Two Right Tetrahedra)
        </div>
        <div style={controlsStyle}>
          <label style={ctrlBlockStyle}>
            Tiers
            <input
              type="range"
              min={1}
              max={maxTiers}
              step={1}
              value={tiers}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10) || 1;
                setTiers(Math.max(1, Math.min(maxTiers, v)));
              }}
            />
            <input
              type="number"
              min={1}
              max={maxTiers}
              step={1}
              value={tiers}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10) || 1;
                setTiers(Math.max(1, Math.min(maxTiers, v)));
              }}
              style={{
                width: 56,
                background: '#0e1428',
                color: '#e8f0ff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '3px 5px',
                fontSize: 12,
              }}
            />
          </label>

          <label style={ctrlBlockStyle}>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            Auto-rotate
          </label>

          <label style={ctrlBlockStyle}>
            Colors
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value)}
              style={{
                background: '#0e1428',
                color: '#e8f0ff',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '3px 6px',
                fontSize: 12,
              }}
            >
              <option value="tetra">By tetrahedra</option>
              <option value="layer">By layer</option>
            </select>
          </label>
        </div>
      </div>

      <div style={viewStyle}>
        <div ref={mountRef} style={canvasHostStyle} />
        <div style={statsStyle}>
          <div>tiers: {tiers} • spheres: {sphereCount}</div>
          <div>square pyramidal P<sub>{tiers}</sub> = {squarePyr}</div>
          <div>= T<sub>{tiers - 1}</sub> ({smallTet}) + T<sub>{tiers}</sub> ({bigTet})</div>
        </div>
      </div>
    </div>
  );
}
