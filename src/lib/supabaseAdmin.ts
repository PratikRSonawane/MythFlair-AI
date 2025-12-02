// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// SERVER-SIDE ONLY client (has full DB permissions, so never import this in React components)
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);
