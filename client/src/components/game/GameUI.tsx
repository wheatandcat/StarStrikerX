import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGradius } from '@/lib/stores/useGradius';
import { WeaponLevel } from '@/lib/types';

const GameUI = () => {
  const { lives, score, weaponLevel, stageNumber } = useGradius();
  const { size } = useThree();
  
  // Format score with commas
  const formattedScore = useMemo(() => {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [score]);
  
  // Get weapon name based on level
  const weaponName = useMemo(() => {
    switch (weaponLevel) {
      case WeaponLevel.Single:
        return "Single Shot";
      case WeaponLevel.Double:
        return "Double Shot";
      case WeaponLevel.Triple:
        return "Triple Shot";
      case WeaponLevel.Ultimate:
        return "Ultimate";
      default:
        return "Single Shot";
    }
  }, [weaponLevel]);
  
  return (
    <group>
      {/* Score display */}
      <Text
        position={[-9.5, 5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#00aaff"
        font="/fonts/VT323-Regular.ttf"
      >
        {`SCORE: ${formattedScore}`}
      </Text>
      
      {/* Lives display */}
      <Text
        position={[8, 5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ff0000"
      >
        {`LIVES: ${lives}`}
      </Text>
      
      {/* Weapon level display */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#00ff00"
      >
        {`WEAPON: ${weaponName}`}
      </Text>
      
      {/* Stage display */}
      <Text
        position={[-5, 5, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffff00"
      >
        {`STAGE: ${stageNumber}`}
      </Text>
      
      {/* Controls help at bottom */}
      <Text
        position={[0, -5.3, 0]}
        fontSize={0.25}
        color="rgba(255, 255, 255, 0.7)"
        anchorX="center"
        anchorY="middle"
      >
        ARROWS/WASD: MOVE ・ SPACE: SHOOT ・ ESC/P: PAUSE
      </Text>
    </group>
  );
};

export default GameUI;
