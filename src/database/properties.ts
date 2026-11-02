import { sb } from "../lib/supabase.js";

import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { PaginatedListResponse } from "../types/global.js";
import type { BasicSupabaseClient } from "../types/supabase.js";
import type { NewProperty, Property, PropertyKind, PropertyValidKey, PropertyListQuery } from "../types/property.js";

const TABLE_NAME = "properties";
const QUERY_ID = "property_id";
const QUERY_KIND = "kind";

const SELECT_QUERY_LIST: PropertyValidKey[] = [
  "property_id",
  "title",
  "description",
  "city",
  "country",
  "image_url",
  "price_per_night",
  "max_guests",
  "kind",
  "created_at",
  "user_id"
];
const SELECT_QUERY = SELECT_QUERY_LIST.join(", ");


function selectProperties(sb: BasicSupabaseClient) {
  return sb.from(TABLE_NAME).select("*", { count: "exact" });
}

/* type PropertyListFilter = Partial<{
  maxPrice: number;
  city: string;
  maxGuests: number;
}>; */

function buildPropertiesFilter(
  supabaseQuery: ReturnType<typeof selectProperties>,
  query: PropertyListQuery,
) {
  if (query.city?.trim()) {
    supabaseQuery = supabaseQuery.eq("city", query.city.trim());
  }

  if (query.max_guests !== undefined) {
    supabaseQuery = supabaseQuery.gte(
      "max_guests",
      query.max_guests,
    );
  }

  if (query.min_price !== undefined) {
    supabaseQuery = supabaseQuery.gte(
      "price_per_night",
      query.min_price,
    );
  }

  if (query.max_price !== undefined) {
    supabaseQuery = supabaseQuery.lte(
      "price_per_night",
      query.max_price,
    );
  }

  if (query.q?.trim()) {
    const searchPattern = `%${query.q.trim()}%`;

    supabaseQuery = supabaseQuery.or(
      `title.ilike.${searchPattern},description.ilike.${searchPattern},city.ilike.${searchPattern}`,
    );
  }

  supabaseQuery = supabaseQuery.order(query.sort_by, {
    ascending: query.sort_order === "asc",
  });

  const startIndex = query.offset;
  const endIndex = startIndex + query.limit - 1;

  return supabaseQuery.range(startIndex, endIndex);
}

export async function getProperties(
  sb: BasicSupabaseClient,
  query: PropertyListQuery,
): Promise<PaginatedListResponse<Property>> {
  const supabaseQuery = buildPropertiesFilter(
    selectProperties(sb),
    query,
  );

  const { data, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    count: count ?? 0,
    offset: query.offset,
    limit: query.limit,
  };
}

const QUERY_USER_ID = "user_id";
export async function getPropertiesByUserId(
  userId: string,
): Promise<Property[]> {
  const { error, data } = await sb
    .from(TABLE_NAME)
    .select(SELECT_QUERY)
    .eq(QUERY_USER_ID, userId)
    .order("created_at", { ascending: false });

  if (!error) {
    return data as any as Property[];
  }
  throw error;
}

export async function getPropertiesByKind(
  sb: BasicSupabaseClient,
  kind: PropertyKind,
  query: PropertyListQuery,
): Promise<PaginatedListResponse<Property>> {
  const supabaseQuery = buildPropertiesFilter(
    selectProperties(sb).eq(QUERY_KIND, kind),
    query,
  );

  const { data, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    count: count ?? 0,
    offset: query.offset,
    limit: query.limit,
  };
}

export async function getPropertyById(sb: BasicSupabaseClient, propertyId: string): Promise<Property> {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .select(SELECT_QUERY)
    .eq(QUERY_ID, propertyId)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function createProperty(sb: BasicSupabaseClient, propertyBody: NewProperty) {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .insert(propertyBody)
    .select(SELECT_QUERY)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function updatePropertyById(
  sb: BasicSupabaseClient,
  propertyId: string,
  property: Partial<Property>,
): Promise<Property> {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .update(property)
    .eq(QUERY_ID, propertyId)
    .select()
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function deletePropertyById(sb: BasicSupabaseClient, propertyId: string) {
  const { error }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .delete()
    .eq(QUERY_ID, propertyId)
    .select()
    .single();

  if (!error) {
    return;
  }
  throw error;
}
