import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Push API working",
  });
});

export default router;
