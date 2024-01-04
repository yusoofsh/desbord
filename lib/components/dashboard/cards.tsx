import { lusitana } from "@/lib/utils/fonts";
import {
  BanknotesIcon,
  ClockIcon,
  InboxIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon
};

export const Card = ({
  title,
  value,
  type
}: {
  title: string;
  value: number | string;
  type: undefined | "invoices" | "customers" | "pending" | "collected";
}) => {
  const Icon = type ? iconMap[type] : undefined;

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
};
