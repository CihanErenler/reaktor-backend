import Drone from "../Models/DroneModel.mjs";

export const getClosestDistance = async (req, res) => {
	try {
		const response = await Drone.find({});
		res.status(200);
		res.json({ data: response });
		return;
	} catch (error) {
		console.log(error);
	}
};
