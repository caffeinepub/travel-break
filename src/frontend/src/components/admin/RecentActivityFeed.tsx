import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Hotel, Car, UserCircle, ShoppingBag, MessageSquare, CreditCard, LucideIcon } from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/utils/format';

type ActivityType = 'hotel' | 'cab' | 'driver' | 'order' | 'inquiry' | 'payment';

interface Activity {
  type: ActivityType;
  id: string;
  timestamp: number;
  timestampBigInt: bigint;
  status: string;
  data: any;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType): { icon: LucideIcon; color: string } => {
  const iconMap: Record<ActivityType, { icon: LucideIcon; color: string }> = {
    hotel: { icon: Hotel, color: 'text-sky-500' },
    cab: { icon: Car, color: 'text-green-500' },
    driver: { icon: UserCircle, color: 'text-cyan-500' },
    order: { icon: ShoppingBag, color: 'text-orange-500' },
    inquiry: { icon: MessageSquare, color: 'text-red-500' },
    payment: { icon: CreditCard, color: 'text-blue-500' },
  };
  return iconMap[type];
};

const getActivityTitle = (activity: Activity): string => {
  switch (activity.type) {
    case 'hotel':
      return `Hotel Booking - ${activity.data.roomType}`;
    case 'cab':
      return `Cab Booking - ${activity.data.cabType}`;
    case 'driver':
      return `Acting Driver - ${activity.data.vehicleType}`;
    case 'order':
      return `Sales Order - ${activity.data.products.length} item${activity.data.products.length !== 1 ? 's' : ''}`;
    case 'inquiry':
      return 'Customer Inquiry';
    case 'payment':
      return `Payment - ${formatCurrency(Number(activity.data.amount))}`;
    default:
      return 'Activity';
  }
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    confirmed: { variant: 'default', label: 'Confirmed' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
    new: { variant: 'secondary', label: 'New' },
    new_: { variant: 'secondary', label: 'New' },
    reviewed: { variant: 'default', label: 'Reviewed' },
    closed: { variant: 'outline', label: 'Closed' },
    verified: { variant: 'default', label: 'Verified' },
    rejected: { variant: 'destructive', label: 'Rejected' },
  };
  const config = statusMap[status] || { variant: 'outline' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest bookings, orders, inquiries, and payments sorted by most recent first
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              activities.map((activity) => {
                const { icon: Icon, color } = getActivityIcon(activity.type);
                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className={`mt-1 ${color} flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none">{getActivityTitle(activity)}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(activity.timestampBigInt)}</p>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(activity.status)}</div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
