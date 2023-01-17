import express from "express";
import { getClosestDistance } from "../Controller/droneController.mjs";
import { getPilots } from "../Controller/pilotsController.mjs";

const router = express.Router();

router.get("/pilots", getPilots);
router.get("/drone", getClosestDistance);

export default router;
