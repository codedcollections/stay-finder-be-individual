import type { Database } from "./database.types.js";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];

type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];

export type NewBooking = Omit<BookingInsert, "booking_id" | "created_at">

export type BookingValidKey = keyof Booking;

export type BookingWithProperty = Booking & {
    properties: {
        title: string;
        city: string;
        country: string;
        image_url: string | null;
        kind: string;
        price_per_night: number;
    } | null;
};