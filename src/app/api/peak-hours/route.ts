import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  convertHourToTimezone,
  generateHeatmapData,
  getBestTimeSlots,
  getRecommendation,
  getCurrentHourInTimezone,
  type HeatmapDataPoint,
  type TimeSlot,
  type Recommendation,
} from "@/lib/timezone-utils";

interface ServicePeakData {
  id: string;
  name: string;
  company: string;
  category: string;
  region: string;
  hqTimezone: string;
  riskLevel: string;
  status: string;
  peakHoursStart: number;
  peakHoursEnd: number;
  secondaryPeakStart: number;
  secondaryPeakEnd: number;
  primaryPeakLocalStart: number;
  primaryPeakLocalEnd: number;
  secondaryPeakLocalStart: number;
  secondaryPeakLocalEnd: number;
  isCurrentlyInPeak: boolean;
  isCurrentlyInSecondaryPeak: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get("timezone") || "UTC";
    const category = searchParams.get("category");
    const region = searchParams.get("region");

    const where: Record<string, unknown> = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (region && region !== "all") {
      where.region = region;
    }

    const services = await db.aIService.findMany({ where });

    const currentHour = getCurrentHourInTimezone(timezone);

    // Convert peak hours to user's timezone
    const servicesWithLocalPeak: ServicePeakData[] = services.map((s) => {
      const primaryStart = convertHourToTimezone(
        s.peakHoursStart,
        s.hqTimezone,
        timezone
      );
      const primaryEnd = convertHourToTimezone(
        s.peakHoursEnd,
        s.hqTimezone,
        timezone
      );
      const secondaryStart = convertHourToTimezone(
        s.secondaryPeakStart,
        s.hqTimezone,
        timezone
      );
      const secondaryEnd = convertHourToTimezone(
        s.secondaryPeakEnd,
        s.hqTimezone,
        timezone
      );

      // Check if currently in peak
      let isCurrentlyInPeak = false;
      if (primaryStart <= primaryEnd) {
        isCurrentlyInPeak =
          isCurrentlyInPeak || (currentHour >= primaryStart && currentHour < primaryEnd);
      } else {
        isCurrentlyInPeak =
          isCurrentlyInPeak || currentHour >= primaryStart || currentHour < primaryEnd;
      }

      let isCurrentlyInSecondaryPeak = false;
      if (secondaryStart <= secondaryEnd) {
        isCurrentlyInSecondaryPeak =
          currentHour >= secondaryStart && currentHour < secondaryEnd;
      } else {
        isCurrentlyInSecondaryPeak =
          currentHour >= secondaryStart || currentHour < secondaryEnd;
      }

      return {
        id: s.id,
        name: s.name,
        company: s.company,
        category: s.category,
        region: s.region,
        hqTimezone: s.hqTimezone,
        riskLevel: s.riskLevel,
        status: s.status,
        peakHoursStart: s.peakHoursStart,
        peakHoursEnd: s.peakHoursEnd,
        secondaryPeakStart: s.secondaryPeakStart,
        secondaryPeakEnd: s.secondaryPeakEnd,
        primaryPeakLocalStart: primaryStart,
        primaryPeakLocalEnd: primaryEnd,
        secondaryPeakLocalStart: secondaryStart,
        secondaryPeakLocalEnd: secondaryEnd,
        isCurrentlyInPeak: isCurrentlyInPeak || isCurrentlyInSecondaryPeak,
        isCurrentlyInSecondaryPeak,
      };
    });

    // Generate heatmap data
    const heatmapInput = services.map((s) => ({
      name: s.name,
      hqTimezone: s.hqTimezone,
      peakHoursStart: s.peakHoursStart,
      peakHoursEnd: s.peakHoursEnd,
      secondaryPeakStart: s.secondaryPeakStart,
      secondaryPeakEnd: s.secondaryPeakEnd,
    }));
    const heatmap: HeatmapDataPoint[] = generateHeatmapData(
      heatmapInput,
      timezone
    );

    // Generate best time slots
    const timeSlots: TimeSlot[] = getBestTimeSlots(heatmapInput, timezone);

    // Generate recommendation
    const recommendation: Recommendation = getRecommendation(
      heatmapInput,
      timezone
    );

    // Current hour in user timezone
    const currentHourLocal = currentHour;

    // Count services currently in peak
    const servicesInPeak = servicesWithLocalPeak.filter(
      (s) => s.isCurrentlyInPeak
    ).length;

    return NextResponse.json({
      services: servicesWithLocalPeak,
      heatmap,
      timeSlots,
      recommendation,
      currentHourLocal,
      servicesInPeak,
      timezone,
      totalServices: services.length,
    });
  } catch (error) {
    console.error("Peak hours API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch peak hours data" },
      { status: 500 }
    );
  }
}
