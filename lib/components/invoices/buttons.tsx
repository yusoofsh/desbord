import { deleteInvoice } from "@/lib/actions";
import { Button } from "@/lib/components/button";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const CreateInvoice = () => {
  return (
    <Link
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      href="/dashboard/invoices/create"
    >
      <span className="hidden md:block">Create Invoice</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
};

export const UpdateInvoice = ({ id }: { id: string }) => {
  id;
  return (
    <Link
      className="rounded-md border p-2 hover:bg-gray-100"
      href={`/dashboard/invoices/${id}/edit`}
    >
      <PencilIcon className="w-5" />
    </Link>
  );
};

export const DeleteInvoice = ({ id }: { id: string }) => {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  return (
    <form action={deleteInvoiceWithId}>
      <Button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </Button>
    </form>
  );
};
