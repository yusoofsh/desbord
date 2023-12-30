import { fetchCardData } from "@/lib/data";
import { Card } from "@/ui/dashboard/cards";

export const CardWrapper = async () => {
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <>
      <Card title="Collected" type="collected" value={totalPaidInvoices} />
      <Card title="Pending" type="pending" value={totalPendingInvoices} />
      <Card title="Total Invoices" type="invoices" value={numberOfInvoices} />
      <Card
        title="Total Customers"
        type="customers"
        value={numberOfCustomers}
      />
    </>
  );
};
