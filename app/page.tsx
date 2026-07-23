import Image from "next/image";
import Link from "next/link";
import { ProductList } from "@/components/products/ProductList";
import { categories } from "@/lib/catalog-data";
import {
  getFeaturedProducts,
  getNewArrivalProducts,
} from "@/lib/services/product.service";
export const revalidate = 60;
const benefits = [
  ["↗", "Free shipping", "On orders over $100"],
  ["⌁", "Secure checkout", "Protected mock payments"],
  ["↩", "Easy returns", "30-day return window"],
  ["○", "Customer support", "Here whenever you need us"],
];

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(4),
    getNewArrivalProducts(4),
  ]);

  return (
    <>
      <section className="grid min-h-[650px] overflow-hidden bg-[#f1f3f6] md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-[72px] md:pr-[7vw] lg:pl-[max(32px,calc((100vw-1180px)/2))]">
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">New season · 2026</span>
          <h1 className="my-6 text-[clamp(3rem,6vw,5.8rem)] leading-[0.93] tracking-[-0.065em]">
            Quiet confidence, made wearable.
          </h1>
          <p>
            Discover modern essentials designed with purpose. Clean silhouettes,
            considered details and lasting quality for every day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[22px] py-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900" href="/products">
              Shop collection →
            </Link>
            <Link
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[22px] py-[13px] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
              href="/products?sort=featured"
            >
              Explore new arrivals
            </Link>
          </div>
        </div>

        <div className="relative min-h-[540px]">
          <Image
            className="object-cover"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=90"
            alt="Nova Store seasonal collection"
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute bottom-6 left-6 rounded-[10px] bg-white/90 px-5 py-4">
            <strong>The Modern Edit</strong>
            <div className="leading-7 text-slate-500">12 timeless new pieces</div>
          </div>
        </div>
      </section>

      <section className="py-[72px]">
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Shop by category</span>
              <h2 className="my-2 text-[clamp(1.8rem,4vw,2.7rem)] leading-[1.1]">Find your next favorite</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                className="group relative h-[410px] overflow-hidden rounded-xl"
                href={`/products?category=${category.name}`}
                key={category.name}
              >
                <Image
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width:480px) 100vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-[22px] pb-[22px] pt-[50px] text-white">
                  <h3 className="mb-1 mt-0 text-[1.4rem]">{category.name}</h3>
                  <span>{category.description} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f9] py-[72px]">
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Editors&apos; selection</span>
              <h2 className="my-2 text-[clamp(1.8rem,4vw,2.7rem)] leading-[1.1]">Featured pieces</h2>
            </div>
            <Link href="/products">View all products →</Link>
          </div>
          <ProductList products={featured} />
        </div>
      </section>

      <section className="py-[72px]">
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <div className="flex items-center justify-between gap-[30px] rounded-2xl bg-indigo-950 p-[54px] text-white max-sm:flex-col max-sm:items-start max-sm:px-6 max-sm:py-[34px]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-300">
                Limited time
              </span>
              <h2 className="my-1.5 text-[clamp(2rem,4vw,3.6rem)]">
                Up to 30% off
              </h2>
              <p>Selected pieces from the seasonal edit. While stock lasts.</p>
              <Link className="inline-flex min-h-[42px] items-center justify-center text-black-600 gap-2 rounded-lg border border-slate-300 bg-indigo px-[17px] py-2.5 font-bold  transition hover:-translate-y-px " href="/products">
                Shop the offer
              </Link>
            </div>
            <div className="rounded-[10px] border border-dashed border-indigo-300 p-[18px]">
              <small>USE CODE</small>
              <strong className="mt-1.5 block text-2xl">
                NOVA30
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[72px]">
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Just landed</span>
              <h2 className="my-2 text-[clamp(1.8rem,4vw,2.7rem)] leading-[1.1]">New arrivals</h2>
            </div>
          </div>
          <ProductList products={newArrivals} />
        </div>
      </section>

      <section className="bg-[#f6f7f9] py-[72px]">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-[22px] px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {benefits.map((item) => (
            <div className="border-l-2 border-indigo-200 p-[26px]" key={item[1]}>
              <span>{item[0]}</span>
              <h3>{item[1]}</h3>
              <p className="leading-7 text-slate-500">{item[2]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-[72px]">
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <div className="flex items-center justify-between gap-10 rounded-2xl bg-indigo-50 p-[54px] max-sm:flex-col max-sm:items-start max-sm:px-6 max-sm:py-[34px]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Stay in the know</span>
              <h2 className="my-2 text-[clamp(1.8rem,4vw,2.7rem)] leading-[1.1]">A better inbox starts here.</h2>
              <p className="leading-7 text-slate-500">
                Private offers, new arrivals and thoughtful style notes.
              </p>
            </div>
            <form className="flex w-full max-w-[430px] gap-2 max-sm:flex-col">
              <label className="sr-only" htmlFor="home-email">
                Email
              </label>
              <input
                id="home-email"
                type="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Your email address"
                required
              />
              <button className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900" type="button">
                Join us
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
