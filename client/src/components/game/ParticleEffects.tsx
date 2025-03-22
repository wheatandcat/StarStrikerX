import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ParticleEffects = () => {
  // Reference for particle system
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particles geometry
  const particleCount = 100;
  
  // Particle attributes
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5;
      
      // Random particle speed
      const vx = -Math.random() * 0.02 - 0.01;
      const vy = (Math.random() - 0.5) * 0.01;
      
      // Random size
      const size = Math.random() * 0.1 + 0.05;
      
      // Random particle color
      const colors = [0x3366ff, 0x00aaff, 0x66ccff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random lifetime
      const lifetime = Math.random() * 100 + 100;
      
      temp.push({
        position: [x, y, z],
        velocity: [vx, vy, 0],
        size,
        color,
        lifetime,
        age: Math.random() * lifetime // Start at random age
      });
    }
    return temp;
  }, []);
  
  // Create buffer geometry and point cloud
  const [positions, sizes, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const particle = particles[i];
      
      positions[i3] = particle.position[0];
      positions[i3 + 1] = particle.position[1];
      positions[i3 + 2] = particle.position[2];
      
      sizes[i] = particle.size;
      
      const color = new THREE.Color(particle.color);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    return [positions, sizes, colors];
  }, [particles]);
  
  // Update particles
  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const particle = particles[i];
      
      // Update particle age
      particle.age += 1;
      
      // Reset particle if it's beyond its lifetime or out of bounds
      if (particle.age >= particle.lifetime || positions[i3] < -12) {
        positions[i3] = 12 + Math.random() * 2; // Respawn on the right
        positions[i3 + 1] = (Math.random() - 0.5) * 10;
        positions[i3 + 2] = (Math.random() - 0.5) * 5;
        
        particle.age = 0;
      } else {
        // Update position based on velocity
        positions[i3] += particle.velocity[0];
        positions[i3 + 1] += particle.velocity[1];
        positions[i3 + 2] += particle.velocity[2];
      }
      
      // Fade out particle as it ages
      const fadeRatio = 1 - particle.age / particle.lifetime;
      sizes[i] = particle.size * fadeRatio;
    }
    
    // Update buffer attributes
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.size.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation={true}
        vertexColors
        transparent
        alphaTest={0.01}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleEffects;
