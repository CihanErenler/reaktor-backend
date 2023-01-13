import axios from "axios";
import { eventEmmiter } from "../server.mjs";
import Pilot from "../Models/PilotModel.mjs";

export const eventHandler = async (pilotURL, violations, socket) => {
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

				const pilots = temp.map((pilot) => pilot.data);
				socket.emit("violation", pilots);
				eventEmmiter.emit("push", pilots);
			})
		)
		.catch((error) => {
			if (error.response.status === 429) {
				eventHandler(pilotURL, violations, socket);
				return;
			}
			console.error(error.response.statusText);
		});
};

export const pushToDb = async (data) => {
	data.forEach(async (pilot) => {
		try {
			const response = await Pilot.findOne({ pilotId: pilot.pilotId });
			if (!response) {
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
		} catch (error) {
			console.log(error);
		}
	});
};
