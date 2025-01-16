import CardWrapper from "@/lib/components/cards"
import {
  CardsSkeleton,
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
} from "@/lib/components/home-skeleton"
import LatestInvoices from "@/lib/components/latest-invoices"
import RevenueChart from "@/lib/components/revenue-chart"
import { lusitana } from "@/lib/utils/fonts"
import { globalGETRateLimit } from "@/lib/utils/request"
import { getCurrentSession } from "@/lib/utils/session"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const runtime = "edge"

export default async function HomePage() {
  if (!globalGETRateLimit()) return "Too many requests"

  const { session } = await getCurrentSession()
  if (!session) redirect("/auth?mode=signin")

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  )
}
