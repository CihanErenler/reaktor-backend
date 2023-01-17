import express from "express";
import { getClosestDistance } from "../controller/droneController.mjs";
import { getPilots } from "../controller/pilotsController.mjs";

const router = express.Router();

router.get("/pilots", getPilots);
router.get("/drone", getClosestDistance);

export default router;
