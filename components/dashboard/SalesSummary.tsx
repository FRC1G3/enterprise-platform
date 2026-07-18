const sales = [
  ["Mon", 42],
  ["Tue", 63],
  ["Wed", 48],
  ["Thu", 84],
  ["Fri", 72],
  ["Sat", 96],
  ["Sun", 76],
];

export function SalesSummary() {
  return (
    <div
      className="flex h-[190px] items-end gap-3"
      aria-label="Weekly sales bar chart"
    >
      {sales.map(([day, value]) => (
        <div
          className="relative min-h-5 flex-1 bg-indigo-500"
          style={{ height: `${value}%` }}
          key={day}
        >
          <span>{day}</span>
        </div>
      ))}
    </div>
  );
}
