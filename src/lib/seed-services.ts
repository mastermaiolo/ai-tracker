// No longer needed - services are loaded from static data in db.ts
// This file is kept as a no-op for backward compatibility

import { AI_SERVICES } from "./ai-services";

export async function seedServices() {
  return {
    created: AI_SERVICES.length,
    skipped: 0,
    total: AI_SERVICES.length,
  };
}
