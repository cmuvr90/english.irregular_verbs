import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth обслуживает все свои эндпоинты (/api/auth/sign-in/email и т.д.)
export const { GET, POST } = toNextJsHandler(auth);
