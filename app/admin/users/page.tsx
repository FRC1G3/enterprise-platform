"use client";

import { useState } from "react";
import { users } from "@/lib/mock-data";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const rows = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(q.toLowerCase()) ||
        user.email.toLowerCase().includes(q.toLowerCase())) &&
      (!role || user.role === role),
  );

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Customers</span>
          <h1>Users</h1>
          <p className="leading-7 text-slate-500">View customer accounts and roles.</p>
        </div>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[170px] [&_input]:w-auto [&_select]:min-w-[170px] [&_select]:w-auto">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search users"
          aria-label="Search users"
        />
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Filter role"
        >
          <option value="">All roles</option>
          <option>USER</option>
          <option>ADMIN</option>
        </select>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Total spent</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-[11px]">
                    <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-indigo-100 text-xs font-black text-indigo-800">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <strong>{user.name}</strong>
                      <div className="leading-7 text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">{user.role}</span>
                </td>
                <td>{user.orders}</td>
                <td>${user.spent}</td>
                <td>
                  <span
                    className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                      user.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td>{user.joined}</td>
                <td>
                  <button className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.82rem] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50" type="button">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

