import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  return res.json({
    success: true,
    message: "Push notifications route working",
  });
});

export default router;
