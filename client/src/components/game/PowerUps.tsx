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
    if (!glowRef.current || !groupRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Update glow position directly
    glowRef.current.position.x = powerUp.position[0];
    glowRef.current.position.y = powerUp.position[1];
    
    // Add pulsing effect to the glow
    const pulseIntensity = 1.8 + Math.sin(time * 4) * 0.4;
    if (glowRef.current) {
      glowRef.current.intensity = pulseIntensity;
    }
    
    // Add rotation and hover animations to the model
    if (groupRef.current) {
      // Slow rotation
      groupRef.current.rotation.y = time * 0.5;
      // Additional subtle rotation in other axes
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Hover effect
      const hoverOffset = Math.sin(time * 3) * 0.05;
      groupRef.current.position.y = powerUp.position[1] + hoverOffset;
      
      // Subtle scale pulsing
      const scalePulse = 1.0 + Math.sin(time * 2) * 0.03;
      groupRef.current.scale.set(
        POWERUP_SIZE * 2.5 * scalePulse,
        POWERUP_SIZE * 2.5 * scalePulse,
        POWERUP_SIZE * 2.5 * scalePulse
      );
    }
  });
  
  return (
    <group>
      <group 
        ref={groupRef} 
        position={[powerUp.position[0], powerUp.position[1], 0]}
        scale={[POWERUP_SIZE * 2.5, POWERUP_SIZE * 2.5, POWERUP_SIZE * 2.5]}
        rotation={[0, 0, 0]}
      >
        {/* 3D model power-up with enhanced effects */}
        {modelLoaded ? (
          <Suspense fallback={
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.5, 0.25]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.8}
              />
            </mesh>
          }>
            {/* Main 3D model */}
            <primitive object={powerupModel.clone()} castShadow receiveShadow />
            
            {/* Energy field effect around the power-up */}
            <mesh scale={[1.1, 1.1, 1.1]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.6}
                transparent={true}
                opacity={0.3}
              />
            </mesh>
          </Suspense>
        ) : (
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.25]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.8}
            />
          </mesh>
        )}
        
        {/* Power-up type label with improved visibility */}
        <Text
          position={[0, 0, 0.5]}
          rotation={[0, 0, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </group>
      
      {/* Enhanced glow effect with pulsing */}
      <pointLight 
        ref={glowRef}
        position={[powerUp.position[0], powerUp.position[1], 0]} 
        color={color} 
        intensity={1.8} 
        distance={4}
      />
      
      {/* Secondary subtle light for added dimension */}
      <pointLight 
        position={[powerUp.position[0], powerUp.position[1], 0.5]} 
        color={0xffffff} 
        intensity={0.5} 
        distance={1}
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
