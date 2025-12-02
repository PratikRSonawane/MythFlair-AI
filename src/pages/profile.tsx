// pages/profile.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    avatar_url: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          // Not signed in – send them to sign in page
          router.push("/signin");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          // Some error other than "no rows"
          console.error(profileError);
          setError(profileError.message);
        }

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || user.email || "",
            avatar_url: data.avatar_url || "",
          });
        } else {
          // No profile row yet: seed from auth
          setProfile({
            full_name: (user.user_metadata as any)?.full_name || "",
            email: user.email || "",
            avatar_url: (user.user_metadata as any)?.avatar_url || "",
          });
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleChange =
    (field: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be signed in to update your profile.");
        setSaving(false);
        return;
      }

      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
      });

      if (upsertError) {
        setError(upsertError.message);
      } else {
        setSuccess("Profile updated successfully.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <p>Loading profile…</p>
      </main>
    );
  }

  return (
    <div>
      {/* Simple header with sign-out */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <strong>MythFlair</strong>
        </a>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </header>

      <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h1>Profile</h1>
        <p style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>
          Update your display name, email and avatar URL.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <label>
            Full name
            <input
              type="text"
              value={profile.full_name}
              onChange={handleChange("full_name")}
              style={{
                display: "block",
                padding: 8,
                width: "100%",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                marginTop: 4,
              }}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={handleChange("email")}
              style={{
                display: "block",
                padding: 8,
                width: "100%",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                marginTop: 4,
              }}
            />
          </label>

          <label>
            Avatar URL
            <input
              type="url"
              value={profile.avatar_url}
              onChange={handleChange("avatar_url")}
              placeholder="https://example.com/avatar.png"
              style={{
                display: "block",
                padding: 8,
                width: "100%",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                marginTop: 4,
              }}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#6366f1",
              color: "white",
              cursor: "pointer",
              marginTop: 8,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, color: "#b91c1c" }}>{error}</div>
        )}
        {success && (
          <div style={{ marginTop: 16, color: "#16a34a" }}>{success}</div>
        )}
      </main>
    </div>
  );
}
