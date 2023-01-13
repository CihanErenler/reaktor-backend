import axios from "axios";
import { eventEmmiter } from "../server.mjs";

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

export const pushToDb = async (data) => {};
