import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fetchDroneData } from "./data/fetchData.mjs";
import { formatObject, parseXML, detectViolation } from "./helpers.mjs";
import dotenv from "dotenv";
dotenv.config();

const DELAY = 2000;

// Server port number
const port = process.env.PORT || 3002;

// Base api URL
const baseURL = process.env.BASE_URL;

// Create express app
const app = express();

// Create server
const server = http.createServer(app);

// Create socket server
const io = new Server(server, {
  cors: { origin: "*" },
});

// Fetch data every 2 seconds
setTimeout(async function run() {
  console.log("girdiii");
  try {
    const result = await fetchDroneData(baseURL);
    // Parse XML to JS
    const jsonData = await parseXML(result.data);
    // Re-arrange the object shape and calculate the distance to the nest for each drone
    const drones = formatObject(jsonData);
    // Filter violations
    const violations = detectViolation(drones);
    // Publish the data to all clients
    io.emit("drone-data", drones);

    // Call the run() again
    setTimeout(run, DELAY);
  } catch (error) {
    setTimeout(run, 0);
    throw new Error(error._events.response);
  }
}, DELAY);

server.listen(port, () => {
  console.log(`server listening on port ${port}...`);
});
