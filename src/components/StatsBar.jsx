const STATS = [
  { value: "5,000+", label: "Products Listed" },
  { value: "50,000+", label: "Orders Delivered" },
  { value: "10,000+", label: "Happy Customers" },
  { value: "9", label: "Product Categories" },
  { value: "64", label: "Districts Served" },
];

export default function StatsBar() {
  return (
    <section className="bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
