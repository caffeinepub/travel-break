import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

  public type RoomType = {
    name : Text;
    features : [Text];
    pricePerNight : Nat;
    imageUrls : [Text];
  };

  public type CabType = {
    name : Text;
    capacity : Nat;
    pricePerTrip : Nat;
    imageUrl : Text;
  };

  public type PaymentPlan = {
    #fullUpfront;
    #depositRequired;
    #partialUpfront;
    #cod;
  };

  public type HotelBooking = {
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

  public type CabBooking = {
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

  public type ActingDriverRequest = {
    requestId : Text;
    guest : Principal;
    serviceDetails : Text;
    serviceDate : Int;
    status : BookingStatus;
    bookingDate : Int;
  };

  public type ProductCategory = {
    name : Text;
    products : [Product];
  };

  public type Product = {
    productId : Text;
    name : Text;
    description : Text;
    price : Nat;
    imageUrls : [Text];
    category : Text;
  };

  public type SalesOrder = {
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

  public type Inquiry = {
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

  public type PaymentRecord = {
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

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let roomTypes = Map.empty<Text, RoomType>();
  let cabTypes = Map.empty<Text, CabType>();

  let hotelBookings = Map.empty<Text, HotelBooking>();
  let cabBookings = Map.empty<Text, CabBooking>();
  let actingDriverRequests = Map.empty<Text, ActingDriverRequest>();
  let salesOrders = Map.empty<Text, SalesOrder>();
  let inquiries = Map.empty<Text, Inquiry>();
  let payments = Map.empty<Text, PaymentRecord>();

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper functions
  func generateId(prefix : Text) : Text {
    prefix # "-" # Time.now().toText();
  };

  // USER FUNCTIONS

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public query functions (accessible to all including guests)
  public query ({ caller }) func getRoomTypes() : async [RoomType] {
    roomTypes.values().toArray();
  };

  public query ({ caller }) func getCabTypes() : async [CabType] {
    cabTypes.values().toArray();
  };

  // Booking functions (require authenticated users)
  public shared ({ caller }) func bookHotel(roomType : Text, checkInDate : Int, checkOutDate : Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book hotels");
    };
    let bookingId = generateId("hotel");
    let booking : HotelBooking = {
      bookingId;
      guest = caller;
      roomType;
      checkInDate;
      checkOutDate;
      totalPrice = 10000;
      status = #pending;
      bookingDate = Time.now();
      depositPercentage = 10;
      depositAmount = 1000;
      remainingAmount = 9000;
      paymentPlan = #depositRequired;
    };
    hotelBookings.add(bookingId, booking);
    bookingId;
  };

  public shared ({ caller }) func bookCab(cabType : Text, pickupLocation : Text, dropoffLocation : Text, pickupTime : Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book cabs");
    };
    let bookingId = generateId("cab");
    let booking : CabBooking = {
      bookingId;
      guest = caller;
      cabType;
      pickupLocation;
      dropoffLocation;
      pickupTime;
      totalPrice = 5000;
      status = #pending;
      bookingDate = Time.now();
    };
    cabBookings.add(bookingId, booking);
    bookingId;
  };

  public shared ({ caller }) func requestActingDriver(serviceDetails : Text, serviceDate : Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request acting drivers");
    };
    let requestId = generateId("driver");
    let request : ActingDriverRequest = {
      requestId;
      guest = caller;
      serviceDetails;
      serviceDate;
      status = #pending;
      bookingDate = Time.now();
    };
    actingDriverRequests.add(requestId, request);
    requestId;
  };

  public shared ({ caller }) func createSalesOrder(
    products : [Product],
    deliveryAddress : Text,
    contactNumber : Text,
    email : Text,
    totalPrice : Nat,
    paymentPlan : PaymentPlan,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sales orders");
    };
    let (upfrontAmount, remainingAmount) = switch (paymentPlan) {
      case (#fullUpfront) { (totalPrice, 0) };
      case (#partialUpfront) {
        let upfront = totalPrice * 40 / 100;
        let remaining = totalPrice - upfront;
        (upfront, remaining);
      };
      case (#cod) { (0, totalPrice) };
      case (#depositRequired) { (totalPrice, 0) };
    };
    let orderId = generateId("order");
    let order : SalesOrder = {
      orderId;
      customer = caller;
      products;
      deliveryAddress;
      contactNumber;
      email;
      totalPrice;
      status = #pending;
      orderDate = Time.now();
      paymentPlan;
      upfrontAmount;
      remainingAmount;
    };
    salesOrders.add(orderId, order);
    orderId;
  };

  public shared ({ caller }) func submitInquiry(message : Text, contactInfo : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit inquiries");
    };
    let inquiryId = generateId("inquiry");
    let inquiry : Inquiry = {
      inquiryId;
      customer = caller;
      message;
      contactInfo;
      timestamp = Time.now();
      status = #new;
    };
    inquiries.add(inquiryId, inquiry);
    inquiryId;
  };

  public shared ({ caller }) func submitPayment(reference : Text, note : Text, amount : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit payments");
    };
    let paymentId = generateId("payment");
    let payment : PaymentRecord = {
      paymentId;
      customer = caller;
      reference;
      note;
      amount;
      timestamp = Time.now();
      status = #new;
    };
    payments.add(paymentId, payment);
    paymentId;
  };

  // User query functions (users can view their own data)
  public query ({ caller }) func getMyHotelBookings() : async [HotelBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bookings");
    };
    hotelBookings.values().filter(func(b : HotelBooking) : Bool { b.guest == caller }).toArray();
  };

  public query ({ caller }) func getMyCabBookings() : async [CabBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bookings");
    };
    cabBookings.values().filter(func(b : CabBooking) : Bool { b.guest == caller }).toArray();
  };

  public query ({ caller }) func getMyActingDriverRequests() : async [ActingDriverRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their requests");
    };
    actingDriverRequests.values().filter(func(r : ActingDriverRequest) : Bool { r.guest == caller }).toArray();
  };

  public query ({ caller }) func getMySalesOrders() : async [SalesOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    salesOrders.values().filter(func(o : SalesOrder) : Bool { o.customer == caller }).toArray();
  };

  public query ({ caller }) func getMyInquiries() : async [Inquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their inquiries");
    };
    inquiries.values().filter(func(i : Inquiry) : Bool { i.customer == caller }).toArray();
  };

  public query ({ caller }) func getMyPayments() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their payments");
    };
    payments.values().filter(func(p : PaymentRecord) : Bool { p.customer == caller }).toArray();
  };

  // NEW: Sales Order Modifications for Caller
  // Caller can update their own sales order date (if status is still pending)
  public shared ({ caller }) func updateCallerSalesOrderDate(orderId : Text, newDate : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can modify sales orders"
      );
    };
    switch (salesOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Sales order not found");
      };
      case (?order) {
        if (order.customer != caller) {
          Runtime.trap("Unauthorized: You can only modify your own orders");
        };
        if (order.status != #pending) {
          Runtime.trap("Order modification not allowed: Order is not pending");
        };
        let updatedOrder = {
          order with orderDate = newDate;
        };
        salesOrders.add(orderId, updatedOrder);
      };
    };
  };

  // Caller can cancel their own sales order (if status is still pending)
  public shared ({ caller }) func cancelCallerSalesOrder(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can cancel sales orders"
      );
    };
    switch (salesOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Sales order not found");
      };
      case (?order) {
        if (order.customer != caller) {
          Runtime.trap("Unauthorized: You can only cancel your own orders");
        };
        if (order.status != #pending) {
          Runtime.trap("Order cancellation not allowed: Order is not pending");
        };
        let cancelledOrder = {
          order with status = #cancelled;
        };
        salesOrders.add(orderId, cancelledOrder);
      };
    };
  };

  // ADMIN FUNCTIONS

  public query ({ caller }) func getAllHotelBookings() : async [HotelBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    hotelBookings.values().toArray();
  };

  public query ({ caller }) func getAllCabBookings() : async [CabBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    cabBookings.values().toArray();
  };

  public query ({ caller }) func getAllActingDriverRequests() : async [ActingDriverRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    actingDriverRequests.values().toArray();
  };

  public query ({ caller }) func getAllSalesOrders() : async [SalesOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    salesOrders.values().toArray();
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all inquiries");
    };
    inquiries.values().toArray();
  };

  public query ({ caller }) func getAllPayments() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray();
  };

  // Admin management functions
  public shared ({ caller }) func updateHotelBookingStatus(bookingId : Text, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (hotelBookings.get(bookingId)) {
      case (?booking) {
        let updated = {
          booking with status = status;
        };
        hotelBookings.add(bookingId, updated);
      };
      case null {
        Runtime.trap("Booking not found");
      };
    };
  };

  public shared ({ caller }) func updateCabBookingStatus(bookingId : Text, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (cabBookings.get(bookingId)) {
      case (?booking) {
        let updated = {
          booking with status = status;
        };
        cabBookings.add(bookingId, updated);
      };
      case null {
        Runtime.trap("Booking not found");
      };
    };
  };

  public shared ({ caller }) func updateActingDriverRequestStatus(requestId : Text, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update request status");
    };
    switch (actingDriverRequests.get(requestId)) {
      case (?request) {
        let updated = {
          request with status = status;
        };
        actingDriverRequests.add(requestId, updated);
      };
      case null {
        Runtime.trap("Request not found");
      };
    };
  };

  public shared ({ caller }) func updateSalesOrderStatus(orderId : Text, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (salesOrders.get(orderId)) {
      case (?order) {
        let updated = {
          order with status = status;
        };
        salesOrders.add(orderId, updated);
      };
      case null {
        Runtime.trap("Order not found");
      };
    };
  };

  public shared ({ caller }) func updateInquiryStatus(inquiryId : Text, status : { #new; #reviewed; #closed }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update inquiry status");
    };
    switch (inquiries.get(inquiryId)) {
      case (?inquiry) {
        let updated = {
          inquiry with status = status;
        };
        inquiries.add(inquiryId, updated);
      };
      case null {
        Runtime.trap("Inquiry not found");
      };
    };
  };

  public shared ({ caller }) func updatePaymentStatus(paymentId : Text, status : { #new; #verified; #rejected }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };
    switch (payments.get(paymentId)) {
      case (?payment) {
        let updated = {
          payment with status = status;
        };
        payments.add(paymentId, updated);
      };
      case null {
        Runtime.trap("Payment not found");
      };
    };
  };
};
