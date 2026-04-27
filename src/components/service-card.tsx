"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { REGION_FLAGS, type Category } from "@/lib/ai-services";
import { formatTimeRange, formatHour } from "@/lib/timezone-utils";
import { motion } from "framer-motion";
import { t, type Locale } from "@/lib/i18n";

interface ServiceCardProps {
  id: string;
  name: string;
  company: string;
  category: Category;
  region: string;
  hqTimezone: string;
  riskLevel: string;
  status: string;
  primaryPeakLocalStart: number;
  primaryPeakLocalEnd: number;
  secondaryPeakLocalStart: number;
  secondaryPeakLocalEnd: number;
  isCurrentlyInPeak: boolean;
  lastChecked?: string | null;
  onCheckStatus: (id: string) => void;
  isChecking: boolean;
  locale: Locale;
}

const riskColors = {
  high: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  medium: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  low: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
};

const riskLabels = (locale: Locale, level: string) => {
  const map: Record<string, string> = {
    high: t(locale, "riskHigh"),
    medium: t(locale, "riskMedium"),
    low: t(locale, "riskLow"),
  };
  return map[level] || level;
};

const statusLabels = (locale: Locale, status: string) => {
  const map: Record<string, string> = {
    operational: t(locale, "statusOperational"),
    degraded: t(locale, "statusDegraded"),
    outage: t(locale, "statusOutage"),
    unknown: t(locale, "statusUnknown"),
  };
  return map[status] || status;
};

const statusDotColors: Record<string, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  outage: "bg-red-500",
  unknown: "bg-gray-400",
};

export function ServiceCard({
  id,
  name,
  company,
  category,
  region,
  riskLevel,
  status,
  primaryPeakLocalStart,
  primaryPeakLocalEnd,
  secondaryPeakLocalStart,
  secondaryPeakLocalEnd,
  isCurrentlyInPeak,
  lastChecked,
  onCheckStatus,
  isChecking,
  locale,
}: ServiceCardProps) {
  const risk = riskColors[riskLevel as keyof typeof riskColors] || riskColors.medium;
  const statusDot = statusDotColors[status] || statusDotColors.unknown;

  // Create 24-hour timeline
  const timeline = Array.from({ length: 24 }, (_, h) => {
    let isPrimary = false;
    let isSecondary = false;

    // Check primary peak
    if (primaryPeakLocalStart <= primaryPeakLocalEnd) {
      isPrimary = h >= primaryPeakLocalStart && h < primaryPeakLocalEnd;
    } else {
      isPrimary = h >= primaryPeakLocalStart || h < primaryPeakLocalEnd;
    }

    // Check secondary peak
    if (secondaryPeakLocalStart <= secondaryPeakLocalEnd) {
      isSecondary =
        h >= secondaryPeakLocalStart && h < secondaryPeakLocalEnd;
    } else {
      isSecondary =
        h >= secondaryPeakLocalStart || h < secondaryPeakLocalEnd;
    }

    return { hour: h, isPrimary, isSecondary };
  });

  const timeLocale = locale === "zh" ? "zh-CN" : locale === "en" ? "en-GB" : "pt-BR";

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
            isCurrentlyInPeak
              ? "border-amber-500/50 shadow-amber-500/10"
              : ""
          }`}
        >
          {isCurrentlyInPeak && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          )}
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{name}</h3>
                  {isCurrentlyInPeak && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {company}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span className="text-sm" title={region}>
                  {REGION_FLAGS[region] || "🌐"}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-2 w-2 rounded-full ${statusDot} ${
                        status === "degraded" || status === "outage"
                          ? "animate-pulse"
                          : ""
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Status: {statusLabels(locale, status)}</p>
                    {lastChecked && (
                      <p className="text-xs text-muted-foreground">
                        {t(locale, "verifiedAt")}{" "}
                        {new Date(lastChecked).toLocaleTimeString(timeLocale)}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${risk.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${risk.dot} mr-1`} />
                {riskLabels(locale, riskLevel)}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {category}
              </Badge>
            </div>

            {/* Peak Hours */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
                <span className="text-muted-foreground">{t(locale, "primaryPeak")}:</span>
                <span className="font-medium">
                  {formatTimeRange(primaryPeakLocalStart, primaryPeakLocalEnd)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3 w-3 text-amber-400 flex-shrink-0" />
                <span className="text-muted-foreground">{t(locale, "secondaryPeak")}:</span>
                <span className="font-medium">
                  {formatTimeRange(
                    secondaryPeakLocalStart,
                    secondaryPeakLocalEnd
                  )}
                </span>
              </div>
            </div>

            {/* Mini Timeline */}
            <div className="mb-3">
              <div className="flex gap-[2px] h-4">
                {timeline.map(({ hour, isPrimary, isSecondary }) => (
                  <Tooltip key={hour}>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex-1 rounded-sm transition-colors ${
                          isPrimary
                            ? "bg-orange-500"
                            : isSecondary
                              ? "bg-amber-400/60"
                              : "bg-emerald-500/20"
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {formatHour(hour)} -{" "}
                        {isPrimary
                          ? t(locale, "primaryPeak")
                          : isSecondary
                            ? t(locale, "secondaryPeak")
                            : t(locale, "outOfPeak")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>23</span>
              </div>
            </div>

            {/* Check Status Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={() => onCheckStatus(id)}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <ExternalLink className="h-3 w-3 mr-1" />
              )}
              {isChecking ? t(locale, "checking") : t(locale, "checkStatus")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
