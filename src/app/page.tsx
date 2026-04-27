"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Clock,
  Moon,
  Search,
  Sun,
  TrendingUp,
  Zap,
  Globe,
  LayoutGrid,
  BarChart3,
  RefreshCw,
  MonitorSmartphone,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { ServiceCard } from "@/components/service-card";
import { PeakHoursHeatmap } from "@/components/peak-hours-heatmap";
import { Recommendation } from "@/components/recommendation";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  REGIONS,
  type Category,
} from "@/lib/ai-services";
import {
  detectUserTimezone,
  COMMON_TIMEZONES,
  formatHour,
  getCurrentHourInTimezone,
  type HeatmapDataPoint,
} from "@/lib/timezone-utils";
import { useLocale } from "@/components/locale-provider";
import { t, LOCALE_FLAGS, LOCALE_NAMES, type Locale } from "@/lib/i18n";

// Types
interface ServiceData {
  id: string;
  name: string;
  company: string;
  category: string;
  region: string;
  hqTimezone: string;
  riskLevel: string;
  status: string;
  primaryPeakLocalStart: number;
  primaryPeakLocalEnd: number;
  secondaryPeakLocalStart: number;
  secondaryPeakLocalEnd: number;
  isCurrentlyInPeak: boolean;
  isCurrentlyInSecondaryPeak: boolean;
  lastChecked?: string | null;
}

interface PeakHoursResponse {
  services: ServiceData[];
  heatmap: HeatmapDataPoint[];
  timeSlots: Array<{
    hour: number;
    availableCount: number;
    totalCount: number;
    peakServices: string[];
  }>;
  recommendation: {
    level: "great" | "okay" | "wait";
    message: string;
    currentPeakServices: string[];
    nextGoodSlot: string | null;
  };
  currentHourLocal: number;
  servicesInPeak: number;
  timezone: string;
  totalServices: number;
}

function computeBestTime(
  timeSlots: PeakHoursResponse["timeSlots"],
  currentHourLocal: number,
  totalServices: number
): string | null {
  if (timeSlots.length === 0 || totalServices === 0) return null;
  for (let i = 1; i <= 24; i++) {
    const h = (currentHourLocal + i) % 24;
    const nextH = (h + 1) % 24;
    if (
      timeSlots[h] &&
      timeSlots[nextH] &&
      timeSlots[h].peakServices.length / totalServices < 0.3 &&
      timeSlots[nextH].peakServices.length / totalServices < 0.3
    ) {
      return formatHour(h);
    }
  }
  return null;
}

const categoryLabel = (locale: Locale, cat: Category) => {
  const keyMap: Record<Category, string> = {
    LLM: "LLMs",
    Research: "Research",
    Image: "Image",
    Video: "Video",
    Writing: "Writing",
    Coding: "Coding",
    Audio: "Audio",
  };
  return t(locale, keyMap[cat] as keyof typeof translations.pt);
};

const regionLabel = (locale: Locale, regionValue: string) => {
  const keyMap: Record<string, string> = {
    all: "allRegions",
    US: "americas",
    EU: "europe",
    CN: "asia",
    AU: "oceania",
    CA: "canada",
    IN: "india",
    LU: "luxembourg",
  };
  return t(locale, (keyMap[regionValue] || "allRegions") as keyof typeof translations.pt);
};

