import express from "express";
import http from "http";
import dotenv from "dotenv";
import axios from "axios";
import events from "events";
import { Server } from "socket.io";
import { formatObject, parseXML, detectViolation } from "./helpers.mjs";
import { eventHandler } from "./data/fetchData.mjs";
dotenv.config();

// Base api URL
const baseURL = process.env.BASE_URL;
const pilotURL = process.env.PILOT_URL;
// Create express app
const app = express();
// Create server
const server = http.createServer(app);
// Create socket server
const io = new Server(server, {
	cors: { origin: "*" },
});

// Global variables
const DELAY = 2000;
const PORT = process.env.PORT || 3002;
let violations;

// Declare event emmiter
const eventEmmiter = new events.EventEmitter();

// Fetch data every 2 seconds
setTimeout(async function run() {
	try {
		const result = await axios(baseURL);
		// Parse XML to JS
		const jsonData = await parseXML(result.data);
		// Re-arrange the object shape and calculate the distance to the nest for each drone
		const drones = formatObject(jsonData);
		// Filter violations
		violations = detectViolation(drones);

		// if there is a violation emmit an event
		if (violations.length > 0) {
			eventEmmiter.emit("violations");
		}

		// Publish the data to all clients
		io.emit("drone-data", drones);

		// Call the run() again
		setTimeout(run, DELAY);
	} catch (error) {
		setTimeout(run, 500);
		console.error(error.response.statusText);
	}
}, DELAY);

// Call the event handler when a new violation happens
eventEmmiter.on("violations", () => eventHandler(pilotURL, violations, io));

server.listen(PORT, () => {
	console.log(`server listening on port ${PORT}...`);
});
