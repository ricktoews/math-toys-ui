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

// Calculate positions for regular tetrahedra (all faces equilateral triangles)
function calculateRegularTetrahedronPositions(n, layoutRadius) {
  const positions = [];
  
  // Edge length for equilateral triangle
  const a = 2 * layoutRadius;
  
  // For a regular tetrahedron with edge length a:
  // - Base is an equilateral triangle in XY plane
  // - Height between layers is a * sqrt(2/3)
  const layerHeight = a * Math.sqrt(2 / 3);
  
  // Build from bottom layer to apex
  for (let layer = 0; layer < n; layer++) {
    const numInLayer = n - layer; // Triangular number for this layer
    const z = layer * layerHeight;
    
    // Build equilateral triangle grid for this layer
    // Each layer is a smaller equilateral triangle
    for (let row = 0; row < numInLayer; row++) {
      const numInRow = row + 1;
      
      for (let col = 0; col < numInRow; col++) {
        // Equilateral triangle geometry:
        // - Horizontal spacing is 'a'
        // - Vertical spacing between rows is a * sqrt(3)/2
        const x = (col - row / 2) * a;
        const y = row * a * Math.sqrt(3) / 2;
        
        // Center the triangle for this layer
        const centerOffset = (numInLayer - 1) * a * Math.sqrt(3) / 6;
        
        positions.push(new THREE.Vector3(x, y - centerOffset, z));
      }
    }
  }
  
  return positions;
}

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
  const [isMerged, setIsMerged] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);

  const buildStackRef = useRef(null);
  const mergedPositionsRef = useRef([]);
  const separatedPositionsRef = useRef([]);
  const animationProgressRef = useRef(0); // Start at 0 (separated)
  const animationFrameRef = useRef(null);

  // --- Animation handler ---
  const animate = () => {
    if (!isAnimating || !instancedRef.current || isRebuilding) return;
    
    const speed = 0.02; // Animation speed
    const targetProgress = isMerged ? 1 : 0;
    
    animationProgressRef.current += (targetProgress - animationProgressRef.current) * speed;
    
    // Update sphere positions
    const matrix = new THREE.Matrix4();
    const merged = mergedPositionsRef.current;
    const separated = separatedPositionsRef.current;
    
    for (let i = 0; i < merged.length; i++) {
      const t = animationProgressRef.current;
      const pos = new THREE.Vector3(
        separated[i].x + (merged[i].x - separated[i].x) * t,
        separated[i].y + (merged[i].y - separated[i].y) * t,
        separated[i].z + (merged[i].z - separated[i].z) * t
      );
      matrix.makeTranslation(pos.x, pos.y, pos.z);
      instancedRef.current.setMatrixAt(i, matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
    
    // Check if animation is complete
    if (Math.abs(animationProgressRef.current - targetProgress) < 0.001) {
      animationProgressRef.current = targetProgress;
      setIsAnimating(false);
    } else {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // --- Animation loop effect ---
  useEffect(() => {
    if (isAnimating) {
      animate();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]); // Removed isMerged dependency to prevent re-triggering

  // --- Toggle merge/separate ---
  const handleToggleMerge = () => {
    setIsMerged(prev => !prev);
    setIsAnimating(true);
  };

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
    controls.target.set(0, 0, 0.35); // Adjusted to raise pyramid on screen
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

      // Store merged positions (right tetrahedra)
      mergedPositionsRef.current = pts.map(p => p.clone());

      // Build separated state: same right tetrahedra, just positioned apart
      // They maintain their right tetrahedron structure throughout - just translate horizontally
      
      const separatedPtsFinal = [];
      
      // Find the center of each tetrahedron in merged state
      const tetra0Points = [];
      const tetra1Points = [];
      
      for (let i = 0; i < pts.length; i++) {
        if (which[i] === 0) {
          tetra0Points.push(pts[i]);
        } else {
          tetra1Points.push(pts[i]);
        }
      }
      
      const box0 = new THREE.Box3().setFromPoints(tetra0Points);
      const box1 = new THREE.Box3().setFromPoints(tetra1Points);
      const center0 = new THREE.Vector3();
      const center1 = new THREE.Vector3();
      box0.getCenter(center0);
      box1.getCenter(center1);
      
      // Determine which tetrahedron is on the left/right based on their centers
      const tetra0IsLeft = center0.x < center1.x;
      
      // Calculate separation: move them apart by gap + half their widths
      const gapBetweenSpheres = 0.375; // ~25px
      const width0 = box0.max.x - box0.min.x;
      const width1 = box1.max.x - box1.min.x;
      const totalSeparation = width0 / 2 + width1 / 2 + gapBetweenSpheres;
      
      // Offset each tetrahedron based on which side they're naturally on
      const offset0 = tetra0IsLeft ? -totalSeparation / 2 : totalSeparation / 2;
      const offset1 = tetra0IsLeft ? totalSeparation / 2 : -totalSeparation / 2;
      
      // Create separated positions by offsetting each tetrahedron
      for (let i = 0; i < pts.length; i++) {
        const pos = pts[i].clone();
        if (which[i] === 0) {
          pos.x += offset0;
          // Lower dark blue (tetra0) by 100px (~1.5 units), then raise by 50px (~0.75 units)
          pos.z -= 0.75; // Net: -1.5 + 0.75 = -0.75
        } else {
          pos.x += offset1;
          // Lower light blue (tetra1) by 200px (~3.0 units)
          pos.z -= 3.0;
        }
        separatedPtsFinal.push(pos);
      }
      
      // Align the bases: find the Y range of each tetrahedron at their base level
      // and center them on the same Y coordinate
      const tetra0SepPoints = [];
      const tetra1SepPoints = [];
      
      for (let i = 0; i < separatedPtsFinal.length; i++) {
        if (which[i] === 0) {
          tetra0SepPoints.push(separatedPtsFinal[i]);
        } else {
          tetra1SepPoints.push(separatedPtsFinal[i]);
        }
      }
      
      const sepBox0 = new THREE.Box3().setFromPoints(tetra0SepPoints);
      const sepBox1 = new THREE.Box3().setFromPoints(tetra1SepPoints);
      const sepCenter0Y = (sepBox0.min.y + sepBox0.max.y) / 2;
      const sepCenter1Y = (sepBox1.min.y + sepBox1.max.y) / 2;
      
      // Align on Y axis (shift tetra1 to match tetra0's Y center)
      const yAlignment = sepCenter0Y - sepCenter1Y;
      for (let i = 0; i < separatedPtsFinal.length; i++) {
        if (which[i] === 1) {
          separatedPtsFinal[i].y += yAlignment;
        }
      }
      
      // Anchor both position sets at the base
      const boxCenters = new THREE.Box3().setFromPoints(pts);
      const baseZ = boxCenters.min.z;
      const targetBaseZ = -2.1 - 3.0; // Lower by 200px (3.0 units) to keep below buttons
      const zShift = targetBaseZ - baseZ;
      
      for (const p of pts) p.z += zShift;
      
      separatedPositionsRef.current = separatedPtsFinal;
      
      // Set animation progress to match current merged state
      animationProgressRef.current = isMerged ? 1 : 0;

      // Build instanced spheres
      const geo = new THREE.SphereGeometry(sphereRadius, 32, 32);
      const instanced = new THREE.InstancedMesh(geo, sphereMatLocal, pts.length);
      instancedRef.current = instanced;

      const matrix = new THREE.Matrix4();
      const color = new THREE.Color();
      // Use current merged state to determine initial positions
      const initialPositions = isMerged ? pts : separatedPtsFinal;
      for (let index = 0; index < pts.length; index++) {
        const p = initialPositions[index];
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
      controls.target.set(0, 0, 0.35); // Adjusted to raise pyramid on screen
      camera.lookAt(0, 0, 0.35);
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
  // --- when tiers/colorMode change, rebuild ---
  useEffect(() => {
    if (buildStackRef.current) {
      setIsRebuilding(true);
      setIsAnimating(false); // Stop any ongoing animation
      buildStackRef.current(tiers, colorMode);
      // Small delay to ensure mesh is created before clearing rebuild flag
      setTimeout(() => setIsRebuilding(false), 0);
    }
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
            {isMerged ? (
              <>
                P<sub>{tiers}</sub> = {squarePyr} spheres = 
                T<sub>{tiers - 1}</sub> ({smallTet}) + T<sub>{tiers}</sub> ({bigTet})
              </>
            ) : (
              <>
                T<sub>{tiers}</sub> ({bigTet} spheres) and T<sub>{tiers - 1}</sub> ({smallTet} spheres)
              </>
            )}
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

            <button
              type="button"
              onClick={handleToggleMerge}
              className={isMerged ? "sqpyr-toggle-btn sqpyr-toggle-on" : "sqpyr-toggle-btn sqpyr-toggle-off"}
              disabled={isAnimating}
              aria-label="Toggle merge/separate"
            >
              {isMerged ? 'Separate' : 'Merge'}
            </button>
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
