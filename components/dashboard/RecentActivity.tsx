import Link from "next/link";

import type {
  DashboardActivityItem,
} from "@/types/analytics";

const dateFormatter =
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface RecentActivityProps {
  items: DashboardActivityItem[];
}

export function RecentActivity({
  items,
}: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div>
      {items.map((activity) => (
        <div
          className="grid grid-cols-[9px_1fr] gap-3 py-[11px]"
          key={activity.id}
        >
          <span
            className={`mt-1 h-2 w-2 rounded-full ${
              activity.status ===
              "SUCCESS"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />

          <div>
            <strong className="text-[13px]">
              {activity.description}
            </strong>

            <div className="text-xs leading-7 text-slate-500">
              {activity.userName} ·{" "}
              {dateFormatter.format(
                new Date(
                  activity.createdAt,
                ),
              )}
            </div>
          </div>
        </div>
      ))}

      <Link
        href="/admin/activity"
        className="mt-3 inline-flex font-bold text-indigo-800"
      >
        View all activity
      </Link>
    </div>
  );
}