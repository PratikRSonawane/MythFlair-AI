// lib/getUserFromRequest.ts
import type { NextApiRequest } from "next";
import { supabaseAdmin } from "./supabaseAdmin";

export async function getUserFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" "); // "Bearer <token>"

  if (!token) {
    return { user: null, error: new Error("Missing bearer token") };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return { user: null, error: new Error("Invalid token") };
  }

  return { user: data.user, error: null };
}
