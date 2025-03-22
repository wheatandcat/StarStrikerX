import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
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
      <Html
        position={[-9.5, 5, 0]}
        wrapperClass="game-ui-element"
        center
        distanceFactor={10}
      >
        <div style={{
          color: 'white',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '16px',
          whiteSpace: 'nowrap',
          textShadow: '0 0 5px #00ffff, 0 0 10px #00aaff'
        }}>
          SCORE: {formattedScore}
        </div>
      </Html>
      
      {/* Lives display */}
      <Html
        position={[8, 5, 0]}
        wrapperClass="game-ui-element"
        center
        distanceFactor={10}
      >
        <div style={{
          color: 'white',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '16px',
          whiteSpace: 'nowrap',
          textShadow: '0 0 5px #ff5555, 0 0 10px #ff0000'
        }}>
          LIVES: {lives}
        </div>
      </Html>
      
      {/* Weapon level display */}
      <Html
        position={[0, 5, 0]}
        wrapperClass="game-ui-element"
        center
        distanceFactor={10}
      >
        <div style={{
          color: 'white',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '14px',
          whiteSpace: 'nowrap',
          textShadow: '0 0 5px #88ff88, 0 0 10px #00ff00'
        }}>
          WEAPON: {weaponName}
        </div>
      </Html>
      
      {/* Stage display */}
      <Html
        position={[-5, 5, 0]}
        wrapperClass="game-ui-element"
        center
        distanceFactor={10}
      >
        <div style={{
          color: 'white',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '14px',
          whiteSpace: 'nowrap',
          textShadow: '0 0 5px #ffff88, 0 0 10px #ffff00'
        }}>
          STAGE: {stageNumber}
        </div>
      </Html>
      
      {/* Controls help at bottom */}
      <Html
        position={[0, -5.3, 0]}
        wrapperClass="game-ui-element"
        center
        distanceFactor={10}
      >
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '10px',
          whiteSpace: 'nowrap',
        }}>
          ARROWS/WASD: MOVE ・ SPACE: SHOOT ・ ESC/P: PAUSE
        </div>
      </Html>
    </group>
  );
};

export default GameUI;
