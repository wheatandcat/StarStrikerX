import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatScore } from "@/lib/gameUtils";

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onLeaderboard: () => void;
}

const GameOverScreen = ({ score, onRestart, onLeaderboard }: GameOverScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect for appearing
  useEffect(() => {
    // Small delay for dramatic effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(80, 20, 20, 0.7), rgba(40, 0, 0, 0.9))"
      }}
    >
      <div className="w-full max-w-md mx-4">
        <Card className="border-2 border-red-700 bg-gray-900 text-white shadow-lg shadow-red-700/30">
          <CardHeader className="text-center pb-2">
            <CardTitle 
              className="text-3xl font-bold mb-2 text-red-500 pixel-font"
              style={{ 
                textShadow: "0 0 10px #ff0000, 0 0 20px #cc0000"
              }}
            >
              GAME OVER
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-6">
              <div 
                className="text-xl text-white mb-2 pixel-font"
                style={{ 
                  fontSize: '14px'
                }}
              >
                FINAL SCORE
              </div>
              
              <div 
                className="text-3xl text-yellow-300 mb-6 pixel-font"
                style={{ 
                  textShadow: "0 0 5px #ffaa00, 0 0 10px #ff8800"
                }}
              >
                {formatScore(score)}
              </div>
              
              <Button 
                onClick={onRestart}
                className="w-full mb-2 bg-red-700 hover:bg-red-600 text-white border border-red-500 pixel-font"
              >
                TRY AGAIN
              </Button>
              
              <Button 
                onClick={onLeaderboard} 
                variant="outline"
                className="w-full bg-transparent hover:bg-gray-800 text-red-400 border border-red-500 pixel-font"
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
              DEFEAT IS TEMPORARY. GLORY IS ETERNAL.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default GameOverScreen;
