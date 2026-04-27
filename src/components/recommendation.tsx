"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
} from "lucide-react";
import type { Recommendation as RecommendationType } from "@/lib/timezone-utils";
import { t, type Locale } from "@/lib/i18n";

interface RecommendationProps {
  recommendation: RecommendationType;
  servicesInPeak: number;
  totalServices: number;
  locale: Locale;
}

const levelConfig = {
  great: {
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
    textClass: "text-emerald-500",
    titleClass: "text-emerald-600 dark:text-emerald-400",
  },
  okay: {
    icon: AlertTriangle,
    bgClass: "bg-amber-500/10 border-amber-500/30",
    textClass: "text-amber-500",
    titleClass: "text-amber-600 dark:text-amber-400",
  },
  wait: {
    icon: XCircle,
    bgClass: "bg-red-500/10 border-red-500/30",
    textClass: "text-red-500",
    titleClass: "text-red-600 dark:text-red-400",
  },
};

export function Recommendation({
  recommendation,
  servicesInPeak,
  totalServices,
  locale,
}: RecommendationProps) {
  const config = levelConfig[recommendation.level];
  const Icon = config.icon;
  const ratio = totalServices > 0 ? Math.round((servicesInPeak / totalServices) * 100) : 0;

  const levelTitle = () => {
    switch (recommendation.level) {
      case "great":
        return `✨ ${t(locale, "greatTime")}`;
      case "okay":
        return `⚠️ ${t(locale, "somePeak")}`;
      case "wait":
        return `🔴 ${t(locale, "manyPeak")}`;
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border ${config.bgClass}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{
                scale: recommendation.level === "wait" ? [1, 1.1, 1] : 1,
              }}
              transition={{
                repeat: recommendation.level === "wait" ? Infinity : 0,
                duration: 2,
              }}
            >
              <Icon className={`h-6 w-6 ${config.textClass} mt-0.5`} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${config.titleClass}`}>
                {levelTitle()}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {recommendation.message}
              </p>

              {/* Stats bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        recommendation.level === "great"
                          ? "bg-emerald-500"
                          : recommendation.level === "okay"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {servicesInPeak} {t(locale, "inPeakLabel")} ({ratio}%)
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {totalServices - servicesInPeak} {t(locale, "available")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current peak services */}
              {recommendation.currentPeakServices.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] text-muted-foreground mb-1">
                    {t(locale, "inPeakLabel")}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.currentPeakServices.slice(0, 6).map((name) => (
                      <span
                        key={name}
                        className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded"
                      >
                        {name}
                      </span>
                    ))}
                    {recommendation.currentPeakServices.length > 6 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{recommendation.currentPeakServices.length - 6} {t(locale, "more")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Next good slot */}
              {recommendation.nextGoodSlot && recommendation.level !== "great" && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">
                    {t(locale, "nextGoodSlot")}
                  </span>
                  <span className="font-medium text-emerald-500">
                    {recommendation.nextGoodSlot}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
