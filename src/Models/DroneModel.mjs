import mongoose from "mongoose";

const Drone = new mongoose.Schema({
	distanceToNest: {
		type: Number,
		require: true,
	},
	lastSeenAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model("Drone", Drone);
