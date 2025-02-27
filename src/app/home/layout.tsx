import SideNav from "@/lib/components/home/side-nav"
import { getCurrentSession } from "@/lib/utils/session"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export default async function HomeLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getCurrentSession()
  if (!session) return redirect("/sign-in")

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  )
}
