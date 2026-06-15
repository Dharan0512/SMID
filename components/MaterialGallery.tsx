"use client";

import { Suspense, useEffect, useRef, useState, MutableRefObject } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  RoundedBox,
  useTexture,
  AdaptiveDpr,
  AdaptiveEvents,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*                              Gallery contents                              */
/* -------------------------------------------------------------------------- */

type PanelData = {
  image: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

/**
 * Five slabs arranged in a gentle convex arc facing the camera — like material
 * samples mounted on an invisible architectural wall.
 */
const PANELS: PanelData[] = [
  { image: "/media/smidworkimage2.webp", position: [-3.4, 0.2, -1.6], rotation: [0, 0.55, 0] },
  { image: "/media/smidworkimage4.webp", position: [-1.75, -0.3, -0.4], rotation: [0, 0.28, 0] },
  { image: "/media/smidworkimage1.webp", position: [0, 0.35, 0.3], rotation: [0, 0, 0] },
  { image: "/media/smidworkimage5.webp", position: [1.75, -0.3, -0.4], rotation: [0, -0.28, 0] },
  { image: "/media/smidworkimage3.webp", position: [3.4, 0.2, -1.6], rotation: [0, -0.55, 0] },
];

// Warm up the GPU texture cache before first paint.
useTexture.preload(PANELS.map((p) => p.image));

/* -------------------------------------------------------------------------- */
/*                                One slab                                     */
/* -------------------------------------------------------------------------- */

function Panel({
  data,
  index,
}: {
  data: PanelData;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useTexture(data.image, (t) => {
    const tex = t as THREE.Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  const baseY = data.position[1];
  const baseRotY = data.rotation[1];

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;

    // Idle float — phase-offset per panel so the array breathes asynchronously.
    g.position.y = baseY + Math.sin(t * 0.6 + index * 1.3) * 0.14;

    // Hover: smoothly rotate the slab flat toward camera + scale up.
    // THREE.MathUtils.damp is frame-rate independent (lambda-based easing).
    const targetRotY = hovered ? 0 : baseRotY;
    const targetScale = hovered ? 1.14 : 1;
    const targetZ = hovered ? data.position[2] + 0.6 : data.position[2];

    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 5, delta);
    g.rotation.z = THREE.MathUtils.damp(
      g.rotation.z,
      Math.sin(t * 0.4 + index) * 0.02,
      3,
      delta
    );
    g.position.z = THREE.MathUtils.damp(g.position.z, targetZ, 5, delta);

    const s = THREE.MathUtils.damp(g.scale.x, targetScale, 6, delta);
    g.scale.setScalar(s);
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group
      ref={group}
      position={data.position}
      rotation={data.rotation}
      onPointerOver={onOver}
      onPointerOut={onOut}
    >
      <RoundedBox
        args={[1.5, 2.05, 0.09]}
        radius={0.045}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={texture}
          roughness={0.4}
          metalness={0.15}
          envMapIntensity={0.9}
        />
      </RoundedBox>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                  Group: mouse parallax + scroll-depth drift                 */
/* -------------------------------------------------------------------------- */

function Gallery({
  scrollRef,
}: {
  scrollRef: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Mouse parallax — pointer is normalised -1..1 by R3F.
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.28, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.18, 4, delta);

    // Scroll depth — push the whole array back and up as the user scrolls past.
    const s = scrollRef.current;
    g.position.z = THREE.MathUtils.damp(g.position.z, -s * 2.4, 3, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, s * 0.9, 3, delta);
  });

  return (
    <group ref={group}>
      {PANELS.map((data, i) => (
        <Panel key={data.image} data={data} index={i} />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Lights — architectural gallery                     */
/* -------------------------------------------------------------------------- */

function GalleryLights() {
  return (
    <>
      {/* Soft fill so shadows never crush to black. */}
      <ambientLight intensity={0.55} />

      {/* Key light — casts the crisp directional shadows of a skylit gallery. */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-left={-8}
        shadow-camera-right={8}
      />

      {/* Warm accent (clay) from the left, cool rim from the right. */}
      <pointLight position={[-6, 2, 5]} intensity={28} color="#f0c39a" distance={20} decay={2} />
      <pointLight position={[6, -2, 3]} intensity={16} color="#bcd2ff" distance={18} decay={2} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Canvas wrapper                                 */
/* -------------------------------------------------------------------------- */

export default function MaterialGallery() {
  // 0..1 normalised page-scroll progress, read in useFrame without re-rendering.
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7], fov: 38 }}
      className="!absolute inset-0 h-full w-full"
    >
      <Suspense fallback={null}>
        <GalleryLights />
        <Gallery scrollRef={scrollRef} />

        {/* Grounding soft shadow beneath the floating array. */}
        <ContactShadows
          position={[0, -2.7, 0]}
          opacity={0.34}
          scale={16}
          blur={2.8}
          far={4.5}
          color="#1a1410"
          resolution={512}
        />

        {/* Image-based reflections for that polished-lacquer sheen. */}
        <Environment preset="apartment" />
        <Preload all />
      </Suspense>

      {/* Drop DPR / event rate automatically when the GPU is under load. */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
