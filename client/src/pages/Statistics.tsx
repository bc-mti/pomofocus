import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";
import WeeklyChart from "@/components/WeeklyChart";
import MonthlyChart from "@/components/MonthlyChart";
import ProductivityInsights from "@/components/ProductivityInsights";
import { PomodoroSession } from "@shared/schema";

export default function Statistics() {
  // Fetch session data from API
  const { data: monthSessions = [], isLoading, error } = useQuery<PomodoroSession[]>({
    queryKey: ['/api/sessions/month'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your productivity data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Unable to load statistics data.</p>
            <Button asChild variant="outline">
              <Link href="/">Back to Timer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild data-testid="button-back">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Productivity Statistics</h1>
                <p className="text-sm text-muted-foreground">Track your focus sessions and productivity trends</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Analytics Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {monthSessions.length === 0 ? (
          // Empty State
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Data Yet</h3>
                  <p className="text-muted-foreground">
                    Complete some pomodoro sessions to see your productivity statistics.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/">Start Your First Session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Dashboard with Charts
          <div className="grid gap-6">
            {/* Top Row - Insights */}
            <ProductivityInsights sessions={monthSessions} />
            
            {/* Middle Row - Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <WeeklyChart sessions={monthSessions} />
              <MonthlyChart sessions={monthSessions} />
            </div>

            {/* Bottom Row - Additional Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Session Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['work', 'break', 'long_break'].map(type => {
                      const typeSessions = monthSessions.filter(s => s.sessionType === type && s.wasCompleted);
                      const totalMinutes = typeSessions.reduce((sum, s) => sum + s.duration, 0);
                      const hours = Math.round(totalMinutes / 60 * 10) / 10;
                      
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{typeSessions.length} sessions</div>
                            <div className="text-xs text-muted-foreground">{hours}h</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const workSessions = monthSessions.filter(s => s.sessionType === 'work');
                      const completedWork = workSessions.filter(s => s.wasCompleted);
                      const completionRate = workSessions.length > 0 
                        ? Math.round((completedWork.length / workSessions.length) * 100)
                        : 0;
                      
                      return (
                        <>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{completionRate}%</div>
                            <div className="text-sm text-muted-foreground">Sessions completed</div>
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            {completedWork.length} of {workSessions.length} work sessions finished
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/">Back to Timer</Link>
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    Data updates automatically as you complete sessions
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}