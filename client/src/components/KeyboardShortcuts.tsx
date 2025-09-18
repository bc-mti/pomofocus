import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Space", description: "Start/Pause timer" },
    { key: "R", description: "Reset timer" },
  ];

  return (
    <Card className="bg-card border-card-border">
      <CardContent className="pt-4">
        <h4 className="text-sm font-medium text-card-foreground mb-3">Keyboard Shortcuts</h4>
        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{description}</span>
              <Badge variant="outline" className="font-mono text-xs">
                {key}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}