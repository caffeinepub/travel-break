// Shared static hotel review data
export interface HotelReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  roomType?: string;
}

export const hotelReviews: HotelReview[] = [
  {
    id: 'review-1',
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing stay! The rooms were spotless and the service was exceptional.',
    roomType: 'deluxe',
  },
  {
    id: 'review-2',
    name: 'Michael Chen',
    rating: 5,
    comment: 'Perfect location and great amenities. Will definitely come back!',
    roomType: 'suite',
  },
  {
    id: 'review-3',
    name: 'Emma Davis',
    rating: 4,
    comment: 'Very comfortable and peaceful. Great value for money.',
    roomType: 'cottage',
  },
  {
    id: 'review-4',
    name: 'David Martinez',
    rating: 5,
    comment: 'Outstanding experience from check-in to check-out. The staff went above and beyond.',
    roomType: 'suite',
  },
  {
    id: 'review-5',
    name: 'Lisa Anderson',
    rating: 4,
    comment: 'Beautiful property with excellent facilities. Highly recommend for families.',
    roomType: 'deluxe',
  },
  {
    id: 'review-6',
    name: 'James Wilson',
    rating: 5,
    comment: 'The cottage was absolutely charming. Perfect for a romantic getaway.',
    roomType: 'cottage',
  },
];

// Calculate average rating
export function getAverageRating(): number {
  if (hotelReviews.length === 0) return 0;
  const sum = hotelReviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / hotelReviews.length) * 10) / 10;
}

// Get rating for a specific room type
export function getRoomTypeRating(roomType: string): number {
  const filtered = hotelReviews.filter(r => r.roomType?.toLowerCase().includes(roomType.toLowerCase()));
  if (filtered.length === 0) return getAverageRating();
  const sum = filtered.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / filtered.length) * 10) / 10;
}
