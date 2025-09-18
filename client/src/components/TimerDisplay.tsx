import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  isWork: boolean;
}

export default function TimerDisplay({ timeLeft, totalTime, isActive, isWork }: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  // Calculate stroke-dasharray for circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <Card className="p-8 bg-card border-card-border">
      <div className="flex flex-col items-center space-y-6">
        {/* Session Type Badge */}
        <Badge 
          variant={isWork ? "default" : "secondary"}
          className="text-sm font-medium px-4 py-2"
          data-testid="badge-session-type"
        >
          {isWork ? "Focus Time" : "Break Time"}
        </Badge>

        {/* Circular Progress Timer */}
        <div className="relative flex items-center justify-center">
          <svg 
            width="280" 
            height="280" 
            className="transform -rotate-90"
            data-testid="svg-timer-progress"
          >
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="hsl(var(--border))"
              strokeWidth="8"
              fill="transparent"
              className="opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={isWork ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-70'}`}
              style={{
                filter: isActive ? 'drop-shadow(0 0 8px hsla(var(--primary), 0.4))' : 'none'
              }}
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div 
              className="text-6xl font-bold tabular-nums text-foreground"
              data-testid="text-timer-display"
            >
              {formatTime(minutes)}:{formatTime(seconds)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {isActive ? 'In Progress' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Progress percentage */}
        <div className="text-sm text-muted-foreground" data-testid="text-progress">
          {Math.round(progress)}% complete
        </div>
      </div>
    </Card>
  );
}