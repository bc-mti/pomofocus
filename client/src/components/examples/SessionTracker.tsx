import SessionTracker from '../SessionTracker';

export default function SessionTrackerExample() {
  return (
    <SessionTracker
      completedSessions={3}
      dailyGoal={8}
    />
  );
}