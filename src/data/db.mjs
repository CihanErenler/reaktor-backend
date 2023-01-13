import mongoose from "mongoose";

export const createConnection = () => {
	return mongoose.connect(process.env.DB_URL);
};
