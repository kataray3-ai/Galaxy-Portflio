import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw } from 'lucide-react';
import { SkillPlanet } from '../data/portfolioData';
import { cosmicAudio } from '../audio/cosmicAudio';
import {
  createCentralAstrolabe,
  createSkillPlanetRig,
  createSpiralGalaxyPoints,
  detectSoftwareWebGL,
  PlanetRig,
} from '../three/observatoryBuilder';

interface GalaxyObservatoryProps {
  planets: SkillPlanet[];
  selectedPlanetId: string | null;
  onSelectPlanet: (planetId: string | null) => void;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 14.5, 25.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

// Pre-allocated math helpers (zero GC inside animation loop)
const _worldPos = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _desiredLook = new THREE.Vector3();
const _rayOffset = new THREE.Vector3();

export function GalaxyObservatory({
  planets,
  selectedPlanetId,
  onSelectPlanet,
}: GalaxyObservatoryProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [dockOpen, setDockOpen] = useState(true);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Refs synced with React state without tearing down WebGL
  const selectedIdRef = useRef<string | null>(selectedPlanetId);
  const externalHoverIdRef = useRef<string | null>(null);
  const pausedRef = useRef<boolean>(isPaused);
  const onSelectRef = useRef(onSelectPlanet);
  const cameraTransitionActiveRef = useRef<boolean>(false);
  const resetRequestedRef = useRef<boolean>(false);

  useEffect(() => {
    onSelectRef.current = onSelectPlanet;
  }, [onSelectPlanet]);

  useEffect(() => {
    selectedIdRef.current = selectedPlanetId;
    cameraTransitionActiveRef.current = true;
  }, [selectedPlanetId]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const handleExternalHover = (planetId: string | null) => {
    externalHoverIdRef.current = planetId;
    setHoveredPlanetId(planetId);
    if (planetId) {
      const idx = planets.findIndex((p) => p.id === planetId);
      cosmicAudio.playHoverSparkle(idx >= 0 ? idx : 0);
    }
  };

  // Keyboard shortcut 'H' to toggle bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      pausedRef.current = true;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    let viewportWidth = mountEl.clientWidth || 1200;
    let viewportHeight = mountEl.clientHeight || 620;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060916');
    scene.fog = new THREE.FogExp2('#060916', 0.015);

    const camera = new THREE.PerspectiveCamera(46, viewportWidth / viewportHeight, 0.1, 160);
    camera.position.copy(DEFAULT_CAMERA_POS);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(viewportWidth, viewportHeight);
    renderer.shadowMap.enabled = false;
    mountEl.appendChild(renderer.domElement);

    // Studio reflection environment (RoomEnvironment) on all devices
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#93C5FD', '#0F172A', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FDE68A', 2.1);
    keyLight.position.set(14, 18, 12);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38BDF8', 1.2);
    rimLight.position.set(-16, -6, -14);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight('#F5B041', 3.2, 28, 1.5);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // Local spiral galaxy particle field
    const { points: localGalaxy, material: localGalaxyMat } = createSpiralGalaxyPoints(
      4200,
      24,
      4
    );
    localGalaxyMat.uniforms.uPixelRatio.value = pixelRatio;
    localGalaxyMat.uniforms.uBaseSize.value = 22.0;
    localGalaxy.position.y = -0.5;
    scene.add(localGalaxy);

    // Central Astrolabe Core
    const astrolabe = createCentralAstrolabe();
    scene.add(astrolabe.group);

    // 6 Skill Planets
    const planetRigs: PlanetRig[] = planets.map((p) => {
      const rig = createSkillPlanetRig(p, renderer);
      scene.add(rig.orbitContainer);
      return rig;
    });

    const hitProxies = planetRigs.map((r) => r.hitProxy);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.2;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.minPolarAngle = 0.2;
    controls.enablePan = false;
    controls.target.copy(DEFAULT_TARGET);

    const cancelTransition = () => {
      cameraTransitionActiveRef.current = false;
    };
    controls.addEventListener('start', cancelTransition);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster restricted to Layer 1 proxies
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let lastHoverTime = 0;
    let pointerDownPos = { x: 0, y: 0 };
    let raycastHovered: string | null = null;

    const updatePointerNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 45) return;
      lastHoverTime = now;

      updatePointerNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitProxies, false);
      const hitId = hits.length > 0 ? (hits[0].object.userData.planetId as string) : null;

