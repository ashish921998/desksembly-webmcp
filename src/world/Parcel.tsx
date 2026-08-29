import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import type { ParcelVisual } from "@/src/world/animation/WorldAnimationController";
import { ANCHOR_BY_ID } from "@/src/world/anchors";

export function Parcel({ parcel }: { parcel: ParcelVisual }) {
  const group = useRef<Group>(null);
  const lid = useRef<Mesh>(null);
  const anchor = ANCHOR_BY_ID.get(parcel.item.anchorId);

  useFrame((_, delta) => {
    if (!group.current || !anchor) return;
    const returning = parcel.item.status === "returning";
    const target = returning
      ? parcel.status === "arriving" || parcel.status === "opening"
        ? [anchor.position[0], 0.35, anchor.position[2]]
        : [3.4, 1.8, 1.8]
      : parcel.status === "arriving"
        ? [3.4, 1.8, 1.8]
        : parcel.status === "opening"
          ? [anchor.position[0], 0.55, anchor.position[2]]
          : [anchor.position[0], 0.18, anchor.position[2]];
    group.current.position.x += (target[0] - group.current.position.x) * Math.min(1, delta * 7);
    group.current.position.y += (target[1] - group.current.position.y) * Math.min(1, delta * 7);
    group.current.position.z += (target[2] - group.current.position.z) * Math.min(1, delta * 7);
    if (lid.current) {
      const open = parcel.status === "opening" || parcel.status === "revealed" ? -1.3 : 0;
      lid.current.rotation.x += (open - lid.current.rotation.x) * Math.min(1, delta * 9);
    }
  });

  return (
    <group ref={group} position={[3.4, 1.8, 1.8]}>
      <mesh castShadow>
        <boxGeometry args={[0.75, 0.48, 0.62]} />
        <meshStandardMaterial
          color={
            parcel.item.status === "returning"
              ? "#b97862"
              : parcel.status === "placing"
                ? "#d7eadc"
                : "#d39a63"
          }
          transparent={parcel.status === "placing"}
          opacity={parcel.status === "placing" ? 0.45 : 1}
        />
      </mesh>
      <mesh ref={lid} position={[0, 0.27, -0.29]} castShadow>
        <boxGeometry args={[0.78, 0.05, 0.64]} />
        <meshStandardMaterial color="#b97845" />
      </mesh>
      <Html center position={[0, 0.7, 0]}>
        <span className="parcel-label">
          {parcel.item.variant.title} · {parcel.status}
        </span>
      </Html>
    </group>
  );
}
