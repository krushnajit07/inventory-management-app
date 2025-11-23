import "./index.css";

export default function DeletePopup({ isOpen, onClose, onConfirm, productName }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Delete Product</h3>
        <p>
          Are you sure you want to delete <strong>{productName}</strong>?
        </p>

        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
