import "./HistorySidebar.css";

export default function HistorySidebar({ isOpen, onClose, history, product }) {
  if (!isOpen) return null;

  const formatTime = (ts) => {
    if (!ts) return "-";
    const d = new Date(ts);
    if (isNaN(d)) return ts;
    return d.toTimeString().split(" ")[0];  // HH:MM:SS
  };

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <h3>Inventory History</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <p className="product-title">
          Product: <strong>{product?.name}</strong>
        </p>

        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Old</th>
              <th>New</th>
              <th>Changed By</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-history">
                  No history found
                </td>
              </tr>
            ) : (
              history.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp?.split("T")[0]}</td>
                  <td>{log.oldStock}</td>
                  <td>{log.newStock}</td>
                  <td>{log.changedBy}</td>
                  <td>{formatTime(log.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
