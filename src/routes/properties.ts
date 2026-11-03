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

  try {
    const properties = await getPropertiesByUserId(
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
  } catch (error) {
    console.warn("Error in fetching properties from SB database", error);
    return c.json(
      {
        data: [],
        count: 0,
        offset: query.offset,
        limit: query.limit
      },
      500
    );
  }
});

// GET: properties either properties/kind/villa/ | properties/kind/appartment/
properties.get("/kind/:kind", propertyParamValidator, propertyQueryValidator, async (c) => {
  const query = c.req.valid("query")
  const kind = c.req.valid("param").kind;
  const sb = c.get("supabase");
  try {
    const properties = await getPropertiesByKind(sb, kind, query);
    return c.json(properties);
  } catch (error) {
    console.warn("Error in fetching properties from SB database", error);
    return c.json(
      {
        data: [],
        count: 0,
        offset: query.offset,
        limit: query.limit
      },
      500
    );
  }
});


// individuell GET hämta en Property om den finns baserat på ID annars null 404
properties.get("/:id", async (c) => {
  const propertyId = c.req.param("id");
  const sb = c.get("supabase");
  try {
    const property = await getPropertyById(sb, propertyId);
    return c.json(property);
  } catch (e) {
    console.warn("Error in fetching property from SB database", e);
    return c.json(null, 404);
  }
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
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

// Extra: "Updaterande" av en Property PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
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
    console.log("Error updating property in SB DB", e);
    return c.json(null, 404);
  }
});

// Extra: "bortagning" av en Property DELETE om den finns tänk en GET som sedan tar bort 200/204
properties.delete("/:id", requireAuth, propertyParamsValidator, async (c) => {
  const propertyId = c.req.param("id");
  const user = c.get("user") as User
  const sb = c.get("supabase");
  try {
    await deletePropertyById(sb, propertyId, user.id);
    return c.json(null, 200);
  } catch (e) {
    console.warn("Error in deleting property", e);
    return c.json(null, 404);
  }
});
export default properties;
