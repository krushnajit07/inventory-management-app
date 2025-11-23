import { useState } from "react";
import API from "../../services/api";
import "./index.css";

export default function AddProductForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    unit: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
  });

  const [image, setImage] = useState(null);         
  const [preview, setPreview] = useState(null);     
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || form.name.trim() === "") {
      setMsg("Product name is required.");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const res = await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);
      setMsg("Product created successfully ✔");

      setForm({
        name: "",
        description: "",
        unit: "",
        category: "",
        brand: "",
        price: "",
        stock: "",
      });
      setImage(null);
      setPreview(null);
    } catch (err) {
      setLoading(false);
      setMsg(err.response?.data?.error || "Something went wrong");
      console.error("Error:", err);
    }
  };

  return (
    <div className="add-form-container">
      <h2>Add New Product</h2>

      <form onSubmit={handleSubmit} className="add-form">

        <label>Product Name *</label>
        <input
          type="text"
          name="name"
          placeholder="Enter product name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Enter description"
          value={form.description}
          onChange={handleChange}
        />

        <label>Unit</label>
        <input
          type="text"
          name="unit"
          placeholder="e.g. pcs, box"
          value={form.unit}
          onChange={handleChange}
        />

        <label>Category</label>
        <input
          type="text"
          name="category"
          placeholder="e.g. Electronics"
          value={form.category}
          onChange={handleChange}
        />

        <label>Brand</label>
        <input
          type="text"
          name="brand"
          placeholder="Brand name"
          value={form.brand}
          onChange={handleChange}
        />

        <label>Price</label>
        <input
          type="number"
          name="price"
          placeholder="0"
          value={form.price}
          onChange={handleChange}
        />

        <label>Stock</label>
        <input
          type="number"
          name="stock"
          placeholder="0"
          value={form.stock}
          onChange={handleChange}
        />

        <label>Product Image</label>
        <input type="file" accept="image/*" onChange={handleImage} />

        {preview && (
          <img src={preview} alt="preview" className="preview-img" />
        )}

        {msg && <p className="msg">{msg}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