      if (hitId !== raycastHovered) {
        raycastHovered = hitId;
        setHoveredPlanetId(hitId ?? externalHoverIdRef.current);
        renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
        if (hitId) {
          const idx = planets.findIndex((p) => p.id === hitId);
          cosmicAudio.playHoverSparkle(idx >= 0 ? idx : 0);
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      updatePointerNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitProxies, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.planetId as string;
        onSelectRef.current(hitId);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const handleResize = () => {
      if (!mountEl) return;
      viewportWidth = mountEl.clientWidth || 1200;
      viewportHeight = mountEl.clientHeight || 620;
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
      const pr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pr);
      renderer.setSize(viewportWidth, viewportHeight);
      localGalaxyMat.uniforms.uPixelRatio.value = pr;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountEl);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      localGalaxyMat.uniforms.uTime.value = elapsed;

      if (!pausedRef.current) {
        astrolabe.coreMesh.rotation.y += delta * 0.35;
        astrolabe.coreMesh.rotation.x += delta * 0.14;
        astrolabe.innerRing.rotation.z += delta * 0.45;
        astrolabe.midRing.rotation.x += delta * 0.28;
        astrolabe.outerRing.rotation.y -= delta * 0.18;
        localGalaxy.rotation.y += delta * 0.025;
      }

      const activeId = selectedIdRef.current;
      const effectiveHoverId = raycastHovered ?? externalHoverIdRef.current;

      for (let i = 0; i < planetRigs.length; i++) {
        const rig = planetRigs[i];
        const isSelected = rig.data.id === activeId;
        const isHovered = rig.data.id === effectiveHoverId;

        if (!pausedRef.current) {
          // Hover slows orbit slightly for precision inspection while spinning rings faster
          const orbitRate = isHovered ? rig.data.orbitSpeed * 0.25 : rig.data.orbitSpeed;
          rig.angle += delta * orbitRate;
          rig.planetGroup.position.set(
            Math.cos(rig.angle) * rig.data.orbitRadius,
            0,
            Math.sin(rig.angle) * rig.data.orbitRadius
          );
          rig.coreMesh.rotation.y += delta * (isHovered ? 1.85 : 0.65);
          rig.ringMesh.rotation.z += delta * (isHovered ? 1.55 : 0.4);
          rig.sparkPoints.rotation.y += delta * (isHovered ? 1.9 : 0.45);
          rig.moonMesh.position.set(
            Math.cos(elapsed * 1.4 + i) * 1.15,
            Math.sin(elapsed * 1.1 + i) * 0.22,
            Math.sin(elapsed * 1.4 + i) * 1.15
          );
        }

        // Smooth scale, aura, spark flare & emissive intensity on hover/select
        const targetScale = isSelected ? 1.34 : isHovered ? 1.28 : 1.0;
        const nextScale = THREE.MathUtils.damp(rig.planetGroup.scale.x, targetScale, 9, delta);
        rig.planetGroup.scale.setScalar(nextScale);

        const coreMat = rig.coreMesh.material as THREE.MeshStandardMaterial;
        coreMat.emissiveIntensity = THREE.MathUtils.damp(
          coreMat.emissiveIntensity,
          isHovered ? 0.92 : isSelected ? 0.65 : 0.28,
          9,
          delta
        );

        const auraMat = rig.auraSprite.material as THREE.SpriteMaterial;
        auraMat.opacity = THREE.MathUtils.damp(
          auraMat.opacity,
          isHovered ? 0.85 : isSelected ? 0.62 : 0.2,
          9,
          delta
        );
        const auraScale = THREE.MathUtils.damp(
          rig.auraSprite.scale.x,
          isHovered ? 3.8 : isSelected ? 3.2 : 2.35,
          9,
          delta
        );
        rig.auraSprite.scale.set(auraScale, auraScale, 1);

        const sparkMat = rig.sparkPoints.material as THREE.PointsMaterial;
        sparkMat.opacity = THREE.MathUtils.damp(
          sparkMat.opacity,
          isHovered ? 0.95 : isSelected ? 0.72 : 0.3,
          9,
          delta
        );
        const sparkScale = THREE.MathUtils.damp(
          rig.sparkPoints.scale.x,
          isHovered ? 1.38 : 1.0,
          8,
          delta
        );
        rig.sparkPoints.scale.setScalar(sparkScale);

        const orbitMat = rig.orbitLine.material as THREE.LineBasicMaterial;
        const targetOpacity = isSelected ? 0.78 : isHovered ? 0.72 : 0.22;
        orbitMat.opacity = THREE.MathUtils.damp(orbitMat.opacity, targetOpacity, 9, delta);
      }

      // Smooth damped camera focus transitions
      if (resetRequestedRef.current) {
        cameraTransitionActiveRef.current = true;
        resetRequestedRef.current = false;
      }

      if (cameraTransitionActiveRef.current) {
        if (activeId) {
          const targetRig = planetRigs.find((r) => r.data.id === activeId);
          if (targetRig) {
            targetRig.planetGroup.getWorldPosition(_worldPos);
            _desiredLook.copy(_worldPos);
            _rayOffset.copy(_worldPos).normalize().multiplyScalar(5.4);
            if (_rayOffset.lengthSq() < 0.01) {
              _rayOffset.set(0, 2.5, 5.4);
            }
            _desiredCamPos.copy(_worldPos).add(_rayOffset);
            _desiredCamPos.y += 2.2;
          }
        } else {
          _desiredLook.copy(DEFAULT_TARGET);
          _desiredCamPos.copy(DEFAULT_CAMERA_POS);
        }

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredLook.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredLook.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredLook.z, 5.5, delta);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, 4.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, 4.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, 4.5, delta);

