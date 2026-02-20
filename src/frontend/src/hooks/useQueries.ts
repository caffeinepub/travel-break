import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, RoomType, CabType, HotelBooking, CabBooking, ActingDriverRequest, SalesOrder, Inquiry, PaymentRecord, Product, PaymentPlan, CabAvailability, DateRange } from '../backend';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Hotel
export function useGetRoomTypes() {
  const { actor, isFetching } = useActor();

  return useQuery<RoomType[]>({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoomTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRoomAvailability(roomType: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DateRange[]>({
    queryKey: ['roomAvailability', roomType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoomAvailability(roomType);
    },
    enabled: !!actor && !isFetching && !!roomType,
  });
}

export function useBookHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomType, checkInDate, checkOutDate }: { roomType: string; checkInDate: bigint; checkOutDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookHotel(roomType, checkInDate, checkOutDate);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myHotelBookings'] });
      // Invalidate availability for the specific room type
      queryClient.invalidateQueries({ queryKey: ['roomAvailability', variables.roomType] });
    },
  });
}

export function useGetMyHotelBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<HotelBooking[]>({
    queryKey: ['myHotelBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyHotelBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Cab
export function useGetCabTypes() {
  const { actor, isFetching } = useActor();

  return useQuery<CabType[]>({
    queryKey: ['cabTypes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCabTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCabAvailability() {
  const { actor, isFetching } = useActor();

  return useQuery<CabAvailability[]>({
    queryKey: ['cabAvailability'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCabAvailability();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get blocked dates for cab bookings by cab type
export function useGetCabBlockedDates(cabType: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['cabBlockedDates', cabType],
    queryFn: async () => {
      if (!actor) return [];
      // Get all cab bookings and filter by type and status
      const allBookings = await actor.getAllCabBookings();
      return allBookings
        .filter(b => b.cabType === cabType && (b.status === 'pending' || b.status === 'confirmed'))
        .map(b => b.pickupTime);
    },
    enabled: !!actor && !isFetching && !!cabType,
  });
}

export function useBookCab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cabType, pickupLocation, dropoffLocation, pickupTime }: { cabType: string; pickupLocation: string; dropoffLocation: string; pickupTime: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookCab(cabType, pickupLocation, dropoffLocation, pickupTime);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myCabBookings'] });
      queryClient.invalidateQueries({ queryKey: ['cabAvailability'] });
      // Invalidate blocked dates for the specific cab type
      queryClient.invalidateQueries({ queryKey: ['cabBlockedDates', variables.cabType] });
    },
  });
}

export function useGetMyCabBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<CabBooking[]>({
    queryKey: ['myCabBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCabBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Acting Driver
// Get blocked dates for acting driver requests
export function useGetActingDriverBlockedDates() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['actingDriverBlockedDates'],
    queryFn: async () => {
      if (!actor) return [];
      // Get all acting driver requests and filter by status
      const allRequests = await actor.getAllActingDriverRequests();
      return allRequests
        .filter(r => r.status === 'pending' || r.status === 'confirmed')
        .map(r => r.serviceDate);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestActingDriver() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleType, serviceDetails, serviceDate }: { vehicleType: string; serviceDetails: string; serviceDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestActingDriver(vehicleType, serviceDetails, serviceDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myActingDriverRequests'] });
      // Invalidate blocked dates
      queryClient.invalidateQueries({ queryKey: ['actingDriverBlockedDates'] });
    },
  });
}

export function useGetMyActingDriverRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<ActingDriverRequest[]>({
    queryKey: ['myActingDriverRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyActingDriverRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

// Sales Orders
export function useCreateSalesOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ products, deliveryAddress, contactNumber, email, totalPrice, paymentPlan }: { products: Product[]; deliveryAddress: string; contactNumber: string; email: string; totalPrice: bigint; paymentPlan: PaymentPlan }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSalesOrder(products, deliveryAddress, contactNumber, email, totalPrice, paymentPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySalesOrders'] });
    },
  });
}

export function useGetMySalesOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<SalesOrder[]>({
    queryKey: ['mySalesOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySalesOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSalesOrderDate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newDate }: { orderId: string; newDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCallerSalesOrderDate(orderId, newDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySalesOrders'] });
    },
  });
}

export function useCancelSalesOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelCallerSalesOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySalesOrders'] });
    },
  });
}

// Customer Care
export function useSubmitInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, contactInfo }: { message: string; contactInfo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitInquiry(message, contactInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInquiries'] });
    },
  });
}

export function useGetMyInquiries() {
  const { actor, isFetching } = useActor();

  return useQuery<Inquiry[]>({
    queryKey: ['myInquiries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyInquiries();
    },
    enabled: !!actor && !isFetching,
  });
}

// Payments
export function useSubmitPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reference, note, amount }: { reference: string; note: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPayment(reference, note, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
    },
  });
}

export function useGetMyPayments() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentRecord[]>({
    queryKey: ['myPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayments();
    },
    enabled: !!actor && !isFetching,
  });
}
