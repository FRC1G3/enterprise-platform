"use client";

import { useState } from "react";
import { activityLogs } from "@/lib/mock-data";

const actions = ["Updated", "Created", "Refunded", "Alert"];

export default function ActivityLogsPage() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [user, setUser] = useState("");

  const rows = activityLogs.filter(
    (activity) =>
      (activity.description.toLowerCase().includes(q.toLowerCase()) ||
        activity.entity.toLowerCase().includes(q.toLowerCase())) &&
      (!action || activity.action === action) &&
      (!user || activity.user === user),
  );

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Audit trail</span>
          <h1>Activity logs</h1>
          <p className="leading-7 text-slate-500">Frontend demonstration of platform activity.</p>
        </div>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[170px] [&_input]:w-auto [&_select]:min-w-[170px] [&_select]:w-auto">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search activity"
          aria-label="Search activity"
        />
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          aria-label="Filter action"
        >
          <option value="">All actions</option>
          {actions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={user}
          onChange={(event) => setUser(event.target.value)}
          aria-label="Filter user"
        >
          <option value="">All users</option>
          <option>Ava Admin</option>
          <option>System</option>
        </select>
        <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="date" aria-label="Activity date" />
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description</th>
              <th>Date</th>
              <th>IP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((activity) => (
              <tr key={activity.id}>
                <td>
                  <strong>{activity.user}</strong>
                </td>
                <td>{activity.action}</td>
                <td>
                  <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">{activity.entity}</span>
                </td>
                <td>{activity.description}</td>
                <td>{activity.date}</td>
                <td className="leading-7 text-slate-500">{activity.ip}</td>
                <td>
                  <span
                    className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                      activity.status === "Success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