        if (
          !activeId &&
          camera.position.distanceTo(_desiredCamPos) < 0.08 &&
          controls.target.distanceTo(_desiredLook) < 0.05
        ) {
          cameraTransitionActiveRef.current = false;
        }
      }

      controls.update();

      // Project 3D planet world coordinates to 2D floating skill tags
      for (let i = 0; i < planetRigs.length; i++) {
        const labelEl = labelRefs.current[i];
        if (!labelEl) continue;

        planetRigs[i].planetGroup.getWorldPosition(_worldPos);
        _worldPos.y += 1.08;
        _projVec.copy(_worldPos).project(camera);

        const inFront = _projVec.z > -1 && _projVec.z < 1;
        const x = (_projVec.x * 0.5 + 0.5) * viewportWidth;
        const y = (-_projVec.y * 0.5 + 0.5) * viewportHeight;
        const inBounds =
          inFront &&
          x > 36 &&
          x < viewportWidth - 36 &&
          y > 28 &&
          y < viewportHeight - 80;

        if (inBounds) {
          labelEl.style.opacity = '1';
          labelEl.style.pointerEvents = 'auto';
          labelEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
        } else {
          labelEl.style.opacity = '0';
          labelEl.style.pointerEvents = 'none';
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', cancelTransition);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.Points).isPoints || (obj as THREE.Line).isLine || (obj as THREE.Sprite).isSprite) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, [planets]);

  const hoveredPlanet = planets.find((p) => p.id === hoveredPlanetId);
  const selectedPlanet = planets.find((p) => p.id === selectedPlanetId);

  const handleResetView = () => {
    onSelectPlanet(null);
    resetRequestedRef.current = true;
    cameraTransitionActiveRef.current = true;
  };

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl border border-white/10 bg-[#060916] overflow-hidden">
      {/* Isolated WebGL mount container */}
      {webglUnavailable ? (
        <div className="flex flex-col items-center justify-center w-full h-full px-6 text-center bg-[radial-gradient(circle_at_center,#131b36_0%,#060916_75%)]">
          <p className="font-display text-xl font-semibold text-slate-100">
            Interactive 3D Skill Constellation
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Use the skill selector below to inspect each core competency across Yamini Katara&apos;s digital marketing &amp; AI ecosystem.
          </p>
        </div>
      ) : (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      )}

      {/* 3D-Projected Live Skill Labels anchored directly over each orbiting planet */}
      {!webglUnavailable && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {planets.map((planet, idx) => {
            const isActive = selectedPlanetId === planet.id || hoveredPlanetId === planet.id;
            return (
              <button
                key={planet.id}
                ref={(el) => {
                  labelRefs.current[idx] = el;
                }}
                type="button"
                onMouseEnter={() => handleExternalHover(planet.id)}
                onMouseLeave={() => handleExternalHover(null)}
                onClick={() => onSelectPlanet(planet.id)}
                className={`absolute top-0 left-0 opacity-0 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors duration-150 whitespace-nowrap shrink-0 shadow-md ${
                  isActive
                    ? 'border-[#F5B041] bg-[#0B101E]/95 text-[#F5B041] scale-105'
                    : 'border-white/20 bg-[#04060E]/85 text-slate-100 hover:border-[#F5B041] hover:text-[#F5B041]'
                }`}
              >
                <span className="font-mono-tabular text-[#F5B041] mr-1">{planet.index}</span>
                <span>{planet.shortName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top HUD Bar: Left status & Right live Hover Skill Callout */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 flex items-start justify-between gap-4">
        <div className="rounded-lg bg-[#0B101E]/90 border border-white/10 px-3.5 py-2">
          <p className="font-mono-tabular text-xs text-[#F5B041]">
            {selectedPlanet
              ? `${selectedPlanet.index}. ${selectedPlanet.name}`
              : hoveredPlanet
                ? `Planet ${hoveredPlanet.index} · ${hoveredPlanet.name}`
                : '3D Skill Galaxy · Hover or Click Any Orbiting Skill Planet'}
          </p>
        </div>

        {hoveredPlanet && (
          <div className="hidden sm:block max-w-xs rounded-xl border border-[#F5B041]/40 bg-[#0B101E]/95 px-4 py-3 shadow-xl">
            <p className="text-[11px] font-mono-tabular text-[#F5B041]">
              {hoveredPlanet.index} · {hoveredPlanet.sector}
            </p>
            <p className="mt-1 font-display text-sm font-semibold text-white">
              {hoveredPlanet.name}
            </p>
            <p className="mt-1 text-xs text-slate-300 leading-snug">
              {hoveredPlanet.tools.join(' · ')}
            </p>
            <p className="mt-2 text-[11px] text-[#7DD3FC]">
              Click planet to focus &amp; inspect deliverables
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div
        data-no-supernova="true"
        className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(920px,calc(100%-24px))] flex flex-col items-center"
      >
        <button
          type="button"
          onClick={() => setDockOpen((prev) => !prev)}
          aria-expanded={dockOpen}
          className="mb-1.5 inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/15 bg-[#0B101E]/95 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          {dockOpen ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls</span>
            </>
          )}
        </button>

        {dockOpen && (
          <div className="w-full rounded-xl border border-white/12 bg-[#0B101E]/95 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetView}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedPlanetId === null
                    ? 'bg-[#F5B041] text-[#04060E]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Galaxy Core
              </button>
              {planets.map((planet) => {
                const active = selectedPlanetId === planet.id;
                return (
                  <button
                    key={planet.id}
                    type="button"
                    onMouseEnter={() => handleExternalHover(planet.id)}
                    onMouseLeave={() => handleExternalHover(null)}
                    onClick={() => onSelectPlanet(planet.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#F5B041] text-[#04060E]'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {planet.index} {planet.shortName}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? 'Resume orbit' : 'Pause orbit'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetView}
                aria-label="Reset camera view"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
