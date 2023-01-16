import axios from "axios";
import { eventEmmiter } from "../server.mjs";
import Pilot from "../Models/PilotModel.mjs";

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
				eventEmmiter.emit("push", pilots);
			})
		)
		.catch((error) => {
			if (error.response.status === 429) {
				handleViolations(pilotURL, violations, socket);
				return;
			}
			console.error(error.response.statusText);
		});
};

export const pushToDb = async (data) => {
	try {
		data.forEach(async (pilot) => {
			const response = await Pilot.findOne({ pilotId: pilot.pilotId });

			if (response) {
				await Pilot.findOneAndUpdate({ lastSeen: Date.now() });
			}
			const { pilotId, firstName, lastName, phoneNumber, email } = pilot;
			const newPilot = new Pilot({
				pilotId,
				firstName,
				lastName,
				phoneNumber,
				email,
			});
			await newPilot.save();
		});

		eventEmmiter.emit("updateClient");
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
