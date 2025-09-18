import TimerControls from '../TimerControls';

export default function TimerControlsExample() {
  return (
    <TimerControls
      isActive={false}
      onStart={() => console.log('Start clicked')}
      onPause={() => console.log('Pause clicked')}
      onReset={() => console.log('Reset clicked')}
      onSettings={() => console.log('Settings clicked')}
    />
  );
}