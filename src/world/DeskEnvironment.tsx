export function DeskEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.28, 2.8]} />
        <meshStandardMaterial color="#b77b52" roughness={0.75} />
      </mesh>
      {[
        [-2.15, -1.35, -0.95],
        [2.15, -1.35, -0.95],
        [-2.15, -1.35, 0.95],
        [2.15, -1.35, 0.95],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow>
          <boxGeometry args={[0.24, 2.45, 0.24]} />
          <meshStandardMaterial color="#70452f" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, -1.7, 0]} receiveShadow>
        <planeGeometry args={[13, 9]} />
        <meshStandardMaterial color="#dbe4db" roughness={1} />
      </mesh>
    </group>
  );
}
