type Booking = {
  booking_id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

type NewBooking = Omit<Booking, "booking_id" | "created_at">

type BookingBody = Omit<NewBooking, "property_id">

type BookingValidKey = keyof Booking
