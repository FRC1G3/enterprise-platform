import Link from "next/link";

const linkGroups = [
  {
    title: "Shop",
    links: ["New Arrivals", "Men", "Women", "Shoes", "Accessories"],
  },
  {
    title: "Customer service",
    links: ["Contact us", "Shipping & delivery", "Returns", "Size guide", "FAQ"],
  },
  {
    title: "Company",
    links: ["Our story", "Careers", "Journal", "Sustainability", "Privacy"],
  },
];

const categoryLinks = ["Men", "Women", "Shoes", "Accessories"];

export function Footer() {
  return (
    <footer className="bg-slate-900 pt-[62px] text-slate-200">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="grid gap-11 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Link className="whitespace-nowrap text-[1.35rem] font-black" href="/">
              <span className="text-indigo-600">NOVA</span> STORE
            </Link>
            <p className="text-slate-400">
              Thoughtful essentials for a modern wardrobe. Designed to last, made
              to be lived in.
            </p>
            <div className="flex items-center gap-3" aria-label="Social media">
              <a className="text-slate-400" href="#" aria-label="Instagram">
                IG
              </a>
              <a className="text-slate-400" href="#" aria-label="Pinterest">
                PI
              </a>
              <a className="text-slate-400" href="#" aria-label="TikTok">
                TK
              </a>
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <div className="grid gap-[9px]">
                {group.links.map((link) => (
                  <Link
                    className="text-slate-400"
                    key={link}
                    href={
                      categoryLinks.includes(link)
                        ? `/products?category=${link}`
                        : "#"
                    }
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-[46px] flex items-center justify-between gap-10 rounded-2xl bg-slate-800 p-7 max-sm:flex-col max-sm:items-start"
        >
          <div>
            <strong>Join the Nova list</strong>
            <p className="m-1 text-slate-400">
              New drops, private offers and considered style notes.
            </p>
          </div>
          <form className="flex w-full max-w-[430px] gap-2 max-sm:flex-col">
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              type="email"
              placeholder="Email address"
              required
            />
            <button
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-indigo-800 px-[17px] py-2.5 font-bold text-white"
              type="button"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-12 flex justify-between border-t border-slate-700 py-[22px] text-[0.82rem] text-slate-400 max-sm:flex-col max-sm:gap-2">
          <span>© 2026 Nova Store. All rights reserved.</span>
          <span>Secure payments · Easy returns</span>
        </div>
      </div>
    </footer>
  );
}
