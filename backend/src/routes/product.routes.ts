import { Router } from "express";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller";

const route = Router();

route.post("/create", createProduct);
route.get("/list", getProducts);
route.get("/get/:id", getProductById);
route.put("/update/:id", updateProduct);
route.delete("/delete/:id", deleteProduct);

export default route;