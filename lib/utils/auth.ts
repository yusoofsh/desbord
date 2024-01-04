import NextAuth from "next-auth";

import { nextAuthConfig } from "@/lib/utils/config";
import { getUser } from "@/lib/utils/data";
import { verify } from "argon2";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { signIn, signOut } = NextAuth({
  ...nextAuthConfig,
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
          const isPasswordMatch = await verify(user.password, password);
          console.log("Hello", user);
          if (isPasswordMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
