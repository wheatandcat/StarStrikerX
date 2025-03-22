import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { EnemyType } from "@/lib/types";
import { getEnemyProperties } from "@/lib/gameUtils";

// Create enemy meshes based on enemy type
const Enemy = ({ enemy }: { enemy: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const type = enemy.type as EnemyType;
  const properties = getEnemyProperties(type);
  
  // Different enemy styles based on type
  let geometry, material;
  
  switch (type) {
    case EnemyType.Small:
      geometry = <octahedronGeometry args={[properties.size / 2, 0]} />;
      material = <meshStandardMaterial color={0xff6666} emissive={0xcc0000} emissiveIntensity={0.5} />;
      break;
      
    case EnemyType.Medium:
      geometry = <dodecahedronGeometry args={[properties.size / 2, 0]} />;
      material = <meshStandardMaterial color={0xff9900} emissive={0xcc6600} emissiveIntensity={0.6} />;
      break;
      
    case EnemyType.Large:
      geometry = <icosahedronGeometry args={[properties.size / 2, 0]} />;
      material = <meshStandardMaterial color={0xcc00cc} emissive={0x990099} emissiveIntensity={0.7} />;
      break;
      
    default:
      geometry = <sphereGeometry args={[properties.size / 2, 8, 8]} />;
      material = <meshStandardMaterial color={0xff0000} />;
  }
  
  // Update mesh position based on enemy position
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update position from the enemy state
    meshRef.current.position.x = enemy.position[0];
    meshRef.current.position.y = enemy.position[1];
    
    // Rotation effect
    meshRef.current.rotation.z += 0.02;
    meshRef.current.rotation.y += 0.01;
  });
  
  return (
    <mesh ref={meshRef} position={[enemy.position[0], enemy.position[1], 0]} castShadow>
      {geometry}
      {material}
      
      {/* Add details based on enemy type */}
      {type === EnemyType.Medium && (
        <group>
          <mesh position={[0, 0, 0.4]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color={0xffcc00} />
          </mesh>
          <pointLight position={[0, 0, 0.6]} color={0xffcc00} intensity={0.5} distance={1.5} />
        </group>
      )}
      
      {type === EnemyType.Large && (
        <group>
          <mesh position={[0, 0, 0.5]}>
            <torusGeometry args={[0.3, 0.05, 16, 16]} />
            <meshStandardMaterial color={0xff00ff} emissive={0xff00ff} emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 0, 0]} color={0xff00ff} intensity={0.8} distance={2} />
        </group>
      )}
    </mesh>
  );
};

const Enemies = () => {
  const { enemies } = useGradius();
  
  return (
    <group>
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
};

export default Enemies;
