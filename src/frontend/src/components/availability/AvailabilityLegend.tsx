import { Calendar, XCircle } from 'lucide-react';

export default function AvailabilityLegend() {
  return (
    <div className="flex items-center gap-4 text-sm p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
        <span className="text-muted-foreground">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-destructive/10 border border-destructive/30 flex items-center justify-center">
          <XCircle className="w-3 h-3 text-destructive/70" />
        </div>
        <span className="text-muted-foreground">Booked/Blocked</span>
      </div>
    </div>
  );
}
