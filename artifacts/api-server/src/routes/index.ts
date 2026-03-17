import { Router, type IRouter } from "express";
import healthRouter from "./health";
import removeBgRouter from "./removeBg";
import analyzeFaceRouter from "./analyzeFace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(removeBgRouter);
router.use(analyzeFaceRouter);

export default router;
