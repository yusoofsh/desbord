import { stackMiddlewares } from "@/lib/utils";
import { auth } from "@/lib/utils/auth";

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"]
};

export default stackMiddlewares([auth]);