import { translations } from "@/lib/i18n";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const queryClient = useQueryClient();
  const mountedRef = useRef(false);

  // Filters
  const [timezone, setTimezone] = useState(detectUserTimezone());
  const [autoDetectedTz, setAutoDetectedTz] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "heatmap">("grid");
  const [mounted, setMounted] = useState(false);

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    setAutoDetectedTz(false);
  };

  // Use a ref to track if we've mounted, and set it via a callback pattern
  // that doesn't call setState synchronously in useEffect
  useEffect(() => {
    mountedRef.current = true;
    // Use requestAnimationFrame to defer the state update
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Current time
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const timeLocale = locale === "zh" ? "zh-CN" : locale === "en" ? "en-GB" : "pt-BR";
    const updateTime = () => {
      try {
        setCurrentTime(
          new Date().toLocaleTimeString(timeLocale, {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch {
        setCurrentTime(new Date().toLocaleTimeString(timeLocale));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, locale]);

  // Seed database on mount
  const seedQuery = useQuery({
    queryKey: ["seed"],
    queryFn: async () => {
      const res = await fetch("/api/seed");
      return res.json();
    },
    staleTime: Infinity,
    retry: 1,
  });

  // Fetch peak hours data
  const {
    data: peakData,
    isLoading,
    isError,
    refetch,
  } = useQuery<PeakHoursResponse>({
    queryKey: ["peak-hours", timezone, category, region],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("timezone", timezone);
      if (category !== "all") params.set("category", category);
      if (region !== "all") params.set("region", region);
      const res = await fetch(`/api/peak-hours?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: seedQuery.isSuccess,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Check status mutation
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const checkStatusMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await fetch("/api/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId }),
      });
      return res.json();
    },
    onMutate: (serviceId) => {
      setCheckingId(serviceId);
    },
    onSettled: () => {
      setCheckingId(null);
      queryClient.invalidateQueries({ queryKey: ["peak-hours"] });
    },
  });

  const handleCheckStatus = useCallback(
    (id: string) => {
      checkStatusMutation.mutate(id);
    },
    [checkStatusMutation]
  );

  // Filter services by search
  const services = peakData?.services;
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!search) return services;
    const lower = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.company.toLowerCase().includes(lower)
    );
  }, [services, search]);

  // Compute ideal AI service
  const idealAIService = useMemo(() => {
    if (!filteredServices || filteredServices.length === 0) return null;
    const offPeak = filteredServices.filter(s => !s.isCurrentlyInPeak);
    if (offPeak.length === 0) return null;
    // Sort by risk: low first, then medium, then high
    const riskOrder = { low: 0, medium: 1, high: 2 };
    offPeak.sort((a, b) => (riskOrder[a.riskLevel as keyof typeof riskOrder] ?? 1) - (riskOrder[b.riskLevel as keyof typeof riskOrder] ?? 1));
    return offPeak[0];
  }, [filteredServices]);

  // Current hour in user timezone
  const currentHourLocal =
    peakData?.currentHourLocal ?? getCurrentHourInTimezone(timezone);

  // Best time info for summary - compute without useMemo to avoid React Compiler issues
  const bestTimeInfo = peakData
    ? computeBestTime(
        peakData.timeSlots,
        peakData.currentHourLocal,
        peakData.totalServices
      )
    : null;

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                {t(locale, "appTitle")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t(locale, "appSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timezone selector */}
              <div className="flex flex-col gap-0.5">
                <Select value={timezone} onValueChange={handleTimezoneChange}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <Globe className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder={t(locale, "timezoneLabel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz} className="text-xs">
                        {tz.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Timezone auto/manual indicator */}
                <div className="flex items-center gap-1">
                  {autoDetectedTz ? (
                    <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t(locale, "autoDetected")}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 flex items-center gap-0.5" title={t(locale, "tzManualWarning")}>
                      <AlertCircle className="h-3 w-3" />
                      {t(locale, "manualTz")}
                    </span>
                  )}
                </div>
              </div>

              {/* Current time */}
              <div className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1.5 rounded-md">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-mono font-medium">{currentTime}</span>
              </div>

              {/* Dark mode toggle */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Language Switcher */}
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                {(["pt", "en", "zh"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`px-1.5 py-1 rounded text-xs transition-all ${
                      locale === l
                        ? "bg-background shadow-sm font-medium"
                        : "hover:bg-background/50"
                    }`}
                    title={LOCALE_NAMES[l]}
                  >
                    {LOCALE_FLAGS[l]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t(locale, "monitoredServices")}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {peakData?.totalServices ?? (
                        <Skeleton className="h-7 w-10 inline-block" />
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <MonitorSmartphone className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t(locale, "inPeakNow")}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                      {peakData?.servicesInPeak ?? (
                        <Skeleton className="h-7 w-10 inline-block" />
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t(locale, "bestTime")}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                      {bestTimeInfo ?? (
                        <Skeleton className="h-7 w-16 inline-block" />
                      )}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t(locale, "localTime")}
                    </p>
                    <p className="text-lg font-bold mt-1 font-mono">
                      {currentTime || (
                        <Skeleton className="h-6 w-20 inline-block" />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {timezone.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ideal AI Now Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {t(locale, "idealAINow")}
                    </p>
                    <p className="text-lg font-bold mt-1 text-violet-600 dark:text-violet-400 truncate">
                      {idealAIService ? idealAIService.name : <Skeleton className="h-6 w-20 inline-block" />}
                    </p>
                    {idealAIService && (
                      <p className="text-[10px] text-muted-foreground">
                        {idealAIService.company} • {t(locale, "idealAIDesc")}
                      </p>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recommendation */}
        {peakData?.recommendation && (
          <Recommendation
            recommendation={peakData.recommendation}
            servicesInPeak={peakData.servicesInPeak}
            totalServices={peakData.totalServices}
            locale={locale}
          />
        )}

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Category Tabs */}
          <div className="flex-1 overflow-x-auto">
            <Tabs
              value={category}
              onValueChange={setCategory}
              className="w-full"
            >
              <TabsList className="h-8 p-0.5">
                <TabsTrigger
                  value="all"
                  className="text-xs px-2.5 h-7 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                >
                  {t(locale, "all")}
                </TabsTrigger>
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="text-xs px-2.5 h-7 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  >
                    {categoryLabel(locale, cat)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Region filter */}
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder={t(locale, "allRegions")} />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {regionLabel(locale, r.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t(locale, "searchPlaceholder")}
              className="pl-8 h-8 text-xs w-full sm:w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              className={`h-8 text-xs ${view === "grid" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              {t(locale, "grid")}
            </Button>
            <Button
              variant={view === "heatmap" ? "default" : "outline"}
              size="sm"
              className={`h-8 text-xs ${view === "heatmap" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
              onClick={() => setView("heatmap")}
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              {t(locale, "heatmap")}
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            {t(locale, "refresh")}
          </Button>
        </div>

        {/* Active filters display */}
        {(category !== "all" || region !== "all" || search) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{t(locale, "filters")}</span>
            {category !== "all" && (
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => setCategory("all")}
              >
                {categoryLabel(locale, category as Category)} ✕
              </Badge>
            )}
            {region !== "all" && (
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => setRegion("all")}
              >
                {regionLabel(locale, region)} ✕
              </Badge>
            )}
            {search && (
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => setSearch("")}
              >
                &quot;{search}&quot; ✕
              </Badge>
            )}
          </div>
        )}

        {/* Main Content */}
        {isError ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {t(locale, "loadError")}
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => refetch()}
              >
                {t(locale, "retry")}
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "heatmap" ? (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <PeakHoursHeatmap
                  data={peakData?.heatmap ?? []}
                  currentHour={currentHourLocal}
                  totalServices={peakData?.totalServices ?? 0}
                  locale={locale}
                />

                {/* Service list below heatmap */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3">
                      {t(locale, "inPeakNowList")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {filteredServices
                        .filter((s) => s.isCurrentlyInPeak)
                        .map((s) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            className={`text-xs ${
                              s.riskLevel === "high"
                                ? "border-red-500/30 text-red-500"
                                : s.riskLevel === "medium"
                                  ? "border-amber-500/30 text-amber-500"
                                  : "border-emerald-500/30 text-emerald-500"
                            }`}
                          >
                            {s.name}
                          </Badge>
                        ))}
                      {filteredServices.filter((s) => s.isCurrentlyInPeak)
                        .length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t(locale, "noServicesInPeak")} 🎉
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {filteredServices.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        {t(locale, "noServicesFound")}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        company={service.company}
                        category={service.category as Category}
                        region={service.region}
                        hqTimezone={service.hqTimezone}
                        riskLevel={service.riskLevel}
                        status={service.status}
                        primaryPeakLocalStart={service.primaryPeakLocalStart}
                        primaryPeakLocalEnd={service.primaryPeakLocalEnd}
                        secondaryPeakLocalStart={service.secondaryPeakLocalStart}
                        secondaryPeakLocalEnd={service.secondaryPeakLocalEnd}
                        isCurrentlyInPeak={service.isCurrentlyInPeak}
                        lastChecked={service.lastChecked ?? null}
                        onCheckStatus={handleCheckStatus}
                        isChecking={checkingId === service.id}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              AI Peak Hours Monitor — {t(locale, "footerText")}
            </p>
            <p>
              {t(locale, "autoRefresh")} •{" "}
              {peakData?.totalServices ?? 0} {t(locale, "servicesMonitored")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
