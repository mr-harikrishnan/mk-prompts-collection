import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Prompt from "@/lib/models/Prompt";

async function getNewUniqueKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let isUnique = false;
  let key = "";
  while (!isUnique) {
    key = "";
    for (let i = 0; i < 6; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await Prompt.findOne({ promptKey: key });
    if (!existing) {
      isUnique = true;
    }
  }
  return key;
}

export async function GET() {
  try {
    await dbConnect();
    const prompts = await Prompt.find().sort({ createdAt: -1 });

    // Auto-migrate: Generate prompt keys for any prompts that don't have one
    let updatedAny = false;
    for (const p of prompts) {
      if (!p.promptKey) {
        p.promptKey = await getNewUniqueKey();
        await p.save();
        updatedAny = true;
      }
    }

    const finalPrompts = updatedAny ? await Prompt.find().sort({ createdAt: -1 }) : prompts;
    return NextResponse.json({ success: true, data: finalPrompts });
  } catch (error: any) {
    console.error("GET prompts error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Generate guaranteed unique 6-character alphanumeric key
    const promptKey = await getNewUniqueKey();

    const newPrompt = new Prompt({
      ...body,
      id: `prompt-${Date.now()}`,
      copyCount: 0,
      stars: 5.0,
      totalReviews: 0,
      promptKey,
    });
    await newPrompt.save();
    return NextResponse.json({ success: true, data: newPrompt });
  } catch (error: any) {
    console.error("POST prompt error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
