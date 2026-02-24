import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

interface AdminKpiCardsProps {
  stats: StatItem[];
}

export default function AdminKpiCards({ stats }: AdminKpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total {stat.label.toLowerCase()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
