import { Router } from "express";
import { cancelOrder, confirmOrder, createOrder, getOrderById, getOrders } from "../controllers/order.controller";

const router = Router();

router.post("/create", createOrder);
router.get("/list", getOrders);
router.get("/get/:id", getOrderById);
router.patch("/confirm/:id", confirmOrder);
router.patch("/cancel/:id", cancelOrder);

export default router;