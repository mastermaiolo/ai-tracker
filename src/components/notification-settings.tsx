"use client";

import { useState, useCallback } from "react";
import { Settings2, Volume2, VolumeX, Eye, EyeOff, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useLocale } from "@/components/locale-provider";
import { t, type Locale } from "@/lib/i18n";
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  requestNotificationPermission,
  type NotificationPrefs,
} from "@/lib/notifications";

interface NotificationSettingsProps {
  locale: Locale;
}

export function NotificationSettings({ locale }: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadNotificationPrefs);

  const updatePref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      const newPrefs = { ...prefs, [key]: value };
      setPrefs(newPrefs);
      saveNotificationPrefs(newPrefs);

      if (key === "browserNotifications" && value) {
        requestNotificationPermission().then((granted) => {
          if (!granted) {
            const reverted = { ...newPrefs, browserNotifications: false };
            setPrefs(reverted);
            saveNotificationPrefs(reverted);
          }
        });
      }
    },
    [prefs]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">{t(locale, "notificationSettings")}</h4>
        </div>

        <div className="space-y-3">
          {/* Sound alerts */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {prefs.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-amber-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs">{t(locale, "soundAlerts")}</span>
            </div>
            <Switch
              checked={prefs.soundEnabled}
              onCheckedChange={(v) => updatePref("soundEnabled", v)}
            />
          </div>

          {/* Visual alerts */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {prefs.visualEnabled ? (
                <Eye className="h-4 w-4 text-amber-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs">{t(locale, "visualAlerts")}</span>
            </div>
            <Switch
              checked={prefs.visualEnabled}
              onCheckedChange={(v) => updatePref("visualEnabled", v)}
            />
          </div>

          {/* Browser notifications */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {prefs.browserNotifications ? (
                <Bell className="h-4 w-4 text-amber-500" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs">{t(locale, "browserNotifications")}</span>
            </div>
            <Switch
              checked={prefs.browserNotifications}
              onCheckedChange={(v) => updatePref("browserNotifications", v)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
