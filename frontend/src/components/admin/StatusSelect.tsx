import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  options: StatusOption[];
}

export default function StatusSelect({ value, onValueChange, disabled, options }: StatusSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {disabled && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
