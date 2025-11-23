import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";

import ProductList from "./components/ProductList";
import AddProductForm from "./components/AddProductForm";
import Layout from "./components/Layout";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/products" />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/add-product" element={<AddProductForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
