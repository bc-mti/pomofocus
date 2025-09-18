import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PomodoroSession } from "@shared/schema";
import { format, startOfWeek, eachDayOfInterval, endOfWeek, isSameDay } from "date-fns";

interface WeeklyChartProps {
  sessions: PomodoroSession[];
}

export default function WeeklyChart({ sessions }: WeeklyChartProps) {
  // Calculate this week's data
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  
  // Generate all days of the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Process sessions by day
  const weekData = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter(session => 
      session.date === dayStr && session.sessionType === 'work' && session.wasCompleted
    );
    
    return {
      day: format(day, 'EEE'), // Mon, Tue, etc.
      date: dayStr,
      sessions: daySessions.length,
      minutes: daySessions.reduce((sum, session) => sum + session.duration, 0),
      isToday: isSameDay(day, today)
    };
  });

  const totalSessions = weekData.reduce((sum, day) => sum + day.sessions, 0);
  const totalMinutes = weekData.reduce((sum, day) => sum + day.minutes, 0);
  const avgPerDay = Math.round(totalSessions / 7 * 10) / 10;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-md p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {data.sessions} sessions ({data.minutes} min)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">This Week</CardTitle>
          <div className="flex gap-1 sm:gap-2">
            <Badge variant="secondary" className="text-xs">{totalSessions} sessions</Badge>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">{Math.round(totalMinutes / 60 * 10) / 10}h</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-primary">{totalSessions}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-chart-2">{Math.round(totalMinutes / 60 * 10) / 10}</div>
              <div className="text-xs text-muted-foreground">Hours Focused</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-chart-3">{avgPerDay}</div>
              <div className="text-xs text-muted-foreground">Avg/Day</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="sessions" 
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  className="opacity-80 hover:opacity-100"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Breakdown */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekData.map((day, index) => (
              <div 
                key={index} 
                className={`p-1 sm:p-2 rounded ${day.isToday ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}
              >
                <div className="font-medium">{day.day}</div>
                <div className="text-muted-foreground">{day.sessions}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}