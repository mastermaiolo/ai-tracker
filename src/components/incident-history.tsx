"use client";

import { useState, useCallback } from "react";
import { Bell, Trash2, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/components/locale-provider";
import { t, type Locale } from "@/lib/i18n";
import { loadIncidents, saveIncidents, type Incident } from "@/lib/incidents";

function formatRelativeTime(locale: Locale, timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t(locale, "justNow");
  if (diffMin < 60) return `${diffMin}${t(locale, "minutesAgo")} ${t(locale, "incidentAgo")}`;
  if (diffHour < 24) return `${diffHour}${t(locale, "hoursAgo")} ${t(locale, "incidentAgo")}`;
  return `${diffDay}${t(locale, "daysAgo")} ${t(locale, "incidentAgo")}`;
}

interface IncidentHistoryProps {
  locale: Locale;
}

export function IncidentHistory({ locale }: IncidentHistoryProps) {
  const [open, setOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const refreshIncidents = useCallback(() => {
    setIncidents(loadIncidents());
  }, []);

  const handleOpen = () => {
    refreshIncidents();
    setOpen(true);
  };

  const handleClearAll = () => {
    saveIncidents([]);
    setIncidents([]);
  };

  const activeCount = incidents.filter((i) => !i.resolvedAt).length;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 relative"
        onClick={handleOpen}
      >
        <Bell className="h-4 w-4" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            {activeCount > 9 ? "9+" : activeCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <SheetTitle>{t(locale, "incidentHistory")}</SheetTitle>
              {incidents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t(locale, "clearIncidents")}
                </Button>
              )}
            </div>
            <SheetDescription>
              {incidents.length === 0
                ? t(locale, "noIncidents")
                : `${incidents.length} ${t(locale, "incidents").toLowerCase()}`}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
            <div className="p-4 pt-2 space-y-3">
              {incidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                  <p className="text-sm text-muted-foreground">{t(locale, "noIncidents")}</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`rounded-lg border p-3 space-y-2 ${
                      incident.resolvedAt
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : incident.type === "outage"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-amber-500/5 border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {incident.type === "outage" ? (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">
                          {incident.serviceName}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                          incident.resolvedAt
                            ? "border-emerald-500/30 text-emerald-500"
                            : incident.type === "outage"
                              ? "border-red-500/30 text-red-500"
                              : "border-amber-500/30 text-amber-500"
                        }`}
                      >
                        {incident.resolvedAt
                          ? t(locale, "incidentResolved")
                          : incident.type === "outage"
                            ? t(locale, "incidentOutage")
                            : t(locale, "incidentDegraded")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatRelativeTime(locale, incident.timestamp)}</span>
                      {!incident.resolvedAt && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {t(locale, "incidentActive")}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
