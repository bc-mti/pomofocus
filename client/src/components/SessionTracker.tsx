import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SessionTrackerProps {
  completedSessions: number;
  dailyGoal: number;
}

export default function SessionTracker({ completedSessions, dailyGoal }: SessionTrackerProps) {
  const progressPercentage = Math.min((completedSessions / dailyGoal) * 100, 100);

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Today's Progress</h3>
          <Badge variant="secondary" data-testid="badge-session-count">
            {completedSessions}/{dailyGoal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
            data-testid="progress-bar"
          />
        </div>

        {/* Tomato Icons for Completed Sessions */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-2">Completed:</span>
          {Array.from({ length: Math.max(6, dailyGoal) }, (_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < completedSessions 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
              data-testid={`session-indicator-${i}`}
            >
              🍅
            </div>
          ))}
        </div>

        {/* Motivational Text */}
        <div className="text-center">
          {completedSessions >= dailyGoal ? (
            <p className="text-sm text-primary font-medium">🎉 Daily goal achieved!</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {dailyGoal - completedSessions} more session{dailyGoal - completedSessions !== 1 ? 's' : ''} to reach your goal
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}