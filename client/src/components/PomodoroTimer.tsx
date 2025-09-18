import { useState, useEffect, useCallback } from "react";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import SessionTracker from "./SessionTracker";
import SettingsModal from "./SettingsModal";
import ThemeToggle from "./ThemeToggle";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

const TIMER_STATES = {
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'long_break'
} as const;

type TimerState = typeof TIMER_STATES[keyof typeof TIMER_STATES];

interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  dailyGoal: number;
  soundEnabled: boolean;
}

export default function PomodoroTimer() {
  // Settings state
  const [settings, setSettings] = useState<PomodoroSettings>({
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    dailyGoal: 8,
    soundEnabled: true
  });
  
  // Timer state
  const [currentState, setCurrentState] = useState<TimerState>(TIMER_STATES.WORK);
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0);
  
  // Modal state
  const [showSettings, setShowSettings] = useState(false);
  
  const { toast } = useToast();

  // Load saved data on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    const savedSessions = localStorage.getItem('pomodoroSessions');
    const savedDate = localStorage.getItem('pomodoroDate');
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTimeLeft(parsed.workMinutes * 60);
    }
    
    // Reset daily sessions if it's a new day
    const today = new Date().toDateString();
    if (savedDate === today && savedSessions) {
      const { completed, workCompleted } = JSON.parse(savedSessions);
      setCompletedSessions(completed || 0);
      setWorkSessionsCompleted(workCompleted || 0);
    } else {
      localStorage.setItem('pomodoroDate', today);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify({
      completed: completedSessions,
      workCompleted: workSessionsCompleted
    }));
  }, [completedSessions, workSessionsCompleted]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isActive) {
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !showSettings) {
        event.preventDefault();
        if (isActive) {
          handlePause();
        } else {
          handleStart();
        }
      }
      if (event.code === 'KeyR' && !showSettings) {
        event.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, showSettings]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Audio and browser notification
  const playNotification = useCallback((message: string, isWork: boolean) => {
    // Audio notification
    if (settings.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        
        oscillator.frequency.value = isWork ? 600 : 800; // Different tones for work/break
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Audio notification failed:', error);
      }
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '/favicon.ico', // Will fallback gracefully if not found
        badge: '/favicon.ico',
        tag: 'pomodoro-timer', // Replace previous notifications
        requireInteraction: false
      });
    }
  }, [settings.soundEnabled]);

  const handleTimerComplete = async () => {
    // Save completed session to database
    try {
      const sessionData = {
        sessionType: currentState,
        duration: currentState === TIMER_STATES.WORK ? settings.workMinutes : 
                  currentState === TIMER_STATES.BREAK ? settings.breakMinutes : 
                  settings.longBreakMinutes,
        wasCompleted: true,
        date: new Date().toISOString().split('T')[0]
      };

      await apiRequest('POST', '/api/sessions', sessionData);

      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/week'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/month'] });
    } catch (error) {
      console.error('Failed to save session:', error);
    }

    if (currentState === TIMER_STATES.WORK) {
      // Work session completed
      setCompletedSessions(prev => prev + 1);
      setWorkSessionsCompleted(prev => prev + 1);
      
      // Determine next break type
      const nextState = (workSessionsCompleted + 1) % 4 === 0 
        ? TIMER_STATES.LONG_BREAK 
        : TIMER_STATES.BREAK;
      
      const breakMessage = `Work session complete! Time for a ${nextState === TIMER_STATES.LONG_BREAK ? 'long' : 'short'} break.`;
      playNotification(breakMessage, false);
      
      setCurrentState(nextState);
      setTimeLeft(nextState === TIMER_STATES.LONG_BREAK 
        ? settings.longBreakMinutes * 60 
        : settings.breakMinutes * 60
      );
      
      toast({
        title: "Work session complete! 🎉",
        description: `Time for a ${nextState === TIMER_STATES.LONG_BREAK ? 'long' : 'short'} break.`,
      });
    } else {
      // Break completed
      const workMessage = "Break time's over! Ready for another focus session?";
      playNotification(workMessage, true);
      
      setCurrentState(TIMER_STATES.WORK);
      setTimeLeft(settings.workMinutes * 60);
      
      toast({
        title: "Break time's over! 💪",
        description: "Ready for another focus session?",
      });
    }
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentState(TIMER_STATES.WORK);
    setTimeLeft(settings.workMinutes * 60);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleSaveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    
    // Update current timer if not active
    if (!isActive) {
      if (currentState === TIMER_STATES.WORK) {
        setTimeLeft(newSettings.workMinutes * 60);
      } else if (currentState === TIMER_STATES.BREAK) {
        setTimeLeft(newSettings.breakMinutes * 60);
      } else {
        setTimeLeft(newSettings.longBreakMinutes * 60);
      }
    }
    
    toast({
      title: "Settings saved! ⚙️",
      description: "Your preferences have been updated.",
    });
  };

  const getTotalTime = () => {
    if (currentState === TIMER_STATES.WORK) return settings.workMinutes * 60;
    if (currentState === TIMER_STATES.BREAK) return settings.breakMinutes * 60;
    return settings.longBreakMinutes * 60;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ThemeToggle />
      
      {/* Statistics Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-10"
        asChild
        data-testid="button-statistics"
      >
        <Link href="/statistics">
          <BarChart3 className="h-4 w-4" />
        </Link>
      </Button>
      
      <div className="w-full max-w-md space-y-8">
        {/* Main Timer Display */}
        <TimerDisplay
          timeLeft={timeLeft}
          totalTime={getTotalTime()}
          isActive={isActive}
          isWork={currentState === TIMER_STATES.WORK}
        />
        
        {/* Timer Controls */}
        <TimerControls
          isActive={isActive}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSettings={handleSettings}
        />
        
        {/* Session Tracking */}
        <SessionTracker
          completedSessions={completedSessions}
          dailyGoal={settings.dailyGoal}
        />
        
        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts />
      </div>
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        workMinutes={settings.workMinutes}
        breakMinutes={settings.breakMinutes}
        longBreakMinutes={settings.longBreakMinutes}
        dailyGoal={settings.dailyGoal}
        soundEnabled={settings.soundEnabled}
        onSave={handleSaveSettings}
      />
    </div>
  );
}