import { NextResponse } from "next/server";
import { seedServices } from "@/lib/seed-services";

export async function GET() {
  try {
    const result = await seedServices();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed services" },
      { status: 500 }
    );
  }
}
