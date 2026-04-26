import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";
import promosRouter from "./promos";
import paymentsRouter from "./payments";
import meRouter from "./me";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(dashboardRouter);
router.use(ordersRouter);
router.use(promosRouter);
router.use(paymentsRouter);
router.use(meRouter);
router.use(adminRouter);

export default router;
