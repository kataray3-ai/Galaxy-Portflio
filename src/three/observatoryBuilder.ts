import * as THREE from 'three';
import { SkillPlanet } from '../data/portfolioData';

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function createProceduralPlanetTexture(
  primaryHex: string,
  accentHex: string,
  renderer: THREE.WebGLRenderer
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#090d1a');
    grad.addColorStop(0.4, primaryHex);
    grad.addColorStop(0.75, accentHex);
    grad.addColorStop(1, '#0b1020');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Subtle latitude bands & technical meridian lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    for (let y = 24; y < 256; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + 8, 340, y - 8, 512, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 32; x < 512; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

export function createSpiralGalaxyPoints(
  starCount: number,
  maxRadius: number,
  arms: number
): { points: THREE.Points; material: THREE.ShaderMaterial } {
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const scales = new Float32Array(starCount);
  const phases = new Float32Array(starCount);

  const coreColor = new THREE.Color('#F5B041');
  const midColor = new THREE.Color('#7DD3FC');
  const outerColor = new THREE.Color('#3B4B75');
  const tempColor = new THREE.Color();

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = Math.pow(Math.random(), 1.45) * maxRadius;
    const armIndex = i % arms;
    const branchAngle = (armIndex / arms) * Math.PI * 2;
    const spinAngle = radius * 0.42;

    const scatterScale = 0.22 + radius * 0.085;
    const randomX = (Math.random() - 0.5) * 2 * Math.pow(Math.random(), 1.6) * scatterScale;
    const randomY = (Math.random() - 0.5) * 2 * Math.pow(Math.random(), 2.1) * (scatterScale * 0.55);
    const randomZ = (Math.random() - 0.5) * 2 * Math.pow(Math.random(), 1.6) * scatterScale;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const t = Math.min(1, radius / maxRadius);
    if (t < 0.35) {
      tempColor.copy(coreColor).lerp(midColor, t / 0.35);
    } else {
      tempColor.copy(midColor).lerp(outerColor, (t - 0.35) / 0.65);
    }

    colors[i3] = tempColor.r;
    colors[i3 + 1] = tempColor.g;
    colors[i3 + 2] = tempColor.b;

    scales[i] = 0.6 + Math.random() * 1.9;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uBaseSize: { value: 26.0 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uBaseSize;
      attribute float aScale;
      attribute float aPhase;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.72 + 0.28 * sin(uTime * 1.6 + aPhase);
        vAlpha = twinkle;
        gl_PointSize = uBaseSize * aScale * twinkle * uPixelRatio * (1.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        float strength = pow(1.0 - dist * 2.0, 2.4);
        gl_FragColor = vec4(vColor, strength * vAlpha * 0.92);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const points = new THREE.Points(geometry, material);
  return { points, material };
}

export function createCentralAstrolabe(): {
  group: THREE.Group;
  outerRing: THREE.Mesh;
  midRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  coreMesh: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Primary incandescent core
  const coreGeo = new THREE.IcosahedronGeometry(1.15, 2);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F5B041'),
    emissive: new THREE.Color('#D97706'),
    emissiveIntensity: 0.75,
    roughness: 0.22,
    metalness: 0.35,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. Wireframe geodesic cage around core
  const cageGeo = new THREE.IcosahedronGeometry(1.42, 1);
  const cageEdges = new THREE.EdgesGeometry(cageGeo, 15);
  cageGeo.dispose();
  const cageMat = new THREE.LineBasicMaterial({
    color: new THREE.Color('#FDE68A'),
    transparent: true,
    opacity: 0.38,
  });
  const cage = new THREE.LineSegments(cageEdges, cageMat);
  group.add(cage);

  // 3. Three brushed-metal gimbal rings with distinct roughness/metalness contrast
  const goldMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F5B041'),
    metalness: 0.92,
    roughness: 0.18,
  });
  const titaniumMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#94A3B8'),
    metalness: 0.88,
    roughness: 0.28,
  });
  const skyMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38BDF8'),
    metalness: 0.78,
    roughness: 0.24,
  });

  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.045, 16, 72), goldMetal);
  innerRing.rotation.x = Math.PI / 3;
  group.add(innerRing);

  const midRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.04, 16, 84), titaniumMetal);
  midRing.rotation.y = Math.PI / 4;
  group.add(midRing);

  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.055, 16, 96), skyMetal);
  outerRing.rotation.x = Math.PI / 2.2;
  group.add(outerRing);

  // 4. Instanced equatorial calibration ticks on outer perimeter
  const tickCount = 32;
  const tickGeo = new THREE.BoxGeometry(0.04, 0.16, 0.04);
  const tickMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E2E8F0'),
    metalness: 0.85,
    roughness: 0.25,
  });
  const ticks = new THREE.InstancedMesh(tickGeo, tickMat, tickCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2;
    dummy.position.set(Math.cos(angle) * 3.12, 0, Math.sin(angle) * 3.12);
    dummy.rotation.set(0, -angle, 0);
    dummy.scale.setScalar(i % 4 === 0 ? 1.35 : 0.85);
    dummy.updateMatrix();
    ticks.setMatrixAt(i, dummy.matrix);
  }
  ticks.instanceMatrix.needsUpdate = true;
  ticks.computeBoundingSphere();
  group.add(ticks);

  return { group, outerRing, midRing, innerRing, coreMesh };
}

