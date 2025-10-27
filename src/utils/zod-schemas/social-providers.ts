import { z } from "zod";

export const socialProviders = z.enum(["google"]);

export type SocialProvider = z.infer<typeof socialProviders>;
