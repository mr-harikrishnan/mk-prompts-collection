import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Feedback from "@/lib/models/Feedback";
import Prompt from "@/lib/models/Prompt";

export async function GET() {
  try {
    await dbConnect();
    const feedbacks = await Feedback.find().sort({ date: -1 });
    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error: any) {
    console.error("GET feedbacks error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { rating, reviewer, comment } = body;

    const newFeedback = new Feedback({
      id: `review-${Date.now()}`,
      rating,
      reviewer,
      comment,
      date: new Date().toISOString(),
    });
    await newFeedback.save();

    // Parse prompt title if it matches '[Prompt: Prompt Title] ...'
    const match = comment.match(/^\[Prompt: (.*?)\]/);
    if (match) {
      const promptTitle = match[1];
      const prompt = await Prompt.findOne({ title: promptTitle });
      if (prompt) {
        const currentTotal = prompt.totalReviews || 0;
        const currentStars = prompt.stars || 5.0;
        const updatedTotal = currentTotal + 1;
        const updatedStars = parseFloat(
          ((currentStars * currentTotal + rating) / updatedTotal).toFixed(1)
        );

        prompt.totalReviews = updatedTotal;
        prompt.stars = updatedStars;
        await prompt.save();
      }
    }

    return NextResponse.json({ success: true, data: newFeedback });
  } catch (error: any) {
    console.error("POST feedback error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await Feedback.deleteMany({});
    return NextResponse.json({ success: true, message: "All feedbacks purged" });
  } catch (error: any) {
    console.error("DELETE feedbacks error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
