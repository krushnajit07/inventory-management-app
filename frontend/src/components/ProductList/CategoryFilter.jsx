import "./index.css";

export default function CategoryFilter({ products, selected, setSelected }) {
  
  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div className="categoryFilter">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {categories.map((cat, idx) => (
          <option key={idx} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
