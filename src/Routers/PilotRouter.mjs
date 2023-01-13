import express from "express";
import { getPilots } from "../Controller/pilotsController.mjs";

const router = express.Router();

router.get("/pilots", getPilots);

export default router;
