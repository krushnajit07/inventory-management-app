const express = require("express");
const cors = require("cors");
const path = require("path");

const productsRouter = require("./routes/products");

const app = express();


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve images

app.use("/api/products", productsRouter);

app.get("/", (req, res) => {
  res.json({ message: "Inventory Management Backend Running.." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
