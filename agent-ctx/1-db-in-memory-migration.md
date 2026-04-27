# Task: Replace SQLite/Prisma with static in-memory data for Vercel serverless compatibility

## Summary
Replaced Prisma/SQLite database dependency with a static in-memory data store using the existing `AI_SERVICES` array from `ai-services.ts`. This eliminates the `Error code 14: Unable to open the database file` issue on Vercel serverless.

## Files Modified

1. **`/home/z/my-project/src/lib/db.ts`** - Complete rewrite
   - Replaced PrismaClient with in-memory store
   - `db.aIService.findMany()` - supports `where` (category, region, OR conditions) and `orderBy` (riskLevel, category, name)
   - `db.aIService.findUnique()` - supports lookup by `id` or `name`
   - `db.aIService.update()` - supports update by `id` or `name`
   - `db.aIService.create()` - stub for compatibility
   - `db.outageReport.create()` - stub that returns `{ id: 'stub' }`

2. **`/home/z/my-project/src/lib/seed-services.ts`** - Made a no-op
   - Returns static counts instead of querying/inserting into DB

3. **`/home/z/my-project/src/app/api/seed/route.ts`** - Stubbed
   - Returns `{ success: true, created: 50, skipped: 0, total: 50 }` immediately

4. **No changes needed** to:
   - `peak-hours/route.ts` - already uses `db.aIService.findMany({ where })` (compatible)
   - `services/route.ts` - already uses `db.aIService.findMany({ where, orderBy })` (compatible)
   - `check-status/route.ts` - already uses `db.aIService.findUnique`, `db.aIService.update`, `db.outageReport.create` (compatible)
   - `page.tsx` - no changes needed

## Build Result
✅ `npx next build` passed successfully with no errors.

## Key Design Decisions
- Kept `prisma/schema.prisma` intact (as required - removing it would break the build)
- In-memory store interface matches Prisma's query API to minimize code changes in route handlers
- `StoredService` includes `createdAt` and `updatedAt` fields for schema compatibility
- `orderBy` in `findMany` handles risk level sorting with custom order (high=3, medium=2, low=1)
