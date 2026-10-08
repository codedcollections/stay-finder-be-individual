type PropertyKind = "apartment" | "villa";

type Property = {
  user_id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  property_id: string
  kind: PropertyKind;
  created_at: string;
}

type NewProperty = Omit<Property, "property_id" | "created_at" | "user_id"> & {
  user_id?: string;
}

type PropertyValidKey = keyof Property