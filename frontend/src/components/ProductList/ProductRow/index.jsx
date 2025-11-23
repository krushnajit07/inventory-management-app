import "./index.css";

export default function ProductRow({ product, onEdit, onDelete, onOpenHistory }) {
  return (
    <tr>
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

      <td onClick={() => onOpenHistory(product.id)} className="clickable-cell">
        {product.name}
      </td>

      <td>{product.unit || "-"}</td>
      <td>{product.category || "-"}</td>
      <td>{product.brand || "-"}</td>
      <td>{product.stock}</td>

      <td>
        <span
          className={product.status === "In Stock" ? "status-green" : "status-red"}
        >
          {product.status}
        </span>
      </td>

      <td>
        <button className="action-btn edit" onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="action-btn delete" onClick={() => onDelete(product.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
