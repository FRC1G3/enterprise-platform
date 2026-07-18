import { products } from "@/lib/mock-data";

const category = [
  ["Women", 38],
  ["Men", 31],
  ["Shoes", 21],
  ["Accessories", 10],
];

const months = [
  ["Feb", 38],
  ["Mar", 48],
  ["Apr", 54],
  ["May", 67],
  ["Jun", 76],
  ["Jul", 92],
];

const summaryStats = [
  ["Revenue", "$48,290", "+12.4%"],
  ["Orders", "1,284", "+8.2%"],
  ["Conversion", "3.82%", "+0.4%"],
  ["Avg. order value", "$118.40", "+6.1%"],
];

const orderStatusDistribution = [
  ["Delivered", 66],
  ["Processing", 19],
  ["Shipped", 11],
  ["Cancelled", 4],
];

export default function AdminAnalyticsPage() {
  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Performance</span>
          <h1>Analytics</h1>
          <p className="leading-7 text-slate-500">
            A visual overview based on static demonstration data.
          </p>
        </div>
        <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" defaultValue="30" aria-label="Analytics period">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((stat) => (
          <article
            className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]"
            key={stat[0]}
          >
            <span className="leading-7 text-slate-500">{stat[0]}</span>
            <strong>{stat[1]}</strong>
            <span className="text-emerald-700">{stat[2]}</span>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h2>Customer growth</h2>
          <div className="flex h-[190px] items-end gap-3">
            {months.map(([month, value]) => (
              <div
                className="relative min-h-5 flex-1 bg-indigo-500"
                key={month}
                style={{ height: `${value}%` }}
              >
                <span>{month}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h2>Sales by category</h2>
          {category.map(([label, value]) => (
            <div className="my-[18px]" key={label}>
              <div className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <strong>{value}%</strong>
              </div>
              <div className="h-2 bg-slate-200">
                <span
                  className="block h-full bg-indigo-600"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h2>Top-selling products</h2>
          {products.slice(0, 5).map((product, index) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-slate-200 py-3"
              key={product.id}
            >
              <div>
                <strong>
                  {index + 1}. {product.name}
                </strong>
                <div className="leading-7 text-slate-500">{product.category}</div>
              </div>
              <span>{214 - index * 27} sales</span>
            </div>
          ))}
        </section>

        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h2>Order status distribution</h2>
          {orderStatusDistribution.map(([label, value]) => (
            <div className="my-[18px]" key={label}>
              <div className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <strong>{value}%</strong>
              </div>
              <div className="h-2 bg-slate-200">
                <span
                  className="block h-full bg-indigo-600"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

