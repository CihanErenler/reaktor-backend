import mongoose from "mongoose";

const Drone = new mongoose.Schema({
	distanceToNest: {
		type: Number,
		require: true,
	},
	serialNumber: {
		type: String,
		require: true,
	},
	lastSeenAt: {
		type: Date,
		default: Date.now,
		expire: 600,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 600,
	},
});

export default mongoose.model("Drone", Drone);
