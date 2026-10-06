import type {
  PostgrestFilterBuilder,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

import { sb } from "../lib/supabase.js";

const TABLE_NAME = "properties";

const SELECT_QUERY_LIST: PropertyValidKey[] = [
  "property_id",
  "title",
  "description",
  "city",
  "country",
  "price_per_night",
  "max_guests",
  "kind",
  "created_at",
];

const SELECT_QUERY = SELECT_QUERY_LIST.join(", ");
const QUERY_ID = "property_id";
const QUERY_KIND = "kind";

type PropertyListFilter = Partial<{
  maxPrice: number;
  city: string;
  maxGuests: number;
}>;

function buildPropertiesFilter(
  query: PostgrestFilterBuilder<any, any, any, any>,
  filters: PropertyListFilter,
) {
  if (filters.maxPrice) {
    query = query.lte("price_per_night", filters.maxPrice);
  }

  if (filters.maxGuests) {
    query = query.lte("max_guests", filters.maxGuests);
  }

  if (filters.city && filters.city.trim().length > 2) {
    query = query.ilike("city", `%${filters.city}%`);
  }
}

export async function getProperties(
  filters: PropertyListFilter,
): Promise<Property[]> {
  let query = sb.from(TABLE_NAME).select(SELECT_QUERY);

  buildPropertiesFilter(query, filters);

  const { error, data } = await query;

  if (!error) {
    return data as any as Property[];
  }
  throw error;
}

export async function getPropertiesByKind(
  kind: PropertyKind,
  filters: PropertyListFilter,
): Promise<Property[]> {
  const query = sb.from(TABLE_NAME).select(SELECT_QUERY).eq(QUERY_KIND, kind);

  buildPropertiesFilter(query, filters);

  const { error, data } = await query;

  if (!error) {
    return data as any as Property[];
  }
  throw error;
}

export async function getPropertyById(propertyId: string): Promise<Property> {
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

export async function createProperty(propertyBody: NewProperty) {
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

export async function deletePropertyById(propertyId: string) {
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
