import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { HotelBooking, CabBooking, ActingDriverRequest, SalesOrder, Inquiry, PaymentRecord } from '../backend';

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
