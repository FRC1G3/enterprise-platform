import { activityLogs } from "@/lib/mock-data";

export function RecentActivity() {
  return (
    <div>
      {activityLogs.slice(0, 4).map((activity) => (
        <div
          className="grid grid-cols-[9px_1fr] gap-3 py-[11px]"
          key={activity.id}
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <div>
            <strong className="text-[13px]">{activity.description}</strong>
            <div className="text-xs leading-7 text-slate-500">
              {activity.user} · {activity.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
