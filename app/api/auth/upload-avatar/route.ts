import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

// Service-role client — used only server-side, never exposed to browser
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = "avatars";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  // Verify session
  const userSupabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File must be JPG, PNG, GIF or WebP" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 2 MB limit" }, { status: 400 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${user.id}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload (upsert = overwrite existing avatar)
  const { error: uploadError } = await adminSupabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[upload-avatar] storage error:", uploadError.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = adminSupabase.storage.from(BUCKET).getPublicUrl(path);

  // Cache-bust so browsers don't serve stale image
  const url = `${publicUrl}?t=${Date.now()}`;

  // Persist to user metadata
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      avatar_url: url,
      picture: url,
    },
  });

  if (updateError) {
    console.error("[upload-avatar] metadata update error:", updateError.message);
    return NextResponse.json({ error: "Metadata update failed" }, { status: 500 });
  }

  return NextResponse.json({ url });
}
