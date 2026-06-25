import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Metrics from "@/lib/models/Metrics";
import Prompt from "@/lib/models/Prompt";

export async function GET() {
  try {
    await dbConnect();
    let metrics = await Metrics.findOne();
    if (!metrics) {
      metrics = await Metrics.create({
        totalVisits: 0,
        totalCopies: 0,
        copiesHistory: [],
        retentionCohort: [
          { week: "W1", percentage: 100 },
          { week: "W2", percentage: 88 },
          { week: "W3", percentage: 76 },
          { week: "W4", percentage: 69 },
          { week: "W5", percentage: 61 },
          { week: "W6", percentage: 58 },
        ]
      });
    } else if (!metrics.retentionCohort || metrics.retentionCohort.length < 6) {
      metrics.retentionCohort = [
        { week: "W1", percentage: 100 },
        { week: "W2", percentage: 88 },
        { week: "W3", percentage: 76 },
        { week: "W4", percentage: 69 },
        { week: "W5", percentage: 61 },
        { week: "W6", percentage: 58 },
      ];
      await metrics.save();
    }
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    console.error("GET metrics error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { actionType, promptTitle, category, promptId } = body;

    let metrics = await Metrics.findOne();
    if (!metrics) {
      metrics = await Metrics.create({
        totalVisits: 0,
        totalCopies: 0,
        copiesHistory: [],
        retentionCohort: [
          { week: "W1", percentage: 100 },
          { week: "W2", percentage: 88 },
          { week: "W3", percentage: 76 },
          { week: "W4", percentage: 69 },
          { week: "W5", percentage: 61 },
          { week: "W6", percentage: 58 },
        ]
      });
    }

    if (actionType === "visit") {
      metrics.totalVisits += 1;
    } else if (actionType === "copy") {
      metrics.totalCopies += 1;
      const today = new Date().toISOString().split("T")[0];
      metrics.copiesHistory.unshift({
        date: today,
        promptTitle: promptTitle || "Unknown Prompt",
        category: category || "Uncategorized",
      });
      if (metrics.copiesHistory.length > 100) {
        metrics.copiesHistory = metrics.copiesHistory.slice(0, 100);
      }

      if (promptId) {
        await Prompt.findOneAndUpdate(
          { id: promptId },
          { $inc: { copyCount: 1 } }
        );
      } else if (promptTitle) {
        await Prompt.findOneAndUpdate(
          { title: promptTitle },
          { $inc: { copyCount: 1 } }
        );
      }
    }

    await metrics.save();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    console.error("POST metrics error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
