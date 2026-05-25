import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    return res.json({
      success: true,
      message: "Horoscope route working",
      data: [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
