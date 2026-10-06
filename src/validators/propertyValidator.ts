import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { getValidatorError } from "../utils/validation.js";

const propertySchema = z.object({
  title: z.string().min(2, "Title is nececary"),
  description: z.string().min(3, "Description is nececary"),
  max_guests: z.number().min(1, "Max guests needs to be min 1"),
  price_per_night: z
    .number()
    .min(100, "Price per night needs to be a minimum of 100"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  kind: z.enum<PropertyKind[]>(
    ["apartment", "villa"],
    `Must be one of "apartment", "villa"`,
  ),
  property_id: z.string().optional(),
  created_at: z.string().optional(),
});

const propertyOptionalSchema = propertySchema.partial();

const propertyParamSchema = z.object({
  kind: z.enum<PropertyKind[]>(
    ["apartment", "villa"],
    `Param must be one of "apartment", "villa"`,
  ),
});

export const propertyValidator = zValidator(
  "json",
  propertySchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);

export const propertyOptionalValidator = zValidator(
  "json",
  propertyOptionalSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);

export const propertyParamValidator = zValidator(
  "param",
  propertyParamSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);
