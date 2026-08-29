"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { SceneItem } from "@/src/domain/types";
import { DeskEnvironment } from "@/src/world/DeskEnvironment";
import { SceneProduct } from "@/src/world/SceneProduct";

export function DeskCanvas({
  items,
  selectedItemId,
  onSelect,
  onPointerDrag,
}: {
  items: SceneItem[];
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
  onPointerDrag: (itemId: string) => void;
}) {
  return (
    <div
      className="world-canvas"
      role="img"
      aria-label="Isometric miniature desk with directly manipulable products"
    >
      <Canvas shadows camera={{ position: [5.8, 4.2, 6.2], fov: 38 }}>
        <color attach="background" args={["#e8eee7"]} />
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 7, 5]} intensity={2.2} castShadow />
        <DeskEnvironment />
        {items.map((item) => (
          <SceneProduct
            key={item.id}
            item={item}
            selected={item.id === selectedItemId}
            onSelect={() => onSelect(item.id)}
            onPointerDrag={() => onPointerDrag(item.id)}
          />
        ))}
        <OrbitControls
          target={[0, 0.25, 0]}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={-Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
