"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";

import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useDebounce } from "@/hooks/useDebounce";

import type {
  ActivityLogStatus,
} from "@/types/activity";

const dateFormatter =
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function formatActivityValue(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function ActivityLogsPage() {
  const loadMoreTarget =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [action, setAction] =
    useState("");

  const [entity, setEntity] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [status, setStatus] =
    useState<
      ActivityLogStatus | ""
    >("");

  const [date, setDate] =
    useState("");

  const debouncedSearch =
    useDebounce(search, 350);

  const {
    items,
    total,
    filters,

    error,

    isLoading,
    isLoadingMore,
    isRefreshing,

    hasMore,

    loadMore,
    refresh,
  } = useActivityLogs({
    limit: 20,

    search:
      debouncedSearch ||
      undefined,

    action:
      action || undefined,

    entity:
      entity || undefined,

    userId:
      userId || undefined,

    status:
      status || undefined,

    date:
      date || undefined,
  });

  const hasActiveFilters =
    useMemo(
      () =>
        Boolean(
          search ||
            action ||
            entity ||
            userId ||
            status ||
            date,
        ),
      [
        search,
        action,
        entity,
        userId,
        status,
        date,
      ],
    );

  useEffect(() => {
    const target =
      loadMoreTarget.current;

    if (
      !target ||
      !hasMore ||
      isLoadingMore
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const firstEntry =
            entries[0];

          if (
            firstEntry?.isIntersecting
          ) {
            void loadMore();
          }
        },
        {
          rootMargin: "250px",
        },
      );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    isLoadingMore,
    loadMore,
  ]);

  function clearFilters() {
    setSearch("");
    setAction("");
    setEntity("");
    setUserId("");
    setStatus("");
    setDate("");
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            Audit trail
          </span>

          <h1>Activity logs</h1>

          <p className="leading-7 text-slate-500">
            {total}{" "}
            {total === 1
              ? "activity record"
              : "activity records"}{" "}
            found.
          </p>
        </div>

        <Button
          variant="secondary"
          loading={isRefreshing}
          disabled={isLoading}
          onClick={() =>
            void refresh()
          }
        >
          Refresh
        </Button>
      </div>

      <div className="mb-[18px] grid gap-2.5 sm:grid-cols-2 xl:grid-cols-6">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 xl:col-span-2"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search activity, user or IP"
          aria-label="Search activity logs"
        />

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={action}
          onChange={(event) =>
            setAction(
              event.target.value,
            )
          }
          aria-label="Filter activity action"
        >
          <option value="">
            All actions
          </option>

          {filters.actions.map(
            (filterAction) => (
              <option
                key={filterAction}
                value={filterAction}
              >
                {formatActivityValue(
                  filterAction,
                )}
              </option>
            ),
          )}
        </select>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={entity}
          onChange={(event) =>
            setEntity(
              event.target.value,
            )
          }
          aria-label="Filter activity entity"
        >
          <option value="">
            All entities
          </option>

          {filters.entities.map(
            (filterEntity) => (
              <option
                key={filterEntity}
                value={filterEntity}
              >
                {formatActivityValue(
                  filterEntity,
                )}
              </option>
            ),
          )}
        </select>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={userId}
          onChange={(event) =>
            setUserId(
              event.target.value,
            )
          }
          aria-label="Filter activity user"
        >
          <option value="">
            All users
          </option>

          {filters.users.map(
            (filterUser) => (
              <option
                key={filterUser.id}
                value={filterUser.id}
              >
                {filterUser.name} —{" "}
                {filterUser.email}
              </option>
            ),
          )}
        </select>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target
                .value as
                | ActivityLogStatus
                | "",
            )
          }
          aria-label="Filter activity status"
        >
          <option value="">
            All statuses
          </option>

          <option value="SUCCESS">
            Success
          </option>

          <option value="FAILED">
            Failed
          </option>
        </select>

        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          type="date"
          value={date}
          onChange={(event) =>
            setDate(
              event.target.value,
            )
          }
          aria-label="Filter activity date"
        />
      </div>

      {hasActiveFilters && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}

      {error && (
        <div
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          Activity logs could not be
          loaded. {error.message}
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[1050px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description</th>
              <th>Date</th>
              <th>IP address</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-slate-500"
                >
                  Loading activity
                  logs...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-slate-500"
                >
                  No activity records
                  match the selected
                  filters.
                </td>
              </tr>
            ) : (
              items.map(
                (activity) => (
                  <tr key={activity.id}>
                    <td>
                      {activity.user ? (
                        <>
                          <strong className="block">
                            {
                              activity.user
                                .name
                            }
                          </strong>

                          <span className="text-xs text-slate-500">
                            {
                              activity.user
                                .email
                            }
                          </span>
                        </>
                      ) : (
                        <strong>
                          System
                        </strong>
                      )}
                    </td>

                    <td>
                      <span className="font-semibold">
                        {formatActivityValue(
                          activity.action,
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">
                        {formatActivityValue(
                          activity.entity,
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="block max-w-[330px]">
                        {
                          activity.description
                        }
                      </span>

                      {activity.entityId && (
                        <span className="mt-1 block max-w-[300px] truncate font-mono text-[0.72rem] text-slate-400">
                          ID:{" "}
                          {
                            activity.entityId
                          }
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap">
                      {dateFormatter.format(
                        new Date(
                          activity.createdAt,
                        ),
                      )}
                    </td>

                    <td className="font-mono text-xs text-slate-500">
                      {activity.ipAddress ??
                        "—"}
                    </td>

                    <td>
                      <span
                        className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                          activity.status ===
                          "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {formatActivityValue(
                          activity.status,
                        )}
                      </span>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      <div
        ref={loadMoreTarget}
        className="flex min-h-[100px] items-center justify-center py-7"
      >
        {isLoadingMore &&
          !isLoading && (
            <p className="text-sm text-slate-500">
              Loading more activity...
            </p>
          )}

        {!isLoadingMore &&
          hasMore && (
            <Button
              variant="secondary"
              onClick={() =>
                void loadMore()
              }
            >
              Load more
            </Button>
          )}

        {!isLoading &&
          !hasMore &&
          items.length > 0 && (
            <p className="text-sm text-slate-500">
              All activity records have
              been loaded.
            </p>
          )}
      </div>
    </>
  );
}