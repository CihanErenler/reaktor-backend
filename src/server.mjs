import express from "express";
import http from "http";
import dotenv from "dotenv";
import axios from "axios";
import events from "events";
import { Server } from "socket.io";
import { formatObject, parseXML, detectViolation } from "./helpers.mjs";
import { eventHandler, pushToDb } from "./data/fetchData.mjs";
import { createConnection } from "./Data/db.mjs";
import PilotsRouter from "./Routers/PilotRouter.mjs";
dotenv.config();

// Base url
const baseURL = process.env.BASE_URL;
const pilotURL = process.env.PILOT_URL;

// Create server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: "*" },
});

// router
app.use("/api/1", PilotsRouter);

const DELAY = 2000;
const PORT = process.env.PORT || 3002;

export const eventEmmiter = new events.EventEmitter();

// Event Listeners
eventEmmiter.on("violations", (violations) =>
	eventHandler(pilotURL, violations, io)
);
eventEmmiter.on("push", (data) => pushToDb(data));

// Start function
const start = async () => {
	try {
		await createConnection();
		console.log("Connected to db...");

		server.listen(PORT, () => {
			console.log(`server listening on port ${PORT}...`);
		});

		setTimeout(async function run() {
			try {
				const result = await axios(baseURL);
				const jsonData = await parseXML(result.data);
				const drones = formatObject(jsonData);
				const violations = detectViolation(drones);

				if (violations.length > 0) {
					eventEmmiter.emit("violations", violations);
				}

				io.emit("drone-data", drones);

				// Call the run() again
				setTimeout(run, DELAY);
			} catch (error) {
				setTimeout(run, 500);
				if (error.message) {
					console.log(error.message);
				}
			}
		}, DELAY);
	} catch (error) {
		console.log("something went wrong");
	}
};

// Start the app
start();
