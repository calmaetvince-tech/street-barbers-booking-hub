import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeStripeTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Diagonal stripes ~30deg via rotation
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((30 * Math.PI) / 180);
  ctx.translate(-size, -size);
  const colors = ["#c1272d", "#f5f5f5", "#1a3a8a"];
  const stripeH = size / 6;
  for (let y = 0; y < size * 2; y += stripeH) {
    ctx.fillStyle = colors[Math.floor(y / stripeH) % 3];
    ctx.fillRect(0, y, size * 2, stripeH);
  }
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = 4;
  return tex;
}

function Pole({ animate }: { animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => makeStripeTexture(), []);

  useFrame(() => {
    if (!animate) return;
    if (groupRef.current) groupRef.current.rotation.y += 0.005;
    texture.offset.y -= 0.01;
  });

  return (
    <group ref={groupRef}>
      {/* Pole body */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 32]} />
        <meshStandardMaterial map={texture} metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.875, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 32]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -0.875, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 32]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

const BarberPole3D = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div style={{ width: 32, height: 56 }} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        camera={{ fov: 35, position: [0, 0, 4] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 3]} intensity={0.8} />
        <Pole animate={!reduced} />
      </Canvas>
    </div>
  );
};

export default BarberPole3D;
