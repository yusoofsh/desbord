import { Breadcrumbs } from "@/lib/components/invoices/breadcrumbs";
import { InvoiceAddForm } from "@/lib/components/invoices/create-form";
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
      <InvoiceAddForm customers={customers} />
    </main>
  );
};
export default InvoiceCreatePage;