export interface PlanetRig {
  data: SkillPlanet;
  orbitContainer: THREE.Group;
  planetGroup: THREE.Group;
  coreMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  moonMesh: THREE.Mesh;
  auraSprite: THREE.Sprite;
  sparkPoints: THREE.Points;
  hitProxy: THREE.Mesh;
  orbitLine: THREE.LineLoop;
  angle: number;
}

function createPlanetAuraTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.28, colorHex);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSkillPlanetRig(
  planet: SkillPlanet,
  renderer: THREE.WebGLRenderer
): PlanetRig {
  const orbitContainer = new THREE.Group();
  orbitContainer.rotation.z = planet.tilt;

  // Orbit trajectory ring
  const segments = 128;
  const orbitPts: THREE.Vector3[] = [];
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    orbitPts.push(
      new THREE.Vector3(
        Math.cos(theta) * planet.orbitRadius,
        0,
        Math.sin(theta) * planet.orbitRadius
      )
    );
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
  const orbitMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(planet.colorHex),
    transparent: true,
    opacity: 0.24,
  });
  const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
  orbitContainer.add(orbitLine);

  // Composite planet group (5+ distinct parts)
  const planetGroup = new THREE.Group();
  const texture = createProceduralPlanetTexture(planet.colorHex, planet.accentHex, renderer);

  let coreGeo: THREE.BufferGeometry;
  switch (planet.planetStyle) {
    case 'crystal':
      coreGeo = new THREE.IcosahedronGeometry(0.62, 1);
      break;
    case 'prism':
      coreGeo = new THREE.DodecahedronGeometry(0.58, 0);
      break;
    case 'octa':
      coreGeo = new THREE.OctahedronGeometry(0.6, 1);
      break;
    case 'torus':
      coreGeo = new THREE.SphereGeometry(0.54, 32, 24);
      break;
    case 'gyro':
    case 'ringed':
    default:
      coreGeo = new THREE.SphereGeometry(0.58, 32, 24);
      break;
  }

  const coreMat = new THREE.MeshStandardMaterial({
    map: texture,
    color: new THREE.Color(planet.colorHex),
    emissive: new THREE.Color(planet.colorHex),
    emissiveIntensity: 0.28,
    roughness: 0.35,
    metalness: 0.45,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  planetGroup.add(coreMesh);

  // Accent metallic orbital ring around the planet
  const ringMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(planet.accentHex),
    metalness: 0.88,
    roughness: 0.16,
  });
  const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.032, 12, 48), ringMat);
  ringMesh.rotation.x = Math.PI / 2.4;
  planetGroup.add(ringMesh);

  // Secondary vertical collar for silhouette richness
  const collarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#CBD5E1'),
    metalness: 0.9,
    roughness: 0.22,
  });
  const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.02, 10, 40), collarMat);
  collarMesh.rotation.y = Math.PI / 3;
  planetGroup.add(collarMesh);

  // Orbiting satellite moonlet
  const moonMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.14, 0),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(planet.accentHex),
      emissive: new THREE.Color(planet.colorHex),
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.7,
    })
  );
  moonMesh.position.set(1.15, 0.18, 0);
  planetGroup.add(moonMesh);

  // Radial starlight aura sprite (intensifies on hover)
  const auraTex = createPlanetAuraTexture(planet.colorHex);
  const auraMat = new THREE.SpriteMaterial({
    map: auraTex,
    color: new THREE.Color(planet.accentHex),
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const auraSprite = new THREE.Sprite(auraMat);
  auraSprite.scale.set(2.4, 2.4, 1);
  planetGroup.add(auraSprite);

  // Micro star-spark ring around planet (expands & spins faster on hover)
  const sparkCount = 22;
  const sparkPositions = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    const theta = (i / sparkCount) * Math.PI * 2;
    const r = 1.15 + (i % 3) * 0.22;
    sparkPositions[i * 3] = Math.cos(theta) * r;
    sparkPositions[i * 3 + 1] = ((i % 5) - 2) * 0.12;
    sparkPositions[i * 3 + 2] = Math.sin(theta) * r;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: new THREE.Color(planet.accentHex),
    size: 0.14,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  planetGroup.add(sparkPoints);

  // Invisible raycast proxy sphere on Layer 1 for easy clicking/hovering
  const hitProxy = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 16, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitProxy.layers.set(1);
  hitProxy.userData.planetId = planet.id;
  planetGroup.add(hitProxy);

  // Place at initial orbital angle
  const angle = planet.initialAngle;
  planetGroup.position.set(
    Math.cos(angle) * planet.orbitRadius,
    0,
    Math.sin(angle) * planet.orbitRadius
  );

  orbitContainer.add(planetGroup);

  return {
    data: planet,
    orbitContainer,
    planetGroup,
    coreMesh,
    ringMesh,
    moonMesh,
    auraSprite,
    sparkPoints,
    hitProxy,
    orbitLine,
    angle,
  };
}
