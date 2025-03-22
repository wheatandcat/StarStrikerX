import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGradius } from "@/lib/stores/useGradius";
import { PLAYER_SIZE } from "@/lib/constants";

// レトロな2Dスタイルのプレイヤー
const Player = () => {
  const { playerPosition, isPlayerInvulnerable, weaponLevel } = useGradius();
  const playerRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Mesh>(null);
  
  // For blinking when invulnerable
  useFrame((state) => {
    if (!playerRef.current) return;
    
    // Position the player
    playerRef.current.position.x = playerPosition[0];
    playerRef.current.position.y = playerPosition[1];
    
    // Blinking effect when invulnerable
    if (isPlayerInvulnerable) {
      const blinkRate = Math.sin(state.clock.getElapsedTime() * 10);
      playerRef.current.visible = blinkRate > 0;
    } else {
      playerRef.current.visible = true;
    }
    
    // エンジン排気アニメーション
    if (engineRef.current) {
      // エンジン炎のサイズを脈動させる
      const pulseSize = 0.8 + Math.sin(state.clock.getElapsedTime() * 15) * 0.2;
      engineRef.current.scale.x = pulseSize;
      
      // エンジン色も変化させる
      const engineMaterial = engineRef.current.material as THREE.MeshBasicMaterial;
      engineMaterial.color.setHSL(
        0.05 + Math.sin(state.clock.getElapsedTime() * 10) * 0.05, // わずかに色相変化
        0.8, // 高い彩度
        0.6  // 明るさ
      );
    }
    
    // 船体の微妙な傾き
    playerRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
  });
  
  // Weapon level indicator color
  const weaponLevelColor = useMemo(() => {
    switch (weaponLevel) {
      case 0: return "#66ccff"; // Level 1 - Blue
      case 1: return "#66ff66"; // Level 2 - Green
      case 2: return "#ffcc00"; // Level 3 - Gold
      case 3: return "#ff3333"; // Level 4 - Red
      default: return "#66ccff";
    }
  }, [weaponLevel]);
  
  return (
    <group
      ref={playerRef}
      position={[playerPosition[0], playerPosition[1], 0]}
      rotation={[0, 0, 0]}
    >
      {/* レトロスタイルの宇宙船 - 単純な2D形状 */}
      <group scale={[PLAYER_SIZE * 1.5, PLAYER_SIZE * 1.5, 1]}>
        {/* メインボディ - 三角形 */}
        <mesh>
          <planeGeometry args={[1, 0.5]} />
          <meshBasicMaterial color="#4477FF" />
        </mesh>
        
        {/* コックピット部分 - 小さな丸 */}
        <mesh position={[0.3, 0, 0.01]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial color="#8899FF" />
        </mesh>
        
        {/* ウィング - 上 */}
        <mesh position={[-0.2, 0.3, 0]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#2244AA" />
        </mesh>
        
        {/* ウィング - 下 */}
        <mesh position={[-0.2, -0.3, 0]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#2244AA" />
        </mesh>
        
        {/* エンジン排気 - アニメーション付き */}
        <mesh ref={engineRef} position={[-0.6, 0, 0]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshBasicMaterial 
            color="#FF6600" 
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      </group>
      
      {/* 武器レベルインジケーター - レトロスタイル */}
      <group position={[0, 0.6, 0.01]}>
        {/* 基本の枠 */}
        <mesh>
          <planeGeometry args={[0.6, 0.15]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        {/* 武器レベル表示 - 現在のレベルに応じて拡大 */}
        <mesh position={[0, 0, 0.01]} scale={[(weaponLevel + 1) / 4, 1, 1]}>
          <planeGeometry args={[0.55, 0.1]} />
          <meshBasicMaterial color={weaponLevelColor} />
        </mesh>
      </group>
      
      {/* 無敵時のシールドエフェクト - 単純な円で表現 */}
      {isPlayerInvulnerable && (
        <mesh>
          <circleGeometry args={[PLAYER_SIZE * 1.2, 16]} />
          <meshBasicMaterial 
            color="#4488ff"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

export default Player;
