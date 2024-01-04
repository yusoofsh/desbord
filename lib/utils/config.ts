import { getUser } from "@/lib/utils/data";
import bcrypt from "bcryptjs";
import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const nextAuthConfig = {
  pages: {
    signIn: "/login"
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
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);

          if (!user) return null;

          const isCorrectPassword = await bcrypt.compare(
            password,
            user.password
          );

          if (isCorrectPassword) return user;
        }

        return null;
      }
    })
  ]
} satisfies NextAuthConfig;
