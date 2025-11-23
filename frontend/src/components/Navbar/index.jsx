import { Link, useLocation } from "react-router-dom";
import "./index.css";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h3>Inventory App</h3>
      </div>

      <div className="nav-links">
        <Link className={pathname === "/products" ? "active" : ""} to="/products">
          Products
        </Link>

        <Link className={pathname === "/add-product" ? "active" : ""} to="/add-product">
          Add Product
        </Link>
      </div>
    </nav>
  );
}
