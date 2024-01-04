import { stackMiddlewares } from "@/lib/utils";
import { nextAuthConfig } from "@/lib/utils/config";
import NextAuth from "next-auth";

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

const { auth } = NextAuth(nextAuthConfig);

export default stackMiddlewares([auth]);
