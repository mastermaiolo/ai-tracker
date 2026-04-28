import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 30;

// Status type
type ServiceStatus = "operational" | "degraded" | "outage" | "unknown";

// Improved keyword-based analysis with broader matching
function analyzeWithKeywords(snippets: string): { status: ServiceStatus; description: string } {
  const lower = snippets.toLowerCase();

  // Outage indicators - expanded list
  const outageKeywords = [
    "major outage", "down for many", "widespread outage", "service is down",
    "completely down", "not working", "outage reported", "service disruption",
    "total outage", "service unavailable", "site down", "can't access",
    "service is unavailable", "experiencing an outage", "full outage",
    "all services down", "infrastructure issue", "server outage",
    "unable to connect", "connection refused", "503 service",
    "incident:", "major incident", "degraded for all"
  ];

  // Degraded indicators - expanded list
  const degradedKeywords = [
    "some problems", "partial outage", "degraded performance", "rate limit",
    "slow response", "intermittent issues", "experiencing issues",
    "reduced functionality", "limited availability", "queue times",
    "longer than usual", "experiencing delays", "capacity issues",
    "high latency", "service degradation", "performance issues",
    "throttling", "rate limiting", "some users affected",
    "intermittent outages", "partial service", "slow loading",
    "temporarily limited", "capacity reached", "at capacity",
    "high demand", "overloaded", "load balancing"
  ];

  // Operational indicators - expanded list
  const operationalKeywords = [
    "no problems", "working normally", "all systems operational",
    "fully operational", "no issues", "service is up", "running smoothly",
    "no current problems", "all services running", "operational",
    "no reported issues", "healthy", "uptime", "stable",
    "no incidents", "resolved", "service restored", "back online",
    "maintenance completed", "status: operational", "available"
  ];

  // Count keyword matches
  let outageScore = 0;
  let degradedScore = 0;
  let operationalScore = 0;

  for (const kw of outageKeywords) {
    if (lower.includes(kw)) outageScore += 2;
  }
  for (const kw of degradedKeywords) {
    if (lower.includes(kw)) degradedScore += 1.5;
  }
  for (const kw of operationalKeywords) {
    if (lower.includes(kw)) operationalScore += 1;
  }

  // If we have strong signals, use them
  if (outageScore > degradedScore && outageScore > operationalScore && outageScore >= 2) {
    return { status: "outage", description: "Indicators of service outage detected in recent reports" };
  }
  if (degradedScore > outageScore && degradedScore > operationalScore && degradedScore >= 1.5) {
    return { status: "degraded", description: "Indicators of degraded performance or rate limiting detected" };
  }
  if (operationalScore > degradedScore && operationalScore >= 1) {
    return { status: "operational", description: "Service appears to be operating normally based on recent reports" };
  }

  // No clear signal
  return { status: "unknown", description: snippets ? `Inconclusive reports: ${snippets.substring(0, 150)}` : "No recent status information found" };
}

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
    let statusInfo: { status: ServiceStatus; description: string; source: string } = {
      status: "unknown",
      description: "",
      source: "web-search",
    };

    try {
      const searchQuery = `"${service.name}" ${service.company} service status outage down today 2025`;

      const searchResult = await zai.functions.invoke("web_search", {
        query: searchQuery,
        num: 8,
      });

      if (searchResult && Array.isArray(searchResult) && searchResult.length > 0) {
        const topResults = searchResult.slice(0, 5);
        const snippets = topResults
          .map((r: { name?: string; snippet?: string }) => r.snippet || r.name)
          .filter(Boolean)
          .join(" ");

        if (snippets.length > 20) {
          // Try LLM-based analysis first for more accurate results
          try {
            const llmResponse = await zai.chat.completions.create({
              messages: [
                {
                  role: "system",
                  content: `You are a service status analyzer. Based on the web search results, determine the current status of the AI service "${service.name}" by ${service.company}. Reply with ONLY one of these exact words: "operational", "degraded", "outage", or "unknown". Then on a new line, give a brief 1-sentence explanation.

Status definitions:
- "operational": Service is working normally, no reported issues
- "degraded": Service has partial issues, slow performance, rate limiting, or intermittent problems
- "outage": Service is down or has major widespread problems
- "unknown": Cannot determine status from available information`
                },
                {
                  role: "user",
                  content: `Here are recent web search results about ${service.name}:\n\n${snippets}`
                }
              ],
              temperature: 0.1,
              max_tokens: 100,
            });

            const llmContent = llmResponse.choices[0]?.message?.content?.trim() || "";
            const firstLine = llmContent.split("\n")[0].toLowerCase().trim();
            const explanation = llmContent.split("\n").slice(1).join(" ").trim();

            // Parse the LLM response
            if (firstLine.includes("operational")) {
              statusInfo = { status: "operational", description: explanation || "Service appears to be operating normally", source: "llm-analysis" };
            } else if (firstLine.includes("degraded")) {
              statusInfo = { status: "degraded", description: explanation || "Some issues detected - possible degradation or rate limiting", source: "llm-analysis" };
            } else if (firstLine.includes("outage")) {
              statusInfo = { status: "outage", description: explanation || "Major outage detected", source: "llm-analysis" };
            } else {
              statusInfo = { status: "unknown", description: explanation || "Could not determine status", source: "llm-analysis" };
            }
          } catch (llmError) {
            // Fallback to keyword analysis if LLM fails
            console.error("LLM analysis failed, falling back to keywords:", llmError);
            statusInfo = { ...analyzeWithKeywords(snippets), source: "keyword-analysis" };
          }
        } else {
          statusInfo = { status: "unknown", description: "Insufficient information from search results", source: "web-search" };
        }
      }
    } catch (searchError) {
      console.error("Web search error:", searchError);
      statusInfo = {
        status: "unknown",
        description: "Could not check status - search unavailable",
        source: "error",
      };
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
          source: statusInfo.source,
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
