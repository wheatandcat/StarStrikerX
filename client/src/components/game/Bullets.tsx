import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { BULLET_SIZE } from "@/lib/constants";

// Create bullet mesh based on whether it's a player or enemy bullet
const Bullet = ({ bullet }: { bullet: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.PointLight>(null);
  
  // Different styles for player and enemy bullets
  const isPlayerBullet = bullet.isPlayerBullet;
  const bulletColor = isPlayerBullet ? 0x00ffff : 0xff4400;
  const bulletSize = BULLET_SIZE * (isPlayerBullet ? 1 : 1.2);
  
  // Update bullet position
  useFrame(() => {
    if (!meshRef.current || !trailRef.current) return;
    
    // Update position from bullet state
    meshRef.current.position.x = bullet.position[0];
    meshRef.current.position.y = bullet.position[1];
    
    // Update trail position
    trailRef.current.position.x = bullet.position[0] - bullet.direction[0] * 0.2;
    trailRef.current.position.y = bullet.position[1] - bullet.direction[1] * 0.2;
    
    // Rotation effect for enemy bullets
    if (!isPlayerBullet) {
      meshRef.current.rotation.z += 0.1;
    }
  });
  
  return (
    <group>
      <mesh ref={meshRef} position={[bullet.position[0], bullet.position[1], 0]}>
        {isPlayerBullet ? (
          <capsuleGeometry args={[bulletSize / 3, bulletSize, 8, 8]} rotation={[0, 0, Math.PI / 2]} />
        ) : (
          <octahedronGeometry args={[bulletSize / 2, 0]} />
        )}
        <meshStandardMaterial 
          color={bulletColor} 
          emissive={bulletColor} 
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Bullet trail light */}
      <pointLight 
        ref={trailRef}
        position={[
          bullet.position[0] - bullet.direction[0] * 0.2,
          bullet.position[1] - bullet.direction[1] * 0.2,
          0
        ]}
        distance={isPlayerBullet ? 1.5 : 1}
        intensity={isPlayerBullet ? 0.7 : 0.5}
        color={isPlayerBullet ? 0x00ffff : 0xff4400}
      />
    </group>
  );
};

const Bullets = () => {
  const { bullets } = useGradius();
  
  return (
    <group>
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </group>
  );
};

export default Bullets;
