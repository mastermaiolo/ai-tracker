import { db } from "./db";
import { AI_SERVICES } from "./ai-services";

export async function seedServices() {
  const results = {
    created: 0,
    skipped: 0,
    total: AI_SERVICES.length,
  };

  for (const service of AI_SERVICES) {
    const existing = await db.aIService.findUnique({
      where: { name: service.name },
    });

    if (!existing) {
      await db.aIService.create({
        data: {
          name: service.name,
          company: service.company,
          category: service.category,
          region: service.region,
          hqTimezone: service.hqTimezone,
          website: service.website,
          downdetectorUrl: service.downdetectorUrl || null,
          peakHoursStart: service.peakHoursStart,
          peakHoursEnd: service.peakHoursEnd,
          secondaryPeakStart: service.secondaryPeakStart,
          secondaryPeakEnd: service.secondaryPeakEnd,
          riskLevel: service.riskLevel,
          status: "unknown",
        },
      });
      results.created++;
    } else {
      // Update the existing service with latest data
      await db.aIService.update({
        where: { name: service.name },
        data: {
          company: service.company,
          category: service.category,
          region: service.region,
          hqTimezone: service.hqTimezone,
          website: service.website,
          downdetectorUrl: service.downdetectorUrl || null,
          peakHoursStart: service.peakHoursStart,
          peakHoursEnd: service.peakHoursEnd,
          secondaryPeakStart: service.secondaryPeakStart,
          secondaryPeakEnd: service.secondaryPeakEnd,
          riskLevel: service.riskLevel,
        },
      });
      results.skipped++;
    }
  }

  return results;
}
