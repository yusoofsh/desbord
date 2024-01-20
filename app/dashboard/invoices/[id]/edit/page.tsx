import { Breadcrumbs } from "@/lib/components/invoices/breadcrumbs";
import { InvoiceEditForm } from "@/lib/components/invoices/edit-form";
import { fetchCustomers, fetchInvoiceById } from "@/lib/utils/data";
import { notFound } from "next/navigation";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoices"
};

const InvoiceEditPage = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers()
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true
          }
        ]}
      />
      <InvoiceEditForm invoice={invoice} customers={customers} />
    </>
  );
};
export default InvoiceEditPage;
