import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateNextQuestion } from "@/lib/interview/services";
import { headers } from "next/headers";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const question = await generateNextQuestion(params.id);
    return NextResponse.json({ question }); // null if finished
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
