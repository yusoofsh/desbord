"use client"

import AuthForm from "@/lib/components/auth-form"
import Logo from "@/lib/components/logo"
import { useSearchParams } from "next/navigation"

export const runtime = "edge"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") === "signin" ? "signin" : "signup"

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <Logo />
          </div>
        </div>
        <AuthForm mode={mode} />
      </div>
    </main>
  )
}
