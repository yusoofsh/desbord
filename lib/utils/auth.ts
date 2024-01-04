import { nextAuthConfig } from "@/lib/utils/config";
import NextAuth from "next-auth";

export const { auth, signIn, signOut } = NextAuth(nextAuthConfig);
