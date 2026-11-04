import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import { sb } from "../lib/supabase.js";

import type { Booking, NewBooking, BookingValidKey, BookingWithProperty } from "../types/booking.js";
import type { BasicSupabaseClient } from "../types/supabase.js";

const TABLE_NAME = "bookings";

const SELECT_QUERY_LIST: BookingValidKey[] = [
  "booking_id",
  "property_id",
  "guest_name",
  "guest_email",
  "check_in",
  "check_out",
  "guests",
  "status",
  "created_at",
];

const SELECT_QUERY = SELECT_QUERY_LIST.join(", ");
const QUERY_ID = "booking_id";
const QUERY_PROPERTY_ID = "property_id";

export async function getBookingsByPropertyId(
  supabase: BasicSupabaseClient,
  propertyId: string,
): Promise<Booking[]> {
  const { error, data } = await supabase
    .from(TABLE_NAME)
    .select(SELECT_QUERY)
    .eq(QUERY_PROPERTY_ID, propertyId)
    .order("check_in");

  if (!error) {
    return data as any as Booking[];
  }
  throw error;
}

const QUERY_USER_ID = "user_id";
export async function getBookingsByUserId(
  supabase: BasicSupabaseClient,
  userId: string,
): Promise<BookingWithProperty[]> {
  const { error, data } = await supabase
    .from("bookings")
    .select(
      "booking_id, property_id, user_id, guest_name, guest_email, check_in, check_out, guests, status, created_at, properties(title, city, country, image_url, kind, price_per_night)",
    )
    .eq("user_id", userId)
    .order("check_in");

  if (error) {
    throw error;
  }

  return data;
}

export async function getBookingRequests(
  supabase: BasicSupabaseClient,
  ownerId: string,
) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `${SELECT_QUERY}, properties!inner(property_id, title)`,
    )
    .eq("properties.user_id", ownerId)
    .order("check_in");

  if (error) {
    throw error;
  }

  return data;
}

export async function createBooking(
  sb: BasicSupabaseClient,
  bookingBody: NewBooking,
): Promise<Booking> {
  console.log(bookingBody)
  const { error, data }: PostgrestSingleResponse<Booking> = await sb
    .from(TABLE_NAME)
    .insert(bookingBody)
    .select(SELECT_QUERY)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function updateBooking(
  propertyId: string,
  bookingId: string,
  sb: BasicSupabaseClient,
  booking: Partial<Booking>,
): Promise<Booking> {
  const { error, data }: PostgrestSingleResponse<Booking> = await sb
    .from(TABLE_NAME)
    .update(booking)
    .eq(QUERY_ID, bookingId)
    .eq(QUERY_PROPERTY_ID, propertyId)
    .select(SELECT_QUERY)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function deleteBooking(propertyId: string, bookingId: string, sb: BasicSupabaseClient,
  userId: string,) {
  const { error }: PostgrestSingleResponse<Booking> = await sb
    .from(TABLE_NAME)
    .delete()
    .eq(QUERY_ID, bookingId)
    .eq(QUERY_PROPERTY_ID, propertyId)
    .eq(QUERY_USER_ID, userId)
    .select()
    .single();

  if (!error) {
    return;
  }
  throw error;
}
