import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft } from 'lucide-react';
import { hotelReviews, getAverageRating } from '@/data/hotelReviews';
import { useNavigate } from '@tanstack/react-router';

export default function HotelReviewsPage() {
  const navigate = useNavigate();
  const averageRating = getAverageRating();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container py-8 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/hotel' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hotels & Stays
          </Button>
          <h1 className="text-3xl font-bold mb-2">Guest Reviews</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{averageRating}</span>
            </div>
            <span className="text-muted-foreground">
              Based on {hotelReviews.length} review{hotelReviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="container py-8 max-w-4xl">
        <div className="space-y-4">
          {hotelReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.name}</CardTitle>
                    {review.roomType && (
                      <Badge variant="secondary" className="mt-2 capitalize">
                        {review.roomType}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
