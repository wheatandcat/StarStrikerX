import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatScore } from "@/lib/gameUtils";

interface StageClearScreenProps {
  score: number;
  onContinue: () => void;
}

const StageClearScreen = ({ score, onContinue }: StageClearScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  // Animation effects
  useEffect(() => {
    // Small delay for dramatic effect
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    // Delay the continue button appearance for dramatic effect
    const buttonTimer = setTimeout(() => {
      setShowContinueButton(true);
    }, 2500);
    
    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(buttonTimer);
    };
  }, []);
  
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(20, 60, 100, 0.7), rgba(0, 20, 40, 0.9))"
      }}
    >
      <div className="w-full max-w-md mx-4">
        <Card className="border-2 border-blue-600 bg-gray-900 text-white shadow-lg shadow-blue-600/30">
          <CardHeader className="text-center pb-2">
            <CardTitle 
              className="text-3xl font-bold mb-2 text-green-400 pixel-font"
              style={{ 
                textShadow: "0 0 10px #00cc00, 0 0 20px #008800"
              }}
            >
              STAGE CLEAR!
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
                CURRENT SCORE
              </div>
              
              <div 
                className="text-3xl text-yellow-300 mb-6 pixel-font"
                style={{ 
                  textShadow: "0 0 5px #ffaa00, 0 0 10px #ff8800"
                }}
              >
                {formatScore(score)}
              </div>
              
              <div 
                className={`transition-opacity duration-1000 ${showContinueButton ? 'opacity-100' : 'opacity-0'}`}
              >
                <Button 
                  onClick={onContinue}
                  className="w-full mb-2 bg-green-700 hover:bg-green-600 text-white border border-green-500 pixel-font"
                  disabled={!showContinueButton}
                >
                  CONTINUE
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0">
            <p 
              className="text-[10px] text-gray-400 text-center pixel-font"
              style={{ fontSize: '8px' }}
            >
              WELL DONE, PILOT. THE NEXT CHALLENGE AWAITS.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StageClearScreen;
