import { useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useGradius } from "@/lib/stores/useGradius";
import { PowerUpType } from "@/lib/types";
import { POWERUP_SIZE } from "@/lib/constants";

// Preload the powerup model
useGLTF.preload('/models/powerup.glb');

const PowerUp = ({ powerUp }: { powerUp: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load power-up model
  const { scene: powerupModel } = useGLTF('/models/powerup.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Update model loaded state
  useEffect(() => {
    if (powerupModel) {
      setModelLoaded(true);
      console.log("Power-up model loaded successfully");
    }
  }, [powerupModel]);
  
  // Different styles for different power-up types
  let color = 0xffff00; // Default yellow
  let label = "W";
  
  if (powerUp.type === PowerUpType.WeaponUpgrade) {
    color = 0x00ffaa;
    label = "W";
  }
  
  // Update power-up position and add hover/rotation effects
  useFrame(({ clock }) => {
    if (!groupRef.current || !glowRef.current) return;
    
    // Update position from power-up state
    groupRef.current.position.x = powerUp.position[0];
    groupRef.current.position.y = powerUp.position[1];
    
    // Update glow position
    glowRef.current.position.x = powerUp.position[0];
    glowRef.current.position.y = powerUp.position[1];
    
    // Hover effect
    groupRef.current.position.y += Math.sin(clock.getElapsedTime() * 4) * 0.01;
    
    // Rotation effect
    groupRef.current.rotation.z += 0.02;
  });
  
  return (
    <group>
      <group 
        ref={groupRef} 
        position={[powerUp.position[0], powerUp.position[1], 0]}
        scale={[POWERUP_SIZE * 2.5, POWERUP_SIZE * 2.5, POWERUP_SIZE * 2.5]}
        rotation={[0, 0, 0]}
      >
        {/* 3Dモデルのパワーアップ */}
        {modelLoaded ? (
          <Suspense fallback={
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.5, 0.25]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.5}
              />
            </mesh>
          }>
            <primitive object={powerupModel.clone()} castShadow receiveShadow />
          </Suspense>
        ) : (
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.25]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
        
        {/* パワーアップタイプのラベル */}
        <Text
          position={[0, 0, 0.5]}
          rotation={[0, 0, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="monospace"
        >
          {label}
        </Text>
      </group>
      
      {/* Glow effect */}
      <pointLight 
        ref={glowRef}
        position={[powerUp.position[0], powerUp.position[1], 0]} 
        color={color} 
        intensity={1.5} 
        distance={3}
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
