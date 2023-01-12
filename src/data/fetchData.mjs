import axios from "axios";

export const eventHandler = async (pilotURL, violations, socket) => {
	try {
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
						if (res.data) return true;
					});

					const pilots = temp.map((pilot) => pilot.data);
					socket.emit("violation", pilots);
				})
			);
	} catch (error) {
		console.error(error.message);
	}
};
