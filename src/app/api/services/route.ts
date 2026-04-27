import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "name";

    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (region && region !== "all") {
      where.region = region;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const services = await db.aIService.findMany({
      where,
      orderBy:
        sort === "riskLevel"
          ? [{ riskLevel: "desc" }]
          : sort === "category"
            ? [{ category: "asc" }]
            : [{ name: "asc" }],
    });

    return NextResponse.json({ services, total: services.length });
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
