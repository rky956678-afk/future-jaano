import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import horoscopeRouter from "./horoscope";
import kundliRouter from "./kundli";
import problemsRouter from "./problems";
import imageAnalysisRouter from "./imageAnalysis";
import numerologyRouter from "./numerology";
import yogaRouter from "./yoga";
import blogRouter from "./blog";
import subscriptionsRouter from "./subscriptions";
import adminRouter from "./admin";
import notificationsRouter from "./notifications";
import pushRouter from "./push";
import panchangRouter from "./panchang";
import gocharRouter from "./gochar";
import kundliMilanRouter from "./kundliMilan";
import dashaRouter from "./dasha";
import muhuratRouter from "./muhurat";
import ashtakavargaRouter from "./ashtakavarga";
import {
  aiHeavyLimiter,
  aiLightLimiter,
  generalLimiter,
  postOnly,
} from "../middlewares/rateLimit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(horoscopeRouter);
router.use(postOnly(aiHeavyLimiter), kundliRouter);
router.use(postOnly(aiHeavyLimiter), problemsRouter);
router.use(postOnly(aiHeavyLimiter), imageAnalysisRouter);
router.use(postOnly(aiLightLimiter), numerologyRouter);
router.use(postOnly(aiLightLimiter), yogaRouter);
router.use(blogRouter);
router.use(subscriptionsRouter);
router.use(adminRouter);
router.use(notificationsRouter);
router.use(pushRouter);
router.use(generalLimiter, panchangRouter);
router.use(aiLightLimiter, gocharRouter);
router.use(postOnly(aiHeavyLimiter), kundliMilanRouter);
router.use(postOnly(aiLightLimiter), dashaRouter);
router.use(postOnly(aiLightLimiter), muhuratRouter);
router.use(postOnly(aiLightLimiter), ashtakavargaRouter);

export default router;
