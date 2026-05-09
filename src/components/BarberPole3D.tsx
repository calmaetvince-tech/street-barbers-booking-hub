import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// New brand stripe palette.
const RED = "#C8161E";
const WHITE = "#F8F8FF";
const BLUE = "#2540F0";

function makeStripeTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, size, size);

  // Diagonal stripes ~35deg, pattern: Red, White, Blue, White, Red, White
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((35 * Math.PI) / 180);
  ctx.translate(-size, -size);
  const colors = [RED, WHITE, BLUE, WHITE, RED, WHITE];
  const stripeH = size / 12;
  for (let y = -size; y < size * 3; y += stripeH) {
    ctx.fillStyle = colors[Math.floor((y + size) / stripeH) % colors.length];
    ctx.fillRect(0, y, size * 2, stripeH);
  }
  ctx.restore();

  // Fake specular shading: darker at edges, brighter in center.
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function makeCapTexture() {
  const w = 256;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#3a3a3a");
  grad.addColorStop(0.45, "#d8d8d8");
  grad.addColorStop(0.55, "#eaeaea");
  grad.addColorStop(1, "#2a2a2a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#000" : "#fff";
    ctx.fillRect(0, Math.random() * h, w, 1);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

const ROT_SPEED = (Math.PI * 2) / 10;

function Pole({ animate }: { animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => makeStripeTexture(), []);
  const capTexture = useMemo(() => makeCapTexture(), []);

  useFrame((_, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 0.05);
    if (groupRef.current) groupRef.current.rotation.y += ROT_SPEED * d;
    texture.offset.y -= d * 0.18;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 64]} />
        <meshStandardMaterial map={texture} metalness={0.55} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.401]}>
        <planeGeometry args={[0.12, 1.55]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.875, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 0.18, 48]} />
        <meshStandardMaterial map={capTexture} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.77, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -0.875, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.18, 48]} />
        <meshStandardMaterial map={capTexture} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.77, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

const BarberPole3D = () => {
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h1 = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h1);

    const mqM = window.matchMedia("(max-width: 767px)");
    setIsMobile(mqM.matches);
    const h2 = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqM.addEventListener("change", h2);

    return () => {
      mq.removeEventListener("change", h1);
      mqM.removeEventListener("change", h2);
    };
  }, []);

  const w = isMobile ? 24 : 32;
  const h = isMobile ? 42 : 56;

  return (
    <div style={{ width: w, height: h, willChange: "transform" }} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        camera={{ fov: 35, position: [0, 0, 4] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 2, 3]} intensity={0.9} />
        <directionalLight position={[-2, -1, 2]} intensity={0.35} color="#a8814a" />
        <Pole animate={!reduced} />
      </Canvas>
    </div>
  );
};

export default BarberPole3D;
