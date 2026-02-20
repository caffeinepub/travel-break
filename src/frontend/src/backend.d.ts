import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CabBooking {
    status: BookingStatus;
    bookingId: string;
    dropoffLocation: string;
    cabType: string;
    bookingDate: bigint;
    guest: Principal;
    pickupTime: bigint;
    totalPrice: bigint;
    pickupLocation: string;
}
export interface HotelBooking {
    status: BookingStatus;
    depositAmount: bigint;
    bookingId: string;
    remainingAmount: bigint;
    checkInDate: bigint;
    bookingDate: bigint;
    guest: Principal;
    paymentPlan: PaymentPlan;
    checkOutDate: bigint;
    totalPrice: bigint;
    roomType: string;
    depositPercentage: bigint;
}
export interface PaymentRecord {
    status: Variant_new_verified_rejected;
    customer: Principal;
    note: string;
    reference: string;
    paymentId: string;
    timestamp: bigint;
    amount: bigint;
}
export interface SalesOrder {
    status: BookingStatus;
    deliveryAddress: string;
    remainingAmount: bigint;
    customer: Principal;
    orderDate: bigint;
    email: string;
    orderId: string;
    upfrontAmount: bigint;
    paymentPlan: PaymentPlan;
    contactNumber: string;
    products: Array<Product>;
    totalPrice: bigint;
}
export interface CabAvailability {
    availableCount: bigint;
    cabType: string;
}
export interface RoomType {
    features: Array<string>;
    imageUrls: Array<string>;
    pricePerNight: bigint;
    name: string;
    offerPrice: bigint;
}
export interface CabType {
    name: string;
    pricePerTrip: bigint;
    imageUrl: string;
    offerPrice: bigint;
    capacity: bigint;
}
export interface DateRange {
    checkIn: bigint;
    checkOut: bigint;
}
export interface ActingDriverRequest {
    status: BookingStatus;
    serviceDate: bigint;
    vehicleType: string;
    requestId: string;
    serviceDetails: string;
    bookingDate: bigint;
    guest: Principal;
}
export interface Inquiry {
    status: Variant_new_closed_reviewed;
    contactInfo: string;
    customer: Principal;
    message: string;
    timestamp: bigint;
    inquiryId: string;
}
export interface Product {
    imageUrls: Array<string>;
    name: string;
    description: string;
    productId: string;
    offerPrice: bigint;
    category: string;
    price: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    confirmed = "confirmed"
}
export enum PaymentPlan {
    cod = "cod",
    partialUpfront = "partialUpfront",
    depositRequired = "depositRequired",
    fullUpfront = "fullUpfront"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_new_closed_reviewed {
    new_ = "new",
    closed = "closed",
    reviewed = "reviewed"
}
export enum Variant_new_verified_rejected {
    new_ = "new",
    verified = "verified",
    rejected = "rejected"
}
export interface backendInterface {
    addRoomAvailability(roomType: string, dateRanges: Array<DateRange>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookCab(cabType: string, pickupLocation: string, dropoffLocation: string, pickupTime: bigint): Promise<string>;
    bookHotel(roomType: string, checkInDate: bigint, checkOutDate: bigint): Promise<string>;
    cancelCallerSalesOrder(orderId: string): Promise<void>;
    createSalesOrder(products: Array<Product>, deliveryAddress: string, contactNumber: string, email: string, totalPrice: bigint, paymentPlan: PaymentPlan): Promise<string>;
    getAllActingDriverRequests(): Promise<Array<ActingDriverRequest>>;
    getAllCabBookings(): Promise<Array<CabBooking>>;
    getAllHotelBookings(): Promise<Array<HotelBooking>>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getAllPayments(): Promise<Array<PaymentRecord>>;
    getAllRoomAvailability(): Promise<Array<[string, Array<DateRange>]>>;
    getAllSalesOrders(): Promise<Array<SalesOrder>>;
    getCabAvailability(): Promise<Array<CabAvailability>>;
    getCabTypes(): Promise<Array<CabType>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyActingDriverRequests(): Promise<Array<ActingDriverRequest>>;
    getMyCabBookings(): Promise<Array<CabBooking>>;
    getMyHotelBookings(): Promise<Array<HotelBooking>>;
    getMyInquiries(): Promise<Array<Inquiry>>;
    getMyPayments(): Promise<Array<PaymentRecord>>;
    getMySalesOrders(): Promise<Array<SalesOrder>>;
    getRoomAvailability(roomType: string): Promise<Array<DateRange>>;
    getRoomTypes(): Promise<Array<RoomType>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestActingDriver(vehicleType: string, serviceDetails: string, serviceDate: bigint): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCabAvailability(cabType: string, availableCount: bigint): Promise<void>;
    submitInquiry(message: string, contactInfo: string): Promise<string>;
    submitPayment(reference: string, note: string, amount: bigint): Promise<string>;
    updateActingDriverRequestStatus(requestId: string, status: BookingStatus): Promise<void>;
    updateCabBookingStatus(bookingId: string, status: BookingStatus): Promise<void>;
    updateCallerSalesOrderDate(orderId: string, newDate: bigint): Promise<void>;
    updateHotelBookingStatus(bookingId: string, status: BookingStatus): Promise<void>;
    updateInquiryStatus(inquiryId: string, status: Variant_new_closed_reviewed): Promise<void>;
    updatePaymentStatus(paymentId: string, status: Variant_new_verified_rejected): Promise<void>;
    updateSalesOrderStatus(orderId: string, status: BookingStatus): Promise<void>;
}
