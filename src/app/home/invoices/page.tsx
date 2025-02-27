import { InvoicesTableSkeleton } from "@/lib/components/home/skeletons"
import { CreateInvoice } from "@/lib/components/invoices/buttons"
import Pagination from "@/lib/components/invoices/pagination"
import Table from "@/lib/components/invoices/table"
import Search from "@/lib/components/search"
import { fetchInvoicesPages } from "@/lib/utils/data"
import { lusitana } from "@/lib/utils/fonts"
import { Suspense } from "react"

export const runtime = "edge"

type InvoicesPageProps = {
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}

export default async function InvoicesPage(props: InvoicesPageProps) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ""
  const currentPage = Number(searchParams?.page) || 1
  const totalPages = await fetchInvoicesPages(query)

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <Search placeholder="Search invoices..." />
        </Suspense>
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  )
}
