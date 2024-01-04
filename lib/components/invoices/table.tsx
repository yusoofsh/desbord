import {
  DeleteInvoice,
  UpdateInvoice
} from "@/lib/components/invoices/buttons";
import { InvoiceStatus } from "@/lib/components/invoices/status";
import { formatCurrency, formatDateToLocal } from "@/lib/utils";
import { fetchFilteredInvoices } from "@/lib/utils/data";
import Image from "next/image";

export const InvoicesTable = async ({
  query,
  currentPage
}: {
  query: string;
  currentPage: number;
}) => {
  const invoices = await fetchFilteredInvoices(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {invoices.map((invoice) => (
              <div
                className="mb-2 w-full rounded-md bg-white p-4"
                key={invoice.id}
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        alt={`${invoice.name}'s profile`}
                        className="mr-2 rounded-full"
                        height={28}
                        src={invoice.image_url}
                        width={28}
                      />
                      <p>{invoice.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6" scope="col">
                  Customer
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Email
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Amount
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Date
                </th>
                <th className="px-3 py-5 font-medium" scope="col">
                  Status
                </th>
                <th className="relative py-3 pl-6 pr-3" scope="col">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices.map((invoice) => (
                <tr
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  key={invoice.id}
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        alt=""
                        className="rounded-full"
                        height={28}
                        src={invoice.image_url}
                        width={28}
                      />
                      <p>{invoice.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(invoice.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
