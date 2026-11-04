import { Hono } from "hono";

import {
  propertyOptionalValidator,
  propertyParamsValidator,
  propertyParamValidator,
  propertyValidator,
} from "../validators/propertyValidator.js";
import propertyQueryValidator from "../validators/propertyQueryValidator.js";
import {
  createProperty,
  deletePropertyById,
  getProperties,
  getPropertiesByUserId,
  getPropertiesByKind,
  getPropertyById,
  updatePropertyById,
} from "../database/properties.js";
import { requireAuth } from "../middleware/auth.js";

import type { User } from "@supabase/supabase-js";
import type { Property } from "../types/property.js";

const properties = new Hono({ strict: false });

properties.get("/mine", requireAuth, propertyQueryValidator, async (c) => {
  const user = c.get("user") as User;
  const supabase = c.get("supabase")

  try {
    const properties = await getPropertiesByUserId(
      supabase,
      user.id
    );

    return c.json(properties);
  } catch (e) {
    console.warn("Error fetching user's properties from SB database", e);
    return c.json({ error: "Failed to fetch properties" }, 500);
  }
});


properties.get("/", propertyQueryValidator, async (c) => {
  const query = c.req.valid("query")
  const sb = c.get("supabase");
  try {
    const properties = await getProperties(sb, query);
    return c.json(properties);
  } catch (e) {
    console.warn("Error fetching user's properties from SB database", e);
    return c.json({ error: "Failed to fetch properties" }, 500);
  }
});

// Hämtar properties baserat på om de är "villa" eller "apartment"
properties.get("/kind/:kind", propertyParamValidator, propertyQueryValidator, async (c) => {
  const query = c.req.valid("query")
  const kind = c.req.valid("param").kind;
  const sb = c.get("supabase");
  try {
    const properties = await getPropertiesByKind(sb, kind, query);
    return c.json(properties);
  } catch (e) {
    console.warn("Error fetching user's properties from SB database", e);
    return c.json({ error: "Failed to fetch properties" }, 500);
  }
});


// individuell GET hämta en Property om den finns baserat på ID
properties.get("/:id", async (c) => {
  const propertyId = c.req.param("id");
  const sb = c.get("supabase");
  try {
    const property = await getPropertyById(sb, propertyId);
    return c.json(property);
  } catch (e) {
    console.warn("Error fetching user's properties from SB database", e);
    return c.json({ error: "Failed to fetch properties" }, 500);
  }
});

properties.post("/", requireAuth, propertyValidator, async (c) => {
  const propertyBody = c.req.valid("json");
  const sb = c.get("supabase");
  const user = c.get("user") as User;
  try {
    const property = await createProperty(sb, {
      ...propertyBody,
      user_id: user.id //user.id
    });
    return c.json(property, 201);
  } catch (e) {
    console.warn("error in inserting property into SB DB", e);
    return c.json(e, 500);
  }
});

// PATCH för att kunna ändra delar eller allt för en property
properties.patch("/:id", requireAuth, propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  let propertyBody: Partial<Property> = c.req.valid("json");
  delete propertyBody.user_id
  const sb = c.get("supabase");
  const user = c.get("user") as User
  try {
    const property = await updatePropertyById(sb, propertyId, user.id, propertyBody);
    return c.json(property);
  } catch (e) {
    console.warn("Error fetching user's properties from SB database", e);
    return c.json({ error: "Failed to fetch properties" }, 500);
  }
});

// Delete för att radera från db
properties.delete("/:id", requireAuth, propertyParamsValidator, async (c) => {
  const propertyId = c.req.param("id");
  const user = c.get("user") as User
  const sb = c.get("supabase");
  try {
    await deletePropertyById(sb, propertyId, user.id);
    return c.json(null, 200);
  } catch (e) {
    console.warn("Error in deleting property", e);
    return c.json({ error: "Failed to delete property" }, 500);
  }
});
export default properties;
