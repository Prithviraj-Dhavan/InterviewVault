import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateProfile } from "@/lib/interview/services";
import { headers } from "next/headers";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const profile = await generateProfile(params.id);
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("PROFILE GENERATION ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
