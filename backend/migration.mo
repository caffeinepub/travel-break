import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

  type RoomType = {
    name : Text;
    features : [Text];
    pricePerNight : Nat;
    offerPrice : Nat;
    imageUrls : [Text];
  };

  type CabType = {
    name : Text;
    capacity : Nat;
    pricePerTrip : Nat;
    offerPrice : Nat;
    imageUrl : Text;
  };

  type PaymentPlan = {
    #fullUpfront;
    #depositRequired;
    #partialUpfront;
    #cod;
  };

  type HotelBooking = {
    bookingId : Text;
    guest : Principal;
    roomType : Text;
    checkInDate : Int;
    checkOutDate : Int;
    totalPrice : Nat;
    status : BookingStatus;
    bookingDate : Int;
    depositPercentage : Nat;
    depositAmount : Nat;
    remainingAmount : Nat;
    paymentPlan : PaymentPlan;
  };

  type CabBooking = {
    bookingId : Text;
    guest : Principal;
    cabType : Text;
    pickupLocation : Text;
    dropoffLocation : Text;
    pickupTime : Int;
    totalPrice : Nat;
    status : BookingStatus;
    bookingDate : Int;
  };

  type ActingDriverRequest = {
    requestId : Text;
    guest : Principal;
    vehicleType : Text;
    serviceDetails : Text;
    serviceDate : Int;
    status : BookingStatus;
    bookingDate : Int;
  };

  type Product = {
    productId : Text;
    name : Text;
    description : Text;
    price : Nat;
    offerPrice : Nat;
    imageUrls : [Text];
    category : Text;
  };

  type SalesOrder = {
    orderId : Text;
    customer : Principal;
    products : [Product];
    deliveryAddress : Text;
    contactNumber : Text;
    email : Text;
    totalPrice : Nat;
    status : BookingStatus;
    orderDate : Int;
    paymentPlan : PaymentPlan;
    upfrontAmount : Nat;
    remainingAmount : Nat;
  };

  type Inquiry = {
    inquiryId : Text;
    customer : Principal;
    message : Text;
    contactInfo : Text;
    timestamp : Int;
    status : {
      #new;
      #reviewed;
      #closed;
    };
  };

  type PaymentRecord = {
    paymentId : Text;
    customer : Principal;
    reference : Text;
    note : Text;
    amount : Nat;
    timestamp : Int;
    status : {
      #new;
      #verified;
      #rejected;
    };
  };

  type CabAvailability = {
    cabType : Text;
    availableCount : Nat;
  };

  type DateRange = {
    checkIn : Int;
    checkOut : Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    roomTypes : Map.Map<Text, RoomType>;
    cabTypes : Map.Map<Text, CabType>;
    hotelBookings : Map.Map<Text, HotelBooking>;
    cabBookings : Map.Map<Text, CabBooking>;
    actingDriverRequests : Map.Map<Text, ActingDriverRequest>;
    salesOrders : Map.Map<Text, SalesOrder>;
    inquiries : Map.Map<Text, Inquiry>;
    payments : Map.Map<Text, PaymentRecord>;
    cabAvailabilityState : Map.Map<Text, CabAvailability>;
    roomAvailability : Map.Map<Text, [DateRange]>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    roomTypes : Map.Map<Text, RoomType>;
    cabTypes : Map.Map<Text, CabType>;
    hotelBookings : Map.Map<Text, HotelBooking>;
    cabBookings : Map.Map<Text, CabBooking>;
    actingDriverRequests : Map.Map<Text, ActingDriverRequest>;
    salesOrders : Map.Map<Text, SalesOrder>;
    inquiries : Map.Map<Text, Inquiry>;
    payments : Map.Map<Text, PaymentRecord>;
    cabAvailabilityState : Map.Map<Text, CabAvailability>;
    roomAvailability : Map.Map<Text, [DateRange]>;
    adminUsername : Text;
    adminPassword : Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      adminUsername = "admin";
      adminPassword = "Stud&nt@2023";
    };
  };
};
