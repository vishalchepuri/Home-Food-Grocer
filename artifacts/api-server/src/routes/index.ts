import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(dashboardRouter);
router.use(ordersRouter);
router.use(paymentsRouter);

export default router;
