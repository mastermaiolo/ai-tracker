import { AI_SERVICES, type AIServiceData } from "./ai-services";

// In-memory service store - initialized from static data
// Replaces Prisma/SQLite for Vercel serverless compatibility

interface StoredService extends AIServiceData {
  id: string;
  status: string;
  lastChecked: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Create in-memory services from static data
const services: StoredService[] = AI_SERVICES.map((s, i) => ({
  ...s,
  id: `svc-${i.toString().padStart(2, "0")}-${s.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}`,
  status: "unknown",
  lastChecked: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

export const db = {
  aIService: {
    findMany: async (args?: {
      where?: Record<string, unknown>;
      orderBy?: Array<Record<string, string>>;
    }) => {
      let result = [...services];
      if (args?.where) {
        if (args.where.category)
          result = result.filter((s) => s.category === args.where.category);
        if (args.where.region)
          result = result.filter((s) => s.region === args.where.region);
        if (args.where.OR) {
          const orConditions = args.where.OR as Array<
            Record<string, unknown>
          >;
          result = result.filter((s) =>
            orConditions.some((cond) => {
              if (
                cond.name &&
                typeof cond.name === "object" &&
                "contains" in (cond.name as object)
              ) {
                const search = (
                  cond.name as { contains: string }
                ).contains.toLowerCase();
                return s.name.toLowerCase().includes(search);
              }
              if (
                cond.company &&
                typeof cond.company === "object" &&
                "contains" in (cond.company as object)
              ) {
                const search = (
                  cond.company as { contains: string }
                ).contains.toLowerCase();
                return s.company.toLowerCase().includes(search);
              }
              return false;
            })
          );
        }
      }
      // Handle orderBy
      if (args?.orderBy && args.orderBy.length > 0) {
        const order = args.orderBy[0];
        const field = Object.keys(order)[0];
        const direction = order[field];
        result.sort((a, b) => {
          const aVal = String(a[field as keyof StoredService] ?? "");
          const bVal = String(b[field as keyof StoredService] ?? "");
          if (field === "riskLevel") {
            const riskOrder: Record<string, number> = {
              high: 3,
              medium: 2,
              low: 1,
            };
            const aRisk = riskOrder[aVal] ?? 2;
            const bRisk = riskOrder[bVal] ?? 2;
            return direction === "desc" ? bRisk - aRisk : aRisk - bRisk;
          }
          return direction === "desc"
            ? bVal.localeCompare(aVal)
            : aVal.localeCompare(bVal);
        });
      }
      return result;
    },
    findUnique: async (args: {
      where: { id: string } | { name: string };
    }) => {
      if ("id" in args.where)
        return services.find((s) => s.id === args.where.id) || null;
      if ("name" in args.where)
        return services.find((s) => s.name === args.where.name) || null;
      return null;
    },
    update: async (args: {
      where: { id: string } | { name: string };
      data: Record<string, unknown>;
    }) => {
      let service: StoredService | undefined;
      if ("id" in args.where) {
        service = services.find((s) => s.id === args.where.id);
      } else if ("name" in args.where) {
        service = services.find((s) => s.name === args.where.name);
      }
      if (service) {
        Object.assign(service, args.data, { updatedAt: new Date() });
      }
      return service || null;
    },
    create: async (args: { data: Record<string, unknown> }) => {
      const newService = {
        id: `svc-${services.length.toString().padStart(2, "0")}-${String(
          args.data.name
        )
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as StoredService;
      services.push(newService);
      return newService;
    },
  },
  // Stub out outageReport for check-status compatibility
  outageReport: {
    create: async (_args?: {
      data: Record<string, unknown>;
    }) => ({ id: "stub" }),
  },
};
