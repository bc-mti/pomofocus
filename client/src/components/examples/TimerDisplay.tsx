import TimerDisplay from '../TimerDisplay';

export default function TimerDisplayExample() {
  return (
    <TimerDisplay
      timeLeft={900} // 15 minutes
      totalTime={1500} // 25 minutes
      isActive={true}
      isWork={true}
    />
  );
}