import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import type { SceneItem } from "@/src/domain/types";
import { PRODUCT_COLORS } from "@/src/world/product-visuals";
import { ANCHOR_BY_ID } from "@/src/world/anchors";

type SceneProductProps = {
  item: SceneItem;
  selected: boolean;
  onSelect: () => void;
  onPointerDrag: () => void;
};

function ProductGeometry({ item }: { item: SceneItem }) {
  const color = PRODUCT_COLORS[item.variant.role];
  if (item.variant.role === "lamp") {
    return (
      <group>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 0.12, 24]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 1.05, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.16, 1.12, 0]} rotation={[0, 0, -0.38]} castShadow>
          <coneGeometry args={[0.34, 0.48, 24, 1, true]} />
          <meshStandardMaterial color={color} side={2} />
        </mesh>
      </group>
    );
  }
  if (item.variant.role === "display") {
    return (
      <group>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[1.5, 0.9, 0.12]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.12, 0.35, 0.12]} />
          <meshStandardMaterial color="#75533f" />
        </mesh>
        <mesh position={[0, 0.02, 0.08]} castShadow>
          <boxGeometry args={[0.7, 0.08, 0.35]} />
          <meshStandardMaterial color="#75533f" />
        </mesh>
      </group>
    );
  }
  if (item.variant.role === "input") {
    return (
      <mesh position={[0, 0.08, 0]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[1.25, 0.12, 0.48]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  if (item.variant.role === "audio") {
    return (
      <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.48, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  if (item.variant.role === "organization") {
    return (
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.75, 0.14, 0.55]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.3, 20]} />
        <meshStandardMaterial color="#b66f45" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.34, 20, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function SceneProduct({
  item,
  selected,
  onSelect,
  onPointerDrag,
}: SceneProductProps) {
  const start = useRef<Vector3 | null>(null);
  const anchor = ANCHOR_BY_ID.get(item.anchorId);
  if (!anchor) return null;

  function pointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (event.nativeEvent.target instanceof Element) {
      event.nativeEvent.target.setPointerCapture(event.pointerId);
    }
    start.current = event.point.clone();
    onSelect();
  }

  function pointerUp(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (start.current && start.current.distanceTo(event.point) > 0.18) onPointerDrag();
    if (event.nativeEvent.target instanceof Element) {
      event.nativeEvent.target.releasePointerCapture(event.pointerId);
    }
    start.current = null;
  }

  return (
    <group
      position={anchor.position}
      scale={selected ? 1.08 : 1}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
    >
      <ProductGeometry item={item} />
      {selected ? (
        <mesh position={[0, 1.45, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshStandardMaterial color="#fff6dd" emissive="#ff7a1a" emissiveIntensity={1} />
        </mesh>
      ) : null}
      {item.locked ? (
        <mesh position={[0.32, 1.22, 0]}>
          <torusGeometry args={[0.13, 0.04, 10, 20]} />
          <meshStandardMaterial color="#ffb347" />
        </mesh>
      ) : null}
    </group>
  );
}
