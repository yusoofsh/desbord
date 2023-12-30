import { fetchCardData, fetchLatestInvoices, fetchRevenue } from "@/lib/data";
import { Card } from "@/ui/dashboard/cards";
import { LatestInvoices } from "@/ui/dashboard/latest-invoices";
import { RevenueChart } from "@/ui/dashboard/revenue-chart";
import { lusitana } from "@/ui/fonts";

const DashboardPage = async () => {
  const revenuePromise = fetchRevenue();
  const latestInvoicesPromise = fetchLatestInvoices();
  const cardDataPromise = fetchCardData();

  const {
    "0": revenue,
    "1": latestInvoices,
    "2": {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    },
  } = await Promise.all([
    revenuePromise,
    latestInvoicesPromise,
    cardDataPromise,
  ]);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" type="collected" value={totalPaidInvoices} />
        <Card title="Pending" type="pending" value={totalPendingInvoices} />
        <Card title="Total Invoices" type="invoices" value={numberOfInvoices} />
        <Card
          title="Total Customers"
          type="customers"
          value={numberOfCustomers}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
};
export default DashboardPage;
