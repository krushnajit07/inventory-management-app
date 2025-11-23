import "./ProductRowEditable.css";
import { useState } from "react";

export default function ProductRowEditable({ product, onSave, onCancel }) {
  const [rowData, setRowData] = useState({
    name: product.name,
    unit: product.unit,
    category: product.category,
    brand: product.brand,
    price: product.price,
    stock: product.stock,
  });

  const handleChange = (e) => {
    setRowData({ ...rowData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(product.id, rowData);
  };

  return (
    <tr className="editable-row">
      {/* Keep image non-editable */}
      <td>
        {product.image ? (
          <img
            src={`http://localhost:5000${product.image}`}
            alt="product"
            className="prod-img"
          />
        ) : (
          <div className="no-img">No Image</div>
        )}
      </td>

      <td>
        <input name="name" value={rowData.name} onChange={handleChange} />
      </td>

      <td>
        <input name="unit" value={rowData.unit || ""} onChange={handleChange} />
      </td>

      <td>
        <input name="category" value={rowData.category || ""} onChange={handleChange} />
      </td>

      <td>
        <input name="brand" value={rowData.brand || ""} onChange={handleChange} />
      </td>

      <td>
        <input
          name="stock"
          type="number"
          min="0"
          value={rowData.stock}
          onChange={handleChange}
        />
      </td>

      <td>
        <span className="status-grey">Updating</span>
      </td>

      <td>
        <button className="action-btn save" onClick={handleSave}>
          Save
        </button>
        <button className="action-btn cancel" onClick={onCancel}>
          Cancel
        </button>
      </td>
    </tr>
  );
}
