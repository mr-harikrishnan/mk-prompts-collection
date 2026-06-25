import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Prompt from "@/lib/models/Prompt";

export async function GET() {
  try {
    await dbConnect();
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: prompts });
  } catch (error: any) {
    console.error("GET prompts error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const newPrompt = new Prompt({
      ...body,
      id: `prompt-${Date.now()}`,
      copyCount: 0,
      stars: 5.0,
      totalReviews: 0,
    });
    await newPrompt.save();
    return NextResponse.json({ success: true, data: newPrompt });
  } catch (error: any) {
    console.error("POST prompt error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
