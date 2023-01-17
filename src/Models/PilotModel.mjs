import mongoose from "mongoose";

const Pilot = new mongoose.Schema({
	firstName: {
		type: String,
		require: true,
	},
	lastName: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
	},
	phoneNumber: {
		type: String,
		require: true,
	},
	pilotId: {
		type: String,
		require: true,
	},
	lastSeenAt: {
		type: Date,
		default: Date.now,
		expires: 600,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model("Pilot", Pilot);
