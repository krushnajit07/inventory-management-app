import "./index.css";

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="searchBar">
      <input
        type="text"
        placeholder="Search product name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
