import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Prompt from "@/lib/models/Prompt";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedPrompt = await Prompt.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true }
    );

    if (!updatedPrompt) {
      return NextResponse.json(
        { success: false, message: "Prompt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedPrompt });
  } catch (error: any) {
    console.error("PUT prompt error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedPrompt = await Prompt.findOneAndDelete({ id });

    if (!deletedPrompt) {
      return NextResponse.json(
        { success: false, message: "Prompt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: deletedPrompt });
  } catch (error: any) {
    console.error("DELETE prompt error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
