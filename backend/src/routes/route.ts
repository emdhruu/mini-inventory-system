import { Router } from "express";
import productRoutes from "./product.routes";
import customerRoutes from "./customer.routes";
import orderRoutes from "./order.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/product", productRoutes);
router.use("/customer", customerRoutes);
router.use("/order", orderRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;