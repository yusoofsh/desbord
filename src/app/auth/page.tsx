import AuthForm from "@/lib/components/auth-form"
import Logo from "@/lib/components/logo"
import { getCurrentSession } from "@/lib/utils/session"
import { redirect } from "next/navigation"

export const runtime = "edge"

export default async function AuthPage() {
  const { session } = await getCurrentSession()
  if (session) return redirect("/home")

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <Logo />
          </div>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
