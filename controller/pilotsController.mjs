import Pilot from "../models/PilotModel.mjs";

export const getPilots = async (req, res) => {
	try {
		const result = await Pilot.find({}).sort({ createdAt: -1 });
		res.status(200);
		res.json({ data: result });
	} catch (error) {
		throw new Error(error);
	}
};
