import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type {
  HotelBooking,
  CabBooking,
  ActingDriverRequest,
  SalesOrder,
  Inquiry,
  PaymentRecord,
  BookingStatus,
  Variant_new_closed_reviewed,
  Variant_new_verified_rejected,
  RoomType,
  CabType,
} from '../backend';
import { UserRole } from '../backend';

// Query hooks for fetching all records (admin only)
export function useGetAllHotelBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<HotelBooking[]>({
    queryKey: ['allHotelBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHotelBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllCabBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<CabBooking[]>({
    queryKey: ['allCabBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCabBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllActingDriverRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<ActingDriverRequest[]>({
    queryKey: ['allActingDriverRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActingDriverRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSalesOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<SalesOrder[]>({
    queryKey: ['allSalesOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSalesOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllInquiries() {
  const { actor, isFetching } = useActor();

  return useQuery<Inquiry[]>({
    queryKey: ['allInquiries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInquiries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentRecord[]>({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

// Query hooks for room types and cab types
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

// Mutation hooks for creating room types and cab types
export function useCreateRoomType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomType: RoomType) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Backend method not yet implemented
      if (!actor.createRoomType) {
        throw new Error('Backend method createRoomType not yet implemented. Please update the backend.');
      }
      // @ts-ignore
      return actor.createRoomType(roomType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
    },
  });
}

export function useDeleteRoomType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Backend method not yet implemented
      if (!actor.deleteRoomType) {
        throw new Error('Backend method deleteRoomType not yet implemented. Please update the backend.');
      }
      // @ts-ignore
      return actor.deleteRoomType(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
    },
  });
}

export function useCreateCabType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cabType: CabType) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Backend method not yet implemented
      if (!actor.createCabType) {
        throw new Error('Backend method createCabType not yet implemented. Please update the backend.');
      }
      // @ts-ignore
      return actor.createCabType(cabType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabTypes'] });
    },
  });
}

export function useDeleteCabType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-ignore - Backend method not yet implemented
      if (!actor.deleteCabType) {
        throw new Error('Backend method deleteCabType not yet implemented. Please update the backend.');
      }
      // @ts-ignore
      return actor.deleteCabType(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabTypes'] });
    },
  });
}

// Admin management hooks
export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      await actor.assignCallerUserRole(principal, UserRole.admin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminList'] });
    },
  });
}

// Mutation hooks for updating statuses (admin only)
export function useUpdateHotelBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status, roomType }: { bookingId: string; status: BookingStatus; roomType: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateHotelBookingStatus(bookingId, status);
      return { roomType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allHotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myHotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability', data.roomType] });
      queryClient.invalidateQueries({ queryKey: ['allRoomAvailability'] });
    },
  });
}

export function useUpdateCabBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status, cabType }: { bookingId: string; status: BookingStatus; cabType: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateCabBookingStatus(bookingId, status);
      return { cabType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allCabBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myCabBookings'] });
      queryClient.invalidateQueries({ queryKey: ['cabBlockedDates', data.cabType] });
    },
  });
}

export function useUpdateActingDriverRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateActingDriverRequestStatus(requestId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allActingDriverRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myActingDriverRequests'] });
      queryClient.invalidateQueries({ queryKey: ['actingDriverBlockedDates'] });
    },
  });
}

export function useUpdateSalesOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSalesOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSalesOrders'] });
      queryClient.invalidateQueries({ queryKey: ['mySalesOrders'] });
    },
  });
}

export function useUpdateInquiryStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, status }: { inquiryId: string; status: Variant_new_closed_reviewed }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateInquiryStatus(inquiryId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['myInquiries'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: Variant_new_verified_rejected }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePaymentStatus(paymentId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
    },
  });
}
