import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

type ServiceStatus = "operational" | "degraded" | "outage" | "unknown";

// Quick keyword-based status analysis for batch checking
function quickAnalyze(snippets: string): ServiceStatus {
  const lower = snippets.toLowerCase();

  const outageKeywords = [
    "major outage", "down for many", "widespread outage", "service is down",
    "completely down", "not working", "outage reported", "service disruption",
    "total outage", "service unavailable", "experiencing an outage", "full outage"
  ];
  const degradedKeywords = [
    "some problems", "partial outage", "degraded performance", "rate limit",
    "slow response", "intermittent", "reduced functionality", "capacity issues",
    "high latency", "throttling", "rate limiting", "at capacity",
    "high demand", "overloaded", "temporarily limited"
  ];
  const operationalKeywords = [
    "no problems", "working normally", "all systems operational",
    "fully operational", "no issues", "service is up", "running smoothly",
    "no reported issues", "healthy", "status: operational"
  ];

  let outageScore = 0, degradedScore = 0, operationalScore = 0;

  for (const kw of outageKeywords) {
    if (lower.includes(kw)) outageScore += 2;
  }
  for (const kw of degradedKeywords) {
    if (lower.includes(kw)) degradedScore += 1.5;
  }
  for (const kw of operationalKeywords) {
    if (lower.includes(kw)) operationalScore += 1;
  }

  if (outageScore > degradedScore && outageScore > operationalScore && outageScore >= 2) return "outage";
  if (degradedScore > outageScore && degradedScore > operationalScore && degradedScore >= 1.5) return "degraded";
  if (operationalScore > degradedScore && operationalScore >= 1) return "operational";
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceIds, useLlm = false } = body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: "serviceIds array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent timeouts
    const idsToCheck = serviceIds.slice(0, 20);

    const zai = await ZAI.create();
    const results: Array<{
      serviceId: string;
      serviceName: string;
      status: ServiceStatus;
      description: string;
      source: string;
      checkedAt: string;
    }> = [];

    // Process services with a small delay between each to avoid rate limiting
    for (const serviceId of idsToCheck) {
      try {
        const service = await db.aIService.findUnique({ where: { id: serviceId } });
        if (!service) {
          results.push({
            serviceId,
            serviceName: "Unknown",
            status: "unknown",
            description: "Service not found",
            source: "error",
            checkedAt: new Date().toISOString(),
          });
          continue;
        }

        let status: ServiceStatus = "unknown";
        let description = "";
        let source = "web-search";

        try {
          const searchQuery = `"${service.name}" ${service.company} service status outage down today`;
          const searchResult = await zai.functions.invoke("web_search", {
            query: searchQuery,
            num: 5,
          });

          if (searchResult && Array.isArray(searchResult) && searchResult.length > 0) {
            const snippets = searchResult
              .slice(0, 3)
              .map((r: { name?: string; snippet?: string }) => r.snippet || r.name)
              .filter(Boolean)
              .join(" ");

            if (useLlm && snippets.length > 20) {
              // LLM-based analysis for more accuracy
              try {
                const llmResponse = await zai.chat.completions.create({
                  messages: [
                    {
                      role: "system",
                      content: `You are a service status analyzer. Based on the web search results, determine the current status of the AI service "${service.name}" by ${service.company}. Reply with ONLY one word: "operational", "degraded", "outage", or "unknown".`
                    },
                    { role: "user", content: `Search results:\n\n${snippets}` }
                  ],
                  temperature: 0.1,
                  max_tokens: 10,
                });

                const answer = (llmResponse.choices[0]?.message?.content || "").toLowerCase().trim();
                if (answer.includes("operational")) status = "operational";
                else if (answer.includes("degraded")) status = "degraded";
                else if (answer.includes("outage")) status = "outage";
                source = "llm-analysis";
              } catch {
                status = quickAnalyze(snippets);
                source = "keyword-analysis";
              }
            } else if (snippets.length > 20) {
              status = quickAnalyze(snippets);
              source = "keyword-analysis";
            }
          }
        } catch {
          status = "unknown";
          description = "Search unavailable";
          source = "error";
        }

        // Update the DB
        await db.aIService.update({
          where: { id: serviceId },
          data: { status, lastChecked: new Date() },
        });

        results.push({
          serviceId,
          serviceName: service.name,
          status,
          description: description || `Status: ${status}`,
          source,
          checkedAt: new Date().toISOString(),
        });

        // Small delay between requests to avoid rate limiting
        if (idsToCheck.indexOf(serviceId) < idsToCheck.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (err) {
        results.push({
          serviceId,
          serviceName: "Error",
          status: "unknown",
          description: "Failed to check",
          source: "error",
          checkedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      total: serviceIds.length,
      results,
    });
  } catch (error) {
    console.error("Check all statuses error:", error);
    return NextResponse.json(
      { error: "Failed to check service statuses" },
      { status: 500 }
    );
  }
}
