import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BACKGROUND_SCROLL_SPEED, STAR_COUNT } from "@/lib/constants";

const Background = () => {
  // Create a reference for the stars group
  const starsRef = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Group>(null); // Changed from Mesh to Group
  
  // Generate random stars
  const stars = useMemo(() => {
    const tempStars = [];
    
    for (let i = 0; i < STAR_COUNT; i++) {
      // Generate random positions in a large area
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.3) * 10 - 5; // More stars in the background
      
      // Random star size
      const size = Math.random() * 0.05 + 0.02;
      
      // Star color
      const colors = [0xffffff, 0xccccff, 0xaaaaff, 0xffffcc];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      tempStars.push({ position: [x, y, z], size, color });
    }
    
    return tempStars;
  }, []);
  
  // Create nebula clouds
  const nebulaClouds = useMemo(() => {
    const clouds = [];
    
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * 30 + 10;
      const y = (Math.random() - 0.5) * 15;
      const scale = Math.random() * 4 + 3;
      
      // Nebula colors
      const colors = [0x3311aa, 0x442288, 0x330066];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      clouds.push({ position: [x, y, -10], scale, color });
    }
    
    return clouds;
  }, []);
  
  // Scroll the background
  useFrame(({ clock }) => {
    if (starsRef.current) {
      // Move stars to create scrolling effect
      starsRef.current.children.forEach((starMesh, i) => {
        // Move stars leftward
        starMesh.position.x -= BACKGROUND_SCROLL_SPEED * (1 + stars[i].position[2] * 0.1);
        
        // Reset star position when it moves out of view
        if (starMesh.position.x < -20) {
          starMesh.position.x = 20;
          starMesh.position.y = (Math.random() - 0.5) * 20;
        }
        
        // Twinkle effect
        if (i % 5 === 0) {
          const twinkle = Math.sin(clock.getElapsedTime() * (2 + i % 3) + i) * 0.3 + 0.7;
          (starMesh as THREE.Mesh).scale.set(twinkle, twinkle, twinkle);
        }
      });
    }
    
    if (nebulaRef.current) {
      // Slowly move nebula to create depth
      nebulaRef.current.position.x -= BACKGROUND_SCROLL_SPEED * 0.2;
      
      // Reset nebula position when it moves out of view
      if (nebulaRef.current.position.x < -30) {
        nebulaRef.current.position.x = 30;
      }
    }
  });
  
  return (
    <group>
      {/* Base skybox - dark space gradient */}
      <mesh position={[0, 0, -20]}>
        <planeGeometry args={[100, 60]} />
        <meshBasicMaterial color="#050418" />
      </mesh>
      
      {/* Stars */}
      <group ref={starsRef}>
        {stars.map((star, i) => (
          <mesh key={i} position={star.position as any}>
            <sphereGeometry args={[star.size, 8, 8]} />
            <meshBasicMaterial color={star.color} />
          </mesh>
        ))}
      </group>
      
      {/* Nebula clouds */}
      <group ref={nebulaRef}>
        {nebulaClouds.map((cloud, i) => (
          <mesh key={i} position={cloud.position as any}>
            <sphereGeometry args={[cloud.scale, 16, 16]} />
            <meshBasicMaterial 
              color={cloud.color} 
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      {/* Distant stars (don't move) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(300 * 3).map(() => (Math.random() - 0.5) * 100)}
            count={300}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color={0xaaaaff} sizeAttenuation={false} />
      </points>
      
      {/* Colored space dust */}
      <points position={[0, 0, -15]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(200 * 3).map(() => (Math.random() - 0.5) * 50)}
            count={200}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={new Float32Array(200 * 3).map(() => Math.random() * 0.3 + 0.1)}
            count={200}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.2} 
          vertexColors 
          transparent
          opacity={0.6}
        />
      </points>
      
      {/* Distant galaxy */}
      <mesh position={[15, 8, -18]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial 
          color="#442266" 
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.05} color="#3355ff" />
    </group>
  );
};

export default Background;
