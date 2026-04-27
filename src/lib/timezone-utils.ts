/**
 * Convert an hour from one timezone to another
 * @param hour - The hour (0-23) in the source timezone
 * @param fromTimezone - The source IANA timezone string
 * @param toTimezone - The target IANA timezone string
 * @returns The converted hour (0-23) in the target timezone
 */
export function convertHourToTimezone(
  hour: number,
  fromTimezone: string,
  toTimezone: string
): number {
  const now = new Date();

  // Create a date reference in the source timezone
  const sourceDate = new Date(
    now.toLocaleString("en-US", { timeZone: fromTimezone })
  );
  // Create a date reference in the target timezone
  const targetDate = new Date(
    now.toLocaleString("en-US", { timeZone: toTimezone })
  );

  // Calculate the offset difference in hours
  // If target is ahead of source, this will be positive
  // e.g., source (New York 10:00) -> target (Lisbon 15:00) => +5
  const offsetDiff =
    (targetDate.getTime() - sourceDate.getTime()) / (1000 * 60 * 60);

  // Convert the hour
  return ((hour + offsetDiff) % 24 + 24) % 24;
}

/**
 * Get the current hour in a specific timezone
 * @param timezone - IANA timezone string
 * @returns Current hour (0-23) in the specified timezone
 */
export function getCurrentHourInTimezone(timezone: string): number {
  const now = new Date();
  const dateInTz = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  return dateInTz.getHours();
}

/**
 * Check if a given hour falls within a peak period
 * Handles wrapping around midnight
 * @param currentHour - The hour to check (0-23)
 * @param peakStart - Peak period start hour (0-23)
 * @param peakEnd - Peak period end hour (0-23)
 * @returns Whether the current hour is in the peak period
 */
export function isInPeakHour(
  currentHour: number,
  peakStart: number,
  peakEnd: number
): boolean {
  if (peakStart <= peakEnd) {
    // Normal range (e.g., 9-12)
    return currentHour >= peakStart && currentHour < peakEnd;
  } else {
    // Wraps around midnight (e.g., 22-3)
    return currentHour >= peakStart || currentHour < peakEnd;
  }
}

/**
 * Get the timezone offset in hours between two timezones
 * @param fromTz - Source timezone
 * @param toTz - Target timezone
 * @returns Offset in hours (positive means target is ahead)
 */
