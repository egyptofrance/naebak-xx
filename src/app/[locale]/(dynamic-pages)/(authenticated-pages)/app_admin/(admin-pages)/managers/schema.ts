import { z } from "zod";

export const appAdminManagerFiltersSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type AppAdminManagerFilters = z.infer<
  typeof appAdminManagerFiltersSchema
>;

