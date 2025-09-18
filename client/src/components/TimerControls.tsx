import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";

interface TimerControlsProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSettings: () => void;
}

export default function TimerControls({ 
  isActive, 
  onStart, 
  onPause, 
  onReset, 
  onSettings 
}: TimerControlsProps) {
  const handleMainAction = () => {
    console.log(isActive ? 'Pause triggered' : 'Start triggered');
    isActive ? onPause() : onStart();
  };

  const handleReset = () => {
    console.log('Reset triggered');
    onReset();
  };

  const handleSettings = () => {
    console.log('Settings triggered');
    onSettings();
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Main Action Button */}
      <Button
        size="lg"
        onClick={handleMainAction}
        className="h-16 w-16 rounded-full"
        data-testid={isActive ? "button-pause" : "button-start"}
      >
        {isActive ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6 ml-1" />
        )}
      </Button>

      {/* Reset Button */}
      <Button
        size="icon"
        variant="outline"
        onClick={handleReset}
        data-testid="button-reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Settings Button */}
      <Button
        size="icon"
        variant="outline"
        onClick={handleSettings}
        data-testid="button-settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}