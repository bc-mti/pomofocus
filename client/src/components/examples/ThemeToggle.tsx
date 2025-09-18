import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-8">
      <ThemeToggle />
      <p className="mt-4 text-sm text-muted-foreground">
        Click the theme toggle button in the top-right corner to switch between light and dark modes.
      </p>
    </div>
  );
}