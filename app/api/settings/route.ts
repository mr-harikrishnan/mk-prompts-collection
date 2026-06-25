import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Settings from "@/lib/models/Settings";
import { DEFAULT_SETTINGS } from "@/data/mockData";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("GET settings error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }
    await settings.save();

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("PUT settings error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
