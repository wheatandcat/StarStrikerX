import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BACKGROUND_SCROLL_SPEED } from "@/lib/constants";

// 最適化したレトロスタイルの背景
const Background = () => {
  // 星の参照を作成
  const starsRef = useRef<THREE.Group>(null);
  const starFieldRef = useRef<THREE.Points>(null);
  
  // 少ない数の星を生成（パフォーマンス向上のため）
  const stars = useMemo(() => {
    const tempStars = [];
    
    // 星の数を削減（60個に）
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 20;
      
      // 星のサイズ
      const size = Math.random() * 0.1 + 0.05;
      
      // 単純な色のみ使用
      const colors = ["#FFFFFF", "#CCCCFF", "#AAAAFF"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      tempStars.push({ position: [x, y, 0], size, color });
    }
    
    return tempStars;
  }, []);
  
  // 星をスクロールする
  useFrame(() => {
    if (starsRef.current) {
      // 星を左にスクロール
      starsRef.current.children.forEach((starMesh, i) => {
        // 一定速度で移動
        starMesh.position.x -= BACKGROUND_SCROLL_SPEED;
        
        // 画面外に出たらリセット
        if (starMesh.position.x < -20) {
          starMesh.position.x = 20;
          starMesh.position.y = (Math.random() - 0.5) * 20;
        }
      });
    }
    
    // 星空全体もスクロール
    if (starFieldRef.current) {
      starFieldRef.current.position.x -= BACKGROUND_SCROLL_SPEED * 0.2;
      
      // 一定の位置でリセット
      if (starFieldRef.current.position.x < -20) {
        starFieldRef.current.position.x = 0;
      }
    }
  });
  
  return (
    <group>
      {/* シンプルな背景 - 暗い宇宙 */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[40, 20]} />
        <meshBasicMaterial color="#050418" />
      </mesh>
      
      {/* 星 - 小さな四角形として表現 */}
      <group ref={starsRef}>
        {stars.map((star, i) => (
          <mesh key={i} position={star.position as any}>
            <planeGeometry args={[star.size, star.size]} />
            <meshBasicMaterial color={star.color} />
          </mesh>
        ))}
      </group>
      
      {/* 星空の背景 - ポイントで表現 */}
      <points ref={starFieldRef} position={[0, 0, -0.5]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={(() => {
              const arr = new Float32Array(200 * 3);
              for (let i = 0; i < 200; i++) {
                arr[i * 3] = (Math.random() - 0.5) * 40; // x
                arr[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
                arr[i * 3 + 2] = 0; // z
              }
              return arr;
            })()}
            count={200}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#AAAAFF" sizeAttenuation={false} />
      </points>
      
      {/* シンプルなスクロールラインパターン */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (i % 4) * 10 - 15, 
            i < 4 ? 8 : -8, 
            -0.3
          ]}
        >
          <planeGeometry args={[8, 0.05]} />
          <meshBasicMaterial 
            color="#334466" 
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
      
      {/* レトロなグリッドのエフェクト */}
      <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 20, 4, 4]} />
        <meshBasicMaterial 
          color="#1133AA" 
          wireframe 
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

export default Background;
