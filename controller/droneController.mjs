import Drone from "../models/DroneModel.mjs";

export const getClosestDistance = async (req, res) => {
	try {
		const response = await Drone.find({}).sort("distanceToNest").limit(1);
		res.status(200);
		res.json({ data: response });
		return;
	} catch (error) {
		console.log(error);
	}
};
