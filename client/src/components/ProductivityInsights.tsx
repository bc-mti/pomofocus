import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PomodoroSession } from "@shared/schema";
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Zap } from "lucide-react";
import { format, subDays, isAfter, startOfWeek, endOfWeek } from "date-fns";

interface ProductivityInsightsProps {
  sessions: PomodoroSession[];
}

export default function ProductivityInsights({ sessions }: ProductivityInsightsProps) {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const lastWeek = subDays(today, 7);
  const lastMonth = subDays(today, 30);

  // Calculate various metrics
  const todaySessions = sessions.filter(s => 
    s.date === format(today, 'yyyy-MM-dd') && s.sessionType === 'work' && s.wasCompleted
  );

  const yesterdaySessions = sessions.filter(s => 
    s.date === format(yesterday, 'yyyy-MM-dd') && s.sessionType === 'work' && s.wasCompleted
  );

  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    return sessionDate >= weekStart && sessionDate <= weekEnd && s.sessionType === 'work' && s.wasCompleted;
  });

  const lastWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 0 });
    return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd && s.sessionType === 'work' && s.wasCompleted;
  });

  const recentSessions = sessions.filter(s => 
    isAfter(new Date(s.date), lastMonth) && s.sessionType === 'work' && s.wasCompleted
  );

  // Calculate productivity metrics
  const dailyChange = todaySessions.length - yesterdaySessions.length;
  const weeklyChange = thisWeekSessions.length - lastWeekSessions.length;
  const totalMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
  
  // Calculate consistency (days with at least 1 session in last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    return sessions.some(s => s.date === date && s.sessionType === 'work' && s.wasCompleted);
  });
  const consistencyPercentage = Math.round((last30Days.filter(Boolean).length / 30) * 100);

  // Calculate average session length
  const avgSessionLength = recentSessions.length > 0 
    ? Math.round(totalMinutes / recentSessions.length)
    : 0;

  // Find most productive day of week
  const dayStats = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getDay() === index && s.sessionType === 'work' && s.wasCompleted;
    });
    return { day, count: daySessions.length };
  });
  const bestDay = dayStats.reduce((max, current) => current.count > max.count ? current : max);

  // Goal progress (assuming 8 sessions per day as ideal)
  const idealDaily = 8;
  const goalProgress = Math.min((todaySessions.length / idealDaily) * 100, 100);

  const insights = [
    {
      icon: TrendingUp,
      title: "Daily Trend",
      value: dailyChange >= 0 ? `+${dailyChange}` : `${dailyChange}`,
      description: "vs yesterday",
      positive: dailyChange >= 0,
      color: dailyChange >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      icon: Calendar,
      title: "Weekly Trend", 
      value: weeklyChange >= 0 ? `+${weeklyChange}` : `${weeklyChange}`,
      description: "vs last week",
      positive: weeklyChange >= 0,
      color: weeklyChange >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      icon: Clock,
      title: "Avg Session",
      value: `${avgSessionLength}m`,
      description: "average length",
      positive: avgSessionLength >= 20,
      color: avgSessionLength >= 20 ? "text-green-600" : "text-orange-600"
    },
    {
      icon: Zap,
      title: "Best Day",
      value: bestDay.day.slice(0, 3),
      description: `${bestDay.count} sessions`,
      positive: bestDay.count > 0,
      color: "text-blue-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Target className="h-4 w-4 sm:h-5 sm:w-5" />
          Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <insight.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${insight.color}`} />
                </div>
                <div className={`text-lg sm:text-xl font-bold ${insight.color}`}>
                  {insight.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {insight.description}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Sections */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium">Today's Goal Progress</span>
                <Badge variant={goalProgress >= 100 ? "default" : "secondary"} className="text-xs">
                  {todaySessions.length}/{idealDaily}
                </Badge>
              </div>
              <Progress value={goalProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {goalProgress >= 100 ? "Goal achieved! 🎉" : `${Math.round(goalProgress)}% of daily goal`}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium">30-Day Consistency</span>
                <Badge variant={consistencyPercentage >= 70 ? "default" : "secondary"} className="text-xs">
                  {consistencyPercentage}%
                </Badge>
              </div>
              <Progress value={consistencyPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {consistencyPercentage >= 70 
                  ? "Great consistency!" 
                  : "Try to be more consistent with daily sessions"
                }
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center border-t pt-3 sm:pt-4">
            <div>
              <div className="text-base sm:text-lg font-bold text-primary">{recentSessions.length}</div>
              <div className="text-xs text-muted-foreground">Sessions (30d)</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-chart-2">{totalHours}h</div>
              <div className="text-xs text-muted-foreground">Total Focus</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-chart-3">{consistencyPercentage}%</div>
              <div className="text-xs text-muted-foreground">Consistency</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}