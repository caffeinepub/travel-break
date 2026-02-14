import { useState, useMemo } from 'react';
import { useGetRoomTypes, useBookHotel, useGetMyHotelBookings } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CalendarIcon, CheckCircle2, Star, Info, ArrowRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { dateToNanoseconds, formatCurrency, formatDate } from '@/utils/format';
import { getAverageRating, getRoomTypeRating } from '@/data/hotelReviews';
import { useNavigate } from '@tanstack/react-router';
import type { RoomType } from '../backend';

export default function HotelBookingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: roomTypes, isLoading } = useGetRoomTypes();
  const { data: myBookings } = useGetMyHotelBookings();
  const bookHotel = useBookHotel();

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  const isAuthenticated = !!identity;
  const averageRating = getAverageRating();

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(checkOut, checkIn);
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    if (!selectedRoom || numberOfNights <= 0) return 0;
    return Number(selectedRoom.pricePerNight) * numberOfNights;
  }, [selectedRoom, numberOfNights]);

  const depositAmount = useMemo(() => {
    return Math.round(totalPrice * 0.1);
  }, [totalPrice]);

  const remainingAmount = useMemo(() => {
    return totalPrice - depositAmount;
  }, [totalPrice, depositAmount]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a room');
      return;
    }

    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error('Please select room type and dates');
      return;
    }

    try {
      const id = await bookHotel.mutateAsync({
        roomType: selectedRoom.name,
        checkInDate: dateToNanoseconds(checkIn),
        checkOutDate: dateToNanoseconds(checkOut),
      });
      setBookingId(id);
      setShowConfirmation(true);
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error('Failed to book room');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="border-green-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Booking Confirmed!</CardTitle>
            <CardDescription>
              Your hotel booking has been successfully submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Booking Reference:</strong> {bookingId}</p>
              <p><strong>Room:</strong> {selectedRoom?.name}</p>
              <p><strong>Check-in:</strong> {checkIn && format(checkIn, 'PPP')}</p>
              <p><strong>Check-out:</strong> {checkOut && format(checkOut, 'PPP')}</p>
              <p><strong>Nights:</strong> {numberOfNights}</p>
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <p className="font-semibold mb-2">Payment Summary</p>
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-medium">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Deposit (10%):</span>
                <span className="font-medium text-primary">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining Amount:</span>
                <span className="font-medium">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Step:</strong> To confirm your booking, please submit a payment record for the deposit amount of <strong>{formatCurrency(depositAmount)}</strong> on the Payment Receiving page. Use the booking reference <strong>{bookingId}</strong> when submitting your payment record.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This system records payment information only. No actual payment processing occurs. Email and WhatsApp notifications are not included in this version.
              </p>
            </div>
            <Button onClick={() => { setShowConfirmation(false); setBookingId(''); }} className="w-full">
              Make Another Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with Background Image */}
      <div 
        className="relative py-12 px-4 bg-hero-image bg-overlay-subtle"
        style={{
          backgroundImage: 'url(/assets/generated/travel-bg-resort-view-1.dim_1920x1080.jpg)'
        }}
      >
        <div className="container max-w-7xl mx-auto content-above-overlay">
          <h1 className="text-3xl font-bold mb-2">Hotels & Stays</h1>
          <p className="text-muted-foreground">Book your perfect accommodation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Room Type</CardTitle>
                <CardDescription>Choose from our available rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deluxe" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="deluxe">Deluxe</TabsTrigger>
                    <TabsTrigger value="suite">Suite</TabsTrigger>
                    <TabsTrigger value="cottage">Cottage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="deluxe" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {roomTypes?.filter(r => r.name.toLowerCase().includes('deluxe')).map((room) => (
                        <RoomCard key={room.name} room={room} selected={selectedRoom?.name === room.name} onSelect={setSelectedRoom} />
                      )) || <PlaceholderRoom type="Deluxe Room" onSelect={setSelectedRoom} />}
                    </div>
                  </TabsContent>
                  <TabsContent value="suite" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {roomTypes?.filter(r => r.name.toLowerCase().includes('suite')).map((room) => (
                        <RoomCard key={room.name} room={room} selected={selectedRoom?.name === room.name} onSelect={setSelectedRoom} />
                      )) || <PlaceholderRoom type="Executive Suite" onSelect={setSelectedRoom} />}
                    </div>
                  </TabsContent>
                  <TabsContent value="cottage" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {roomTypes?.filter(r => r.name.toLowerCase().includes('cottage')).map((room) => (
                        <RoomCard key={room.name} room={room} selected={selectedRoom?.name === room.name} onSelect={setSelectedRoom} />
                      )) || <PlaceholderRoom type="Garden Cottage" onSelect={setSelectedRoom} />}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Guest Reviews Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Guest Reviews</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-foreground">{averageRating}</span>
                      </div>
                      <span>Overall rating from our guests</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate({ to: '/hotel-reviews' })}
                >
                  View all reviews
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => !checkIn || date <= checkIn} />
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedRoom && numberOfNights > 0 && (
                  <>
                    <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                      <p className="font-medium">{selectedRoom.name}</p>
                      <p className="text-sm text-muted-foreground">{numberOfNights} night{numberOfNights > 1 ? 's' : ''}</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(selectedRoom.pricePerNight)}/night</p>
                    </div>

                    <div className="rounded-lg border p-4 space-y-3">
                      <p className="font-semibold text-sm">Payment</p>
                      <Alert className="py-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          A 10% deposit is required to confirm your booking.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-primary">
                          <span>Deposit (10%):</span>
                          <span className="font-semibold">{formatCurrency(depositAmount)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Remaining Amount:</span>
                          <span>{formatCurrency(remainingAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Button onClick={handleBooking} disabled={bookHotel.isPending || !selectedRoom || !checkIn || !checkOut || numberOfNights <= 0} className="w-full">
                  {bookHotel.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please sign in to complete your booking
                  </p>
                )}
              </CardContent>
            </Card>

            {/* My Bookings */}
            {isAuthenticated && myBookings && myBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myBookings.slice(0, 3).map((booking) => (
                    <div key={booking.bookingId} className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">{booking.roomType}</p>
                      <p className="text-muted-foreground">{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</p>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="mt-2">
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, selected, onSelect }: { room: RoomType; selected: boolean; onSelect: (room: RoomType) => void }) {
  // Get rating for this room type
  const roomRating = getRoomTypeRating(room.name);
  
  return (
    <Card className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-primary' : ''}`} onClick={() => onSelect(room)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{room.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{roomRating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {room.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(room.pricePerNight)}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
          </div>
          {selected && (
            <div className="flex items-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderRoom({ type, onSelect }: { type: string; onSelect: (room: RoomType) => void }) {
  const placeholderRoom: RoomType = {
    name: type,
    features: ['King Bed', 'WiFi', 'AC', 'TV'],
    pricePerNight: BigInt(5000),
    imageUrls: [],
  };

  return <RoomCard room={placeholderRoom} selected={false} onSelect={onSelect} />;
}
