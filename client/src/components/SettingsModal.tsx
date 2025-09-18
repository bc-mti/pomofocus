import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, VolumeX } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  dailyGoal: number;
  soundEnabled: boolean;
  onSave: (settings: {
    workMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
    dailyGoal: number;
    soundEnabled: boolean;
  }) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  workMinutes,
  breakMinutes,
  longBreakMinutes,
  dailyGoal,
  soundEnabled,
  onSave
}: SettingsModalProps) {
  const [localWorkMinutes, setLocalWorkMinutes] = useState(workMinutes);
  const [localBreakMinutes, setLocalBreakMinutes] = useState(breakMinutes);
  const [localLongBreakMinutes, setLocalLongBreakMinutes] = useState(longBreakMinutes);
  const [localDailyGoal, setLocalDailyGoal] = useState(dailyGoal);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);

  const handleSave = () => {
    console.log('Settings saved', {
      workMinutes: localWorkMinutes,
      breakMinutes: localBreakMinutes,
      longBreakMinutes: localLongBreakMinutes,
      dailyGoal: localDailyGoal,
      soundEnabled: localSoundEnabled
    });
    
    onSave({
      workMinutes: localWorkMinutes,
      breakMinutes: localBreakMinutes,
      longBreakMinutes: localLongBreakMinutes,
      dailyGoal: localDailyGoal,
      soundEnabled: localSoundEnabled
    });
    onClose();
  };

  const handleReset = () => {
    console.log('Settings reset to defaults');
    setLocalWorkMinutes(25);
    setLocalBreakMinutes(5);
    setLocalLongBreakMinutes(15);
    setLocalDailyGoal(8);
    setLocalSoundEnabled(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Timer Settings</DialogTitle>
          <DialogDescription className="text-sm">
            Customize your pomodoro timer durations and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Timer Duration Settings */}
          <Card>
            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="work-minutes">Focus Time (minutes)</Label>
                <Input
                  id="work-minutes"
                  type="number"
                  min="1"
                  max="60"
                  value={localWorkMinutes}
                  onChange={(e) => setLocalWorkMinutes(parseInt(e.target.value) || 25)}
                  data-testid="input-work-minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="break-minutes">Short Break (minutes)</Label>
                <Input
                  id="break-minutes"
                  type="number"
                  min="1"
                  max="30"
                  value={localBreakMinutes}
                  onChange={(e) => setLocalBreakMinutes(parseInt(e.target.value) || 5)}
                  data-testid="input-break-minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="long-break-minutes">Long Break (minutes)</Label>
                <Input
                  id="long-break-minutes"
                  type="number"
                  min="5"
                  max="60"
                  value={localLongBreakMinutes}
                  onChange={(e) => setLocalLongBreakMinutes(parseInt(e.target.value) || 15)}
                  data-testid="input-long-break-minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-goal">Daily Goal (sessions)</Label>
                <Input
                  id="daily-goal"
                  type="number"
                  min="1"
                  max="20"
                  value={localDailyGoal}
                  onChange={(e) => setLocalDailyGoal(parseInt(e.target.value) || 8)}
                  data-testid="input-daily-goal"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {localSoundEnabled ? (
                    <Volume2 className="h-5 w-5 text-primary" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Play sound when timer completes</p>
                  </div>
                </div>
                <Switch
                  checked={localSoundEnabled}
                  onCheckedChange={setLocalSoundEnabled}
                  data-testid="switch-sound"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={handleReset}
              data-testid="button-reset-settings"
              className="h-11 sm:w-auto"
            >
              Reset to Defaults
            </Button>
            <div className="flex gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
                className="flex-1 sm:flex-none h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                data-testid="button-save-settings"
                className="flex-1 sm:flex-none h-11"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}