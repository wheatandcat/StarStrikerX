import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface StartScreenProps {
  onStart: () => void;
  onLeaderboard: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

const StartScreen = ({ onStart, onLeaderboard, playerName, setPlayerName }: StartScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Animation effect for title
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) { // Limit name length
      setPlayerName(value);
    }
  };
  
  // Handle start button click
  const handleStart = () => {
    if (playerName.trim()) {
      onStart();
    }
  };
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(to bottom, #000033, #000022)",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(20, 30, 80, 0.2) 0%, rgba(0, 0, 25, 0.4) 100%)"
      }}
    >
      <div className="w-full max-w-md mx-4">
        <Card className="border-2 border-blue-500 bg-gray-900 text-white shadow-lg shadow-blue-500/20">
          <CardHeader className="text-center pb-2">
            <CardTitle 
              className={`text-4xl font-bold mb-2 pixel-font ${isAnimating ? 'text-blue-400' : 'text-blue-300'}`}
              style={{ 
                textShadow: isAnimating ? 
                  "0 0 10px #00aaff, 0 0 20px #0066ff" : 
                  "0 0 5px #0088cc, 0 0 10px #0055aa"
              }}
            >
              GRADIUS
            </CardTitle>
            <div 
              className="text-xl text-yellow-300 mb-4 pixel-font"
              style={{ 
                fontSize: '14px',
                textShadow: "0 0 5px #ffaa00, 0 0 10px #ff8800"
              }}
            >
              SPACE SHOOTER
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="playerName" 
                className="block text-sm pixel-font"
                style={{ fontSize: '12px' }}
              >
                ENTER YOUR CALLSIGN:
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={handleNameChange}
                maxLength={10}
                className="bg-gray-800 border-gray-700 text-white pixel-font"
                style={{ fontSize: '14px' }}
              />
            </div>
            
            <div className="text-center">
              <div 
                className="text-xs text-gray-400 mb-4 pixel-font"
                style={{ fontSize: '10px' }}
              >
                CONTROLS: ARROWS/WASD TO MOVE, SPACE TO SHOOT
              </div>
              
              <Button 
                onClick={handleStart}
                className="w-full mb-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 pixel-font"
              >
                START MISSION
              </Button>
              
              <Button 
                onClick={onLeaderboard} 
                variant="outline"
                className="w-full bg-transparent hover:bg-gray-800 text-blue-400 border border-blue-400 pixel-font"
                style={{ fontSize: '12px' }}
              >
                LEADERBOARD
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0">
            <p 
              className="text-[10px] text-gray-500 text-center pixel-font"
              style={{ fontSize: '8px' }}
            >
              © 2023 GRADIUS SPACE SHOOTER - ALL RIGHTS RESERVED
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StartScreen;