export function getTimezoneOffset(fromTz: string, toTz: string): number {
  const now = new Date();
  const fromDate = new Date(now.toLocaleString("en-US", { timeZone: fromTz }));
  const toDate = new Date(now.toLocaleString("en-US", { timeZone: toTz }));
  return (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Format an hour as a time string
 * @param hour - Hour (0-23), can be fractional
 * @returns Formatted string like "9:00" or "21:00"
 */
export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Format a time range
 * @param start - Start hour
 * @param end - End hour
 * @returns Formatted string like "09:00 - 12:00"
 */
export function formatTimeRange(start: number, end: number): string {
  return `${formatHour(start)} - ${formatHour(end)}`;
}

/**
 * Get best off-peak time slots for a set of services
 * @param services - Array of services with peak hours data
 * @param userTz - User's timezone
 * @returns Array of time slots ranked by availability
 */
export interface TimeSlot {
  hour: number;
  availableCount: number;
  totalCount: number;
  peakServices: string[];
}

export function getBestTimeSlots(
  services: Array<{
    name: string;
    hqTimezone: string;
    peakHoursStart: number;
    peakHoursEnd: number;
    secondaryPeakStart: number;
    secondaryPeakEnd: number;
  }>,
  userTz: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const peakServices: string[] = [];

    for (const service of services) {
      const primaryStart = convertHourToTimezone(
        service.peakHoursStart,
        service.hqTimezone,
        userTz
      );
      const primaryEnd = convertHourToTimezone(
        service.peakHoursEnd,
        service.hqTimezone,
        userTz
      );
      const secondaryStart = convertHourToTimezone(
        service.secondaryPeakStart,
        service.hqTimezone,
        userTz
      );
      const secondaryEnd = convertHourToTimezone(
        service.secondaryPeakEnd,
        service.hqTimezone,
        userTz
      );

      if (
        isInPeakHour(hour, primaryStart, primaryEnd) ||
        isInPeakHour(hour, secondaryStart, secondaryEnd)
      ) {
        peakServices.push(service.name);
      }
    }

    slots.push({
      hour,
      availableCount: services.length - peakServices.length,
      totalCount: services.length,
      peakServices,
    });
  }

  return slots;
}

/**
 * Get a recommendation for the best time to use AI services
 * @param services - Array of services
 * @param userTz - User's timezone
 * @returns Recommendation object
 */
export interface Recommendation {
  level: "great" | "okay" | "wait";
  message: string;
  currentPeakServices: string[];
  nextGoodSlot: string | null;
}

export function getRecommendation(
  services: Array<{
    name: string;
    hqTimezone: string;
    peakHoursStart: number;
    peakHoursEnd: number;
    secondaryPeakStart: number;
    secondaryPeakEnd: number;
  }>,
  userTz: string
): Recommendation {
  const currentHour = getCurrentHourInTimezone(userTz);
  const slots = getBestTimeSlots(services, userTz);
  const currentSlot = slots[currentHour];
  const peakRatio = currentSlot.peakServices.length / services.length;

  const currentPeakServices = currentSlot.peakServices;

  // Find next good slot
  let nextGoodSlot: string | null = null;
  for (let i = 1; i <= 24; i++) {
    const nextHour = (currentHour + i) % 24;
    const nextSlot = slots[nextHour];
    if (nextSlot.peakServices.length / services.length < 0.3) {
      nextGoodSlot = formatHour(nextHour);
      break;
    }
  }

  if (peakRatio < 0.3) {
    return {
      level: "great",
      message: "Agora é um ótimo momento para usar serviços de IA!",
      currentPeakServices,
      nextGoodSlot: null,
    };
  } else if (peakRatio < 0.6) {
    return {
      level: "okay",
      message: "Alguns serviços estão em pico, mas a maioria está disponível.",
      currentPeakServices,
      nextGoodSlot,
    };
  } else {
    return {
      level: "wait",
      message: `Muitos serviços em pico. Considere esperar até às ${nextGoodSlot || "mais tarde"}.`,
      currentPeakServices,
      nextGoodSlot,
    };
  }
}

/**
 * Generate heatmap data for peak hours visualization
 */
export interface HeatmapDataPoint {
  hour: number;
  hourLabel: string;
  primaryPeakCount: number;
  secondaryPeakCount: number;
  totalPeakCount: number;
  peakServiceNames: string[];
}

export function generateHeatmapData(
  services: Array<{
    name: string;
    hqTimezone: string;
    peakHoursStart: number;
    peakHoursEnd: number;
    secondaryPeakStart: number;
    secondaryPeakEnd: number;
  }>,
  userTz: string
): HeatmapDataPoint[] {
  return Array.from({ length: 24 }, (_, hour) => {
    const primaryServices: string[] = [];
    const secondaryServices: string[] = [];

    for (const service of services) {
      const primaryStart = convertHourToTimezone(
        service.peakHoursStart,
        service.hqTimezone,
        userTz
      );
      const primaryEnd = convertHourToTimezone(
        service.peakHoursEnd,
        service.hqTimezone,
        userTz
      );
      const secondaryStart = convertHourToTimezone(
        service.secondaryPeakStart,
        service.hqTimezone,
        userTz
      );
      const secondaryEnd = convertHourToTimezone(
        service.secondaryPeakEnd,
        service.hqTimezone,
        userTz
      );

      if (isInPeakHour(hour, primaryStart, primaryEnd)) {
        primaryServices.push(service.name);
      }
      if (isInPeakHour(hour, secondaryStart, secondaryEnd)) {
        secondaryServices.push(service.name);
      }
    }

    const allPeakServices = [
      ...new Set([...primaryServices, ...secondaryServices]),
    ];

    return {
      hour,
      hourLabel: formatHour(hour),
      primaryPeakCount: primaryServices.length,
      secondaryPeakCount: secondaryServices.length,
      totalPeakCount: allPeakServices.length,
      peakServiceNames: allPeakServices,
    };
  });
}

/**
 * Detect the user's timezone
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Get common timezones for the selector
 */
export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Lisbon",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Luxembourg",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];
