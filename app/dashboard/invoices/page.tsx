import { CreateInvoice } from "@/lib/components/invoices/buttons";
import { Pagination } from "@/lib/components/invoices/pagination";
import { InvoicesTable } from "@/lib/components/invoices/table";
import { Search } from "@/lib/components/search";
import { InvoicesTableSkeleton } from "@/lib/components/skeletons";
import { fetchInvoicesPages } from "@/lib/utils/data";
import { lusitana } from "@/lib/utils/fonts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Invoices"
};

const InvoicesPage = async ({
  searchParams
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) => {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense fallback={<InvoicesTableSkeleton />} key={query + currentPage}>
        <InvoicesTable currentPage={currentPage} query={query} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
};
export default InvoicesPage;
