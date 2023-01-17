import axios from "axios";
import { eventEmitter } from "../server.mjs";
import Pilot from "../models/PilotModel.mjs";
import Drone from "../models/DroneModel.mjs";
let closestDistance = null;

export const handleViolations = async (pilotURL, violations, socket) => {
	const calls = violations.map((v) => {
		const serialNumber = v.serialNumber;
		return axios.get(`${pilotURL}/${serialNumber}`);
	});

	axios
		.all(calls, {
			validateStatus: function (status) {
				return (status >= 200 && status < 300) || status === 404;
			},
		})
		.then(
			axios.spread((...response) => {
				const temp = response.filter((res) => {
					if (res.status === 200) return true;
				});

				const pilots = temp.map((pilot) => {
					return { createdAt: new Date(), ...pilot.data };
				});
				// socket.emit("violation", pilots);
				eventEmitter.emit("push", pilots);
			})
		)
		.catch((error) => {
			if (error.response) {
				if (error.response.status === 429) {
					handleViolations(pilotURL, violations, socket);
					return;
				}
			}
			console.log(error);
		});
};

export const pushToDb = async (data) => {
	try {
		data.forEach(async (pilot) => {
			const response = await Pilot.findOne({ pilotId: pilot.pilotId });

			if (response) {
				await Pilot.findOneAndUpdate(
					{ pilotId: pilot.pilotId },
					{ lastSeenAt: Date.now() }
				);
			} else {
				const { pilotId, firstName, lastName, phoneNumber, email } = pilot;
				const newPilot = new Pilot({
					pilotId,
					firstName,
					lastName,
					phoneNumber,
					email,
				});
				await newPilot.save();
			}
		});

		eventEmitter.emit("updateClient");
	} catch (error) {
		console.log(error);
	}
};

export const sendViolationsToClient = async (socket) => {
	try {
		const result = await Pilot.find({}).sort({ createdAt: -1 });
		socket.emit("violation", result);
	} catch (error) {
		console.log(error);
	}
};

export const setDrones = async (data, socket) => {
	if (!closestDistance) {
		try {
			const response = await Drone.find({});
			if (response.length === 0) {
				const newDrone = Drone({
					distanceToNest: Number(data[0].distanceToNest),
				});
				await newDrone.save();
				closestDistance = Number(data[0].distanceToNest);
			} else {
				closestDistance = response[0].distanceToNest;
			}
		} catch (error) {
			console.log(error);
		}
	}

	try {
		data.forEach(async (drone) => {
			if (Number(drone.distanceToNest) < closestDistance) {
				const response = await Drone.find({});
				await Drone.findOneAndUpdate(
					{ _id: response[0]._id },
					{ distanceToNest: Number(data[0].distanceToNest) }
				);
				closestDistance = Number(data[0].distanceToNest);
				socket.emit("closestDistance", Number(drone.distanceToNest));
			}
		});
	} catch (error) {
		console.log(error);
	}
};
