import { Hono } from "hono";
import { authValidator } from "../validators/authValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { getBookingsByUserId } from "../database/bookings.js";
import type { User } from "@supabase/supabase-js";
import { getUser } from "../database/auth.js";

const auth = new Hono({
  strict: false,
});

auth.get("/me", requireAuth, async (c) => {
  const sb = c.get("supabase");
  console.log("Getting user", c.get("user"));
  try {

    const user = await getUser(sb);
    return c.json({ user }, 200);
  } catch (e: any) {
    console.warn("Error in getting user", e);
    return c.json(
      {
        message: "Error in getting user",
      },
      500,
    );
  }
});

auth.post("/register", authValidator, async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const sb = c.get("supabase");
    const { error, data } = await sb.auth.signUp({
      email,
      password,
    });
    if (!error) {
      return c.json(
        {
          user: data.user,
        },
        201,
      );
    }
    throw error;
  } catch (e: any) {
    console.warn("Error in registering", e);
    return c.json(
      {
        message: e?.message,
      },
      400,
    );
  }
});

auth.post("/login", authValidator, async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const sb = c.get("supabase");
    const { error, data } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      return c.json({
        user: data.user,
      });
    }
    throw error;
  } catch (e: any) {
    console.warn("Error in registering", e);
    return c.json(
      {
        message: e?.message,
      },
      400,
    );
  }
});

auth.post("/logout", requireAuth, async (c) => {
  const sb = c.get("supabase");

  try {
    const { error } = await sb.auth.signOut();

    if (error) {
      console.warn("Error in signing out", error);
      return c.json({ message: error.message }, 400);
    }

    return c.json({ message: "Signed out" });
  } catch (e: any) {
    console.warn("Error in signing out", e);
    return c.json({ message: e?.message }, 500);
  }
});

export default auth;
