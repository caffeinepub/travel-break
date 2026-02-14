import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, RoomType, CabType, HotelBooking, CabBooking, ActingDriverRequest, SalesOrder, Inquiry, PaymentRecord, Product, PaymentPlan } from '../backend';

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

export function useBookHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomType, checkInDate, checkOutDate }: { roomType: string; checkInDate: bigint; checkOutDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookHotel(roomType, checkInDate, checkOutDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHotelBookings'] });
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

export function useBookCab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cabType, pickupLocation, dropoffLocation, pickupTime }: { cabType: string; pickupLocation: string; dropoffLocation: string; pickupTime: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookCab(cabType, pickupLocation, dropoffLocation, pickupTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCabBookings'] });
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
export function useRequestActingDriver() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceDetails, serviceDate }: { serviceDetails: string; serviceDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestActingDriver(serviceDetails, serviceDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myActingDriverRequests'] });
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
