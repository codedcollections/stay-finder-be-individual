import { createClient } from "@supabase/supabase-js";

import { env } from "../env.js";
import type { Database } from "../types/supabase.js";

export const sb = createClient<Database>(
    env.supabaseUrl,
    env.supabaseKey
)