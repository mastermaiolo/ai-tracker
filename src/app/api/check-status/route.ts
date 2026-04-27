import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
      );
    }

    const service = await db.aIService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Use z-ai-web-dev-sdk to search for current status
    const zai = await ZAI.create();
    let statusInfo = {
      status: "unknown" as string,
      description: "",
      source: "web-search",
    };

    try {
      const searchQuery = service.downdetectorUrl
        ? `${service.name} outage status today`
        : `${service.name} service status downtime today`;

      const searchResult = await zai.functions.invoke("web_search", {
        query: searchQuery,
        num: 5,
      });

      if (searchResult && Array.isArray(searchResult) && searchResult.length > 0) {
        const topResults = searchResult.slice(0, 3);
        const snippets = topResults
          .map((r: { name?: string; snippet?: string }) => r.snippet || r.name)
          .filter(Boolean)
          .join(" ");

        // Simple heuristic to determine status
        const lowerSnippets = snippets.toLowerCase();
        if (
          lowerSnippets.includes("major outage") ||
          lowerSnippets.includes("down for many") ||
          lowerSnippets.includes("widespread outage")
        ) {
          statusInfo.status = "outage";
          statusInfo.description = "Major outage reported";
        } else if (
          lowerSnippets.includes("some problems") ||
          lowerSnippets.includes("partial outage") ||
          lowerSnippets.includes("degraded performance") ||
          lowerSnippets.includes("rate limit")
        ) {
          statusInfo.status = "degraded";
          statusInfo.description = "Some issues reported - possible rate limiting or degraded performance";
        } else if (
          lowerSnippets.includes("no problems") ||
          lowerSnippets.includes("working normally") ||
          lowerSnippets.includes("all systems operational")
        ) {
          statusInfo.status = "operational";
          statusInfo.description = "Service appears to be operating normally";
        } else {
          statusInfo.status = "unknown";
          statusInfo.description = snippets
            ? `Latest reports: ${snippets.substring(0, 200)}`
            : "No recent status information found";
        }
      }
    } catch (searchError) {
      console.error("Web search error:", searchError);
      statusInfo.status = "unknown";
      statusInfo.description = "Could not check status - search unavailable";
    }

    // Update service status in DB
    await db.aIService.update({
      where: { id: serviceId },
      data: {
        status: statusInfo.status,
        lastChecked: new Date(),
      },
    });

    // Create outage report if there's an issue
    if (statusInfo.status === "outage" || statusInfo.status === "degraded") {
      const now = new Date();
      const hqHour = new Date(
        now.toLocaleString("en-US", { timeZone: service.hqTimezone })
      );
      await db.outageReport.create({
        data: {
          serviceId,
          severity: statusInfo.status === "outage" ? "major" : "minor",
          description: statusInfo.description,
          source: "web-search",
          hourOfDay: hqHour.getHours(),
          dayOfWeek: hqHour.getDay(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      serviceName: service.name,
      ...statusInfo,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check status error:", error);
    return NextResponse.json(
      { error: "Failed to check service status" },
      { status: 500 }
    );
  }
}
