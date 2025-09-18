import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PomodoroSession } from "@shared/schema";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface MonthlyChartProps {
  sessions: PomodoroSession[];
}

export default function MonthlyChart({ sessions }: MonthlyChartProps) {
  // Calculate last 30 days data
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29); // 30 days including today
  
  // Generate all days in the last 30 days
  const monthDays = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
  
  // Process sessions by day
  const monthData = monthDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter(session => 
      session.date === dayStr && session.sessionType === 'work' && session.wasCompleted
    );
    
    return {
      date: format(day, 'MMM d'),
      fullDate: dayStr,
      sessions: daySessions.length,
      minutes: daySessions.reduce((sum, session) => sum + session.duration, 0)
    };
  });

  const totalSessions = monthData.reduce((sum, day) => sum + day.sessions, 0);
  const totalMinutes = monthData.reduce((sum, day) => sum + day.minutes, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
  const avgPerDay = Math.round(totalSessions / 30 * 10) / 10;
  const streak = calculateStreak(monthData);

  // Calculate 7-day moving average
  const movingAverage = monthData.map((day, index) => {
    const start = Math.max(0, index - 6);
    const weekData = monthData.slice(start, index + 1);
    const avg = weekData.reduce((sum, d) => sum + d.sessions, 0) / weekData.length;
    return {
      ...day,
      movingAvg: Math.round(avg * 10) / 10
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-md p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">
            {data.sessions} sessions ({data.minutes} min)
          </p>
          {payload.length > 1 && (
            <p className="text-sm text-chart-2">
              7-day avg: {data.movingAvg} sessions
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Last 30 Days</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{totalSessions} sessions</Badge>
            <Badge variant="outline">{totalHours}h total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{totalSessions}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{totalHours}</div>
              <div className="text-xs text-muted-foreground">Total Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-3">{avgPerDay}</div>
              <div className="text-xs text-muted-foreground">Avg/Day</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-4">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movingAverage} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="movingAvg" 
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Insights */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Best day: {getBestDay(monthData)} sessions</p>
            <p>• Current streak: {streak} days with at least 1 session</p>
            <p>• Most productive time tracked over last 30 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateStreak(data: Array<{ sessions: number }>): number {
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].sessions > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getBestDay(data: Array<{ date: string; sessions: number }>): string {
  const best = data.reduce((max, day) => day.sessions > max.sessions ? day : max, data[0]);
  return `${best.date} (${best.sessions})`;
}