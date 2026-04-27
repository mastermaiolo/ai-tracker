"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { HeatmapDataPoint } from "@/lib/timezone-utils";

// CustomTooltip defined OUTSIDE the component to avoid React Compiler error
function HeatmapCustomTooltip({
  active,
  payload,
  totalServices,
}: {
  active?: boolean;
  payload?: Array<{ payload: HeatmapDataPoint }>;
  totalServices: number;
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const ratio = Math.round((d.totalPeakCount / totalServices) * 100);
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-semibold text-sm mb-1">{d.hourLabel}</p>
        <p className="text-xs text-muted-foreground mb-2">
          {d.totalPeakCount} de {totalServices} serviços em pico ({ratio}%)
        </p>
        <div className="flex gap-3 mb-1">
          <span className="text-xs flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500 inline-block" />
            Primário: {d.primaryPeakCount}
          </span>
          <span className="text-xs flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
            Secundário: {d.secondaryPeakCount}
          </span>
        </div>
        {d.peakServiceNames.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1">
              Serviços em pico:
            </p>
            <div className="flex flex-wrap gap-1">
              {d.peakServiceNames.slice(0, 8).map((name) => (
                <span
                  key={name}
                  className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                >
                  {name}
                </span>
              ))}
              {d.peakServiceNames.length > 8 && (
                <span className="text-[10px] text-muted-foreground">
                  +{d.peakServiceNames.length - 8} mais
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

interface PeakHoursHeatmapProps {
  data: HeatmapDataPoint[];
  currentHour: number;
  totalServices: number;
}

export function PeakHoursHeatmap({
  data,
  currentHour,
  totalServices,
}: PeakHoursHeatmapProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Mapa de Calor - Horários de Pico (24h)
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Este gráfico mostra quantos serviços de IA estão em horário de
                  pico para cada hora do dia no seu fuso horário.
                </p>
                <p className="mt-1 text-xs">
                  🔴 Muitos em pico • 🟡 Alguns em pico • 🟢 Poucos em pico
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
            Pico primário
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            Pico secundário
          </span>
          <span className="flex items-center gap-1">
            <span className="h-5 w-0.5 bg-foreground/50" />
            Hora atual
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="hourLabel" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip
                content={<HeatmapCustomTooltip totalServices={totalServices} />}
              />
              <Bar
                dataKey="primaryPeakCount"
                stackId="a"
                fill="#f97316"
                radius={[0, 0, 0, 0]}
              >
                {data.map((_, index) => (
                  <Cell key={`primary-${index}`} fill="#f97316" opacity={0.9} />
                ))}
              </Bar>
              <Bar
                dataKey="secondaryPeakCount"
                stackId="a"
                fill="#fbbf24"
                radius={[2, 2, 0, 0]}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`secondary-${index}`}
                    fill="#fbbf24"
                    opacity={0.7}
                  />
                ))}
              </Bar>
              <ReferenceLine
                x={data[currentHour]?.hourLabel}
                stroke="hsl(var(--foreground))"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hour-by-hour detail strip */}
        <div className="mt-4">
          <div className="flex gap-[2px] h-8">
            {data.map((point) => {
              const ratio = point.totalPeakCount / totalServices;
              const isCurrent = point.hour === currentHour;
              let bgColor: string;
              if (ratio >= 0.7) bgColor = "bg-red-500";
              else if (ratio >= 0.5) bgColor = "bg-orange-500";
              else if (ratio >= 0.3) bgColor = "bg-amber-500";
              else if (ratio >= 0.1) bgColor = "bg-yellow-500";
              else bgColor = "bg-emerald-500";

              return (
                <TooltipProvider key={point.hour}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex-1 rounded-sm cursor-pointer transition-all ${bgColor} ${
                          isCurrent
                            ? "ring-2 ring-foreground scale-y-110"
                            : "hover:scale-y-110"
                        }`}
                        style={{ opacity: Math.max(0.3, ratio) }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">
                        {point.hourLabel} - {point.totalPeakCount} em pico
                      </p>
                      <p className="text-xs">
                        {Math.round(ratio * 100)}% dos serviços
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
