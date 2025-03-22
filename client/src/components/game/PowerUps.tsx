import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useGradius } from "@/lib/stores/useGradius";
import { PowerUpType } from "@/lib/types";
import { POWERUP_SIZE } from "@/lib/constants";

const PowerUp = ({ powerUp }: { powerUp: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  // Different styles for different power-up types
  let color = 0xffff00; // Default yellow
  let label = "W";
  
  if (powerUp.type === PowerUpType.WeaponUpgrade) {
    color = 0x00ffaa;
    label = "W";
  }
  
  // Update power-up position and add hover/rotation effects
  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    
    // Update position from power-up state
    meshRef.current.position.x = powerUp.position[0];
    meshRef.current.position.y = powerUp.position[1];
    
    // Update glow position
    glowRef.current.position.x = powerUp.position[0];
    glowRef.current.position.y = powerUp.position[1];
    
    // Hover effect
    meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 4) * 0.01;
    
    // Rotation effect
    meshRef.current.rotation.z += 0.02;
  });
  
  return (
    <group>
      <mesh 
        ref={meshRef} 
        position={[powerUp.position[0], powerUp.position[1], 0]}
        castShadow
      >
        <boxGeometry args={[POWERUP_SIZE, POWERUP_SIZE, POWERUP_SIZE / 2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
        
        {/* Label */}
        <Text
          position={[0, 0, 0.2]}
          rotation={[0, 0, 0]}
          fontSize={POWERUP_SIZE * 0.6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK0nS.woff"
        >
          {label}
        </Text>
      </mesh>
      
      {/* Glow effect */}
      <pointLight 
        ref={glowRef}
        position={[powerUp.position[0], powerUp.position[1], 0]} 
        color={color} 
        intensity={1} 
        distance={2}
      />
    </group>
  );
};

const PowerUps = () => {
  const { powerUps } = useGradius();
  
  return (
    <group>
      {powerUps.map((powerUp) => (
        <PowerUp key={powerUp.id} powerUp={powerUp} />
      ))}
    </group>
  );
};

export default PowerUps;
