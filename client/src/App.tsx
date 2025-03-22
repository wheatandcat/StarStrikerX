import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Level from "./components/game/Level";
import { Controls } from "./lib/types";
import StartScreen from "./components/ui/StartScreen";
import GameOverScreen from "./components/ui/GameOverScreen";
import StageClearScreen from "./components/ui/StageClearScreen";
import LeaderboardModal from "./components/ui/LeaderboardModal";
import { useGradius } from "./lib/stores/useGradius";
// Removed inter font import in favor of using the pixel-font class

// Define control keys for the game
const keyboardMap = [
  { name: Controls.up, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.down, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.shoot, keys: ["Space"] },
  { name: Controls.pause, keys: ["KeyP", "Escape"] },
];

// Main App component
function App() {
  const { 
    gamePhase, 
    score, 
    lives, 
    playerName, 
    setPlayerName,
    startGame, 
    restartGame,
    continueToNextStage,
    showLeaderboard,
    setShowLeaderboard 
  } = useGradius();
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);
  const { toggleMute, isMuted, setBackgroundMusic } = useAudio();

  // Load and setup audio
  useEffect(() => {
    const music = new Audio("/sounds/background.mp3");
    music.loop = true;
    music.volume = 0.5;
    setBgMusic(music);
    setBackgroundMusic(music);
    
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.3;
    
    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.5;
    
    return () => {
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
    };
  }, [setBackgroundMusic]);
  
  // Play background music when game starts
  useEffect(() => {
    if (bgMusic && gamePhase === "playing" && !isMuted) {
      bgMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    } else if (bgMusic && gamePhase !== "playing") {
      bgMusic.pause();
    }
  }, [bgMusic, gamePhase, isMuted]);

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardControls map={keyboardMap}>
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
          <button 
            onClick={toggleMute} 
            className="absolute top-4 right-4 z-50 px-3 py-2 bg-gray-800 text-white rounded-full pixel-font"
            style={{ fontSize: '12px' }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          
          {/* Game Canvas */}
          <Canvas
            shadows
            camera={{
              position: [0, 0, 15],
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              alpha: true
            }}
          >
            <color attach="background" args={["#000022"]} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1}
              castShadow
            />
            
            <Suspense fallback={null}>
              {gamePhase === "playing" && <Level />}
            </Suspense>
          </Canvas>
          
          {/* UI Overlays */}
          {gamePhase === "menu" && (
            <StartScreen 
              onStart={startGame} 
              playerName={playerName}
              setPlayerName={setPlayerName}
              onLeaderboard={() => setShowLeaderboard(true)} 
            />
          )}
          
          {gamePhase === "gameOver" && (
            <GameOverScreen 
              score={score} 
              onRestart={restartGame} 
              onLeaderboard={() => setShowLeaderboard(true)} 
            />
          )}
          
          {gamePhase === "stageClear" && (
            <StageClearScreen 
              score={score} 
              onContinue={continueToNextStage} 
            />
          )}
          
          {showLeaderboard && (
            <LeaderboardModal 
              onClose={() => setShowLeaderboard(false)} 
              currentScore={score}
              playerName={playerName}
            />
          )}
        </div>
      </KeyboardControls>
    </QueryClientProvider>
  );
}

export default App;
