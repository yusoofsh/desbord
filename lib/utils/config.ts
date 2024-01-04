import { type NextAuthConfig } from "next-auth";

export const nextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isLoggedIn = auth?.user ? true : false;
      if (isLoggedIn) {
        if (isOnDashboard) {
          return true;
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (isOnDashboard) {
        return false;
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
