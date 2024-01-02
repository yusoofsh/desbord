import { Breadcrumbs } from "@/lib/components/invoices/breadcrumbs";
import { AddInvoiceForm } from "@/lib/components/invoices/create-form";
import { fetchCustomers } from "@/lib/utils/data";

const InvoiceCreatePage = async () => {
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Create Invoice",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />
      <AddInvoiceForm customers={customers} />
    </main>
  );
};
export default InvoiceCreatePage;
