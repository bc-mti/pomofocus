import { useState } from 'react';
import SettingsModal from '../SettingsModal';
import { Button } from "@/components/ui/button";

export default function SettingsModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>Open Settings</Button>
      <SettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        workMinutes={25}
        breakMinutes={5}
        longBreakMinutes={15}
        dailyGoal={8}
        soundEnabled={true}
        onSave={(settings) => {
          console.log('Settings saved:', settings);
          setIsOpen(false);
        }}
      />
    </div>
  );
}