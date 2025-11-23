import "./HeaderActions.css";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function HeaderActions({ refreshProducts }) {

  const navigate = useNavigate();

  // Handle Export CSV
  const handleExport = () => {
    window.location.href = "http://localhost:5000/api/products/export";
  };

  // Handle Import CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csvFile", file);

    API.post("/products/import", formData)
      .then((res) => {
        alert(`Import Complete. Added: ${res.data.added}, Skipped: ${res.data.skipped}`);
        refreshProducts(); // refresh table data
      })
      .catch((err) => {
        alert("Error importing CSV");
        console.error(err);
      });
  };

  return (
    <div className="headerActions">
      <button className="addBtn" onClick={() => navigate("/add-product")}>
        + Add Product
      </button>

      <label className="importBtn">
        Import CSV
        <input type="file" accept=".csv" onChange={handleImport} />
      </label>

      <button className="exportBtn" onClick={handleExport}>
        Export CSV
      </button>
    </div>
  );
}
