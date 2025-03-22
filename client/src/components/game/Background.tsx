import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BACKGROUND_SCROLL_SPEED } from "@/lib/constants";

// R-Type/グラディウス風の宇宙背景
const Background = () => {
  // 星の参照を作成
  const starsRef = useRef<THREE.Group>(null);
  const nebulasRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  
  // 少ない数の星を生成（パフォーマンス向上のため）
  const stars = useMemo(() => {
    const tempStars = [];
    
    // 星の数は少なめに（40個）- グラディウス風
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 20;
      
      // 星のサイズ - 小さめでアーケード風
      const size = Math.random() * 0.06 + 0.02;
      
      // グラディウス風の色彩
      const colors = ["#FFFFFF", "#A1C4FD", "#6A8EAE"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      tempStars.push({ position: [x, y, 0], size, color });
    }
    
    return tempStars;
  }, []);
  
  // R-Type風の星雲/雲
  const nebulas = useMemo(() => {
    const clouds = [];
    
    // 4つの雲を生成 - R-Type風のわずかな色付きエリア
    for (let i = 0; i < 4; i++) {
      const x = (Math.random() - 0.3) * 30;
      const y = (Math.random() - 0.5) * 16;
      
      // 雲のサイズ - かなり大きく
      const width = Math.random() * 10 + 8;
      const height = Math.random() * 6 + 4;
      
      // R-Type風の暗い青/紫の色合い
      const colors = ["#0A1128", "#142850", "#1E3A8A", "#001F54"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      clouds.push({ position: [x, y, -0.8], size: [width, height], color });
    }
    
    return clouds;
  }, []);
  
  // グラディウス風の背景オブジェクト
  const backgroundObjects = useMemo(() => {
    const objects = [];
    
    // グラディウス風の装飾的な形状（6個）
    for (let i = 0; i < 6; i++) {
      const x = (Math.random() - 0.2) * 40;
      const y = (Math.random() - 0.5) * 18;
      
      // サイズはさまざま
      const scale = Math.random() * 0.5 + 0.5;
      
      // 回転は0-360度
      const rotation = Math.random() * Math.PI * 2;
      
      // ランダムな形状タイプ（0-2）
      const type = Math.floor(Math.random() * 3);
      
      objects.push({ position: [x, y, -0.5], scale, rotation, type });
    }
    
    return objects;
  }, []);
  
  // すべての要素をスクロールする
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (starsRef.current) {
      // 星を左にスクロール - グラディウス風
      starsRef.current.children.forEach((starMesh, i) => {
        // スピード変動でパララックス効果
        const speedFactor = 1 + (i % 3) * 0.2;
        starMesh.position.x -= BACKGROUND_SCROLL_SPEED * speedFactor;
        
        // 画面外に出たらリセット
        if (starMesh.position.x < -20) {
          starMesh.position.x = 20;
          starMesh.position.y = (Math.random() - 0.5) * 20;
        }
      });
    }
    
    if (nebulasRef.current) {
      // 星雲をゆっくりスクロール - R-Type風
      nebulasRef.current.children.forEach((nebula, i) => {
        // 深度によってスピードを変える
        nebula.position.x -= BACKGROUND_SCROLL_SPEED * 0.2;
        
        // 画面外に出たら右側に戻す
        if (nebula.position.x < -25) {
          nebula.position.x = 25;
          nebula.position.y = (Math.random() - 0.5) * 16;
        }
      });
    }
    
    // R-Type風の背景グリッドのアニメーション
    if (gridRef.current) {
      // グリッドラインのアニメーション
      const material = gridRef.current.material as THREE.MeshBasicMaterial;
      // 深度によって色の強さを脈動
      material.opacity = 0.05 + Math.sin(time * 0.2) * 0.02;
      // グリッドもスクロール
      gridRef.current.position.x -= BACKGROUND_SCROLL_SPEED * 0.1;
      
      // 一定距離動いたらリセット
      if (gridRef.current.position.x < -1) {
        gridRef.current.position.x = 0;
      }
    }
  });
  
  return (
    <group>
      {/* ダライアス風のグラデーション背景 */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[40, 20]} />
        <meshBasicMaterial>
          <gradientTexture
            attach="map"
            stops={[0, 0.45, 0.55, 1]}
            colors={['#020024', '#090979', '#0A1949', '#020024']}
          />
        </meshBasicMaterial>
      </mesh>
      
      {/* R-Type風の星雲/雲 */}
      <group ref={nebulasRef}>
        {nebulas.map((nebula, i) => (
          <mesh key={i} position={nebula.position as any}>
            <planeGeometry args={nebula.size as [number, number]} />
            <meshBasicMaterial 
              color={nebula.color} 
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      
      {/* グラディウス風の星 */}
      <group ref={starsRef}>
        {stars.map((star, i) => (
          <mesh key={i} position={star.position as any}>
            {/* 星を小さな点としてレンダリング */}
            <planeGeometry args={[star.size, star.size]} />
            <meshBasicMaterial 
              color={star.color} 
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      
      {/* グラディウス/ダライアス風の背景グリッド */}
      <mesh ref={gridRef} position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 20, 12, 6]} />
        <meshBasicMaterial 
          color="#4FC3F7" 
          wireframe 
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* ダライアス風の水平線 - 機械的な雰囲気を表現 */}
      <group>
        {Array.from({ length: 3 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[0, (i - 1) * 5, -0.8]}
          >
            <planeGeometry args={[40, 0.03]} />
            <meshBasicMaterial 
              color="#4FC3F7" 
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      
      {/* グラディウス風の装飾的な背景オブジェクト */}
      <group>
        {backgroundObjects.map((obj, i) => {
          // オブジェクトの形状に基づいてジオメトリを選択
          let geometry;
          if (obj.type === 0) {
            // 六角形
            return (
              <mesh 
                key={i} 
                position={obj.position as any}
                rotation={[0, 0, obj.rotation]}
                scale={[obj.scale, obj.scale, 1]}
              >
                <circleGeometry args={[1, 6]} />
                <meshBasicMaterial 
                  color="#1E3A8A" 
                  transparent
                  opacity={0.2}
                  wireframe
                />
              </mesh>
            );
          } else if (obj.type === 1) {
            // 円形リング
            return (
              <mesh 
                key={i} 
                position={obj.position as any}
              >
                <ringGeometry args={[1 * obj.scale, 1.2 * obj.scale, 16]} />
                <meshBasicMaterial 
                  color="#4FC3F7" 
                  transparent
                  opacity={0.15}
                />
              </mesh>
            );
          } else {
            // 長方形
            return (
              <mesh 
                key={i} 
                position={obj.position as any}
                rotation={[0, 0, obj.rotation]}
              >
                <planeGeometry args={[3 * obj.scale, 0.5 * obj.scale]} />
                <meshBasicMaterial 
                  color="#1E3A8A" 
                  transparent
                  opacity={0.2}
                />
              </mesh>
            );
          }
        })}
      </group>
    </group>
  );
};

export default Background;
