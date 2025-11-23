import { useEffect, useState } from "react";
import API from "../../services/api";
import "./index.css";

import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import HeaderActions from "./HeaderActions";
import ProductRow from "./ProductRow/";
import ProductRowEditable from "./ProductRowEditable";

import DeletePopup from "./DeletePopup";
import HistorySidebar from "./HistorySidebar";




export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);


  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products once
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };
  
  const saveEdit = async (id, rowData) => {
    try {
      const res = await API.put(`/products/${id}`, {
        ...rowData,
        changedBy: "admin",
      });
  
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
  
      setEditingId(null);
    } catch (err) {
      alert("Error updating product");
      console.log(err);
    }
  };


  // Derived filtered list
  const filtered = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) =>
      category === "All" ? true : p.category === category
    );
    

    const requestDelete = (product) => {
      setProductToDelete(product);
      setDeletePopupOpen(true);
    };

    const confirmDelete = async () => {
      try {
        await API.delete(`/products/${productToDelete.id}`);
        
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        
        setDeletePopupOpen(false);
        setProductToDelete(null);
      } catch (err) {
        alert("Error deleting product");
        console.error(err);
      }
    };

    const openHistorySidebar = async (productId) => {
      try {
        setHistoryData([]);
        const res = await API.get(`/products/${productId}/history`);
        
        const productObj = products.find((p) => p.id === productId);
        
        setSelectedProduct(productObj);
        setHistoryData(res.data || []);
        setHistoryOpen(true);
      } catch (err) {
        console.error("Error fetching history:", err);
        alert("Could not fetch history");
      }
    };

  
  return (
    <div className="container">
      <h2>Inventory Products</h2>

      <div className="headerRow">
        <SearchBar search={search} setSearch={setSearch} />
        <CategoryFilter
          products={products}
          selected={category}
          setSelected={setCategory}
        />
        <HeaderActions refreshProducts={fetchProducts} />
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">
                No products found
              </td>
            </tr>
          ) : (
            filtered.map((item) =>
              editingId === item.id ? (
                <ProductRowEditable
                  key={item.id}
                  product={item}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                />
              ) : (
                <ProductRow
                  key={item.id}
                  product={item}
                  onEdit={() => startEdit(item)}
                  onDelete={() => requestDelete(item)}
                  onOpenHistory={openHistorySidebar}
                />
              )
            )

          )}
        </tbody>
      </table>

      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyData}
        product={selectedProduct}
      />

      <DeletePopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={confirmDelete}
        productName={productToDelete?.name}
      />
    </div>
  );
}   
