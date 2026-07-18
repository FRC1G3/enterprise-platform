export default function Loading() {
  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 h-11 w-2/5 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-x-5 gap-y-[26px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="aspect-[4/5] rounded-lg bg-slate-200" />
              <div className="mt-3.5 h-[18px] w-[70%] rounded-lg bg-slate-200" />
              <div className="mt-2.5 h-4 w-2/5 rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

