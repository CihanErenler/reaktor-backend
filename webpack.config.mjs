import { fileURLToPath } from "url";
import webpackNodeExternals from "webpack-node-externals";

export default {
	target: "async-node",
	entry: {
		main: "./index.mjs",
	},
	mode: "production",
	node: {
		__dirname: false,
		__filename: false,
	},
	externals: [webpackNodeExternals()],
	// module: {
	// 	rules: [
	// 		{
	// 			test: /\.m?js$/,
	// 			exclude: /node_modules/,
	// 			use: {
	// 				loader: "babel-loader",
	// 			},
	// 		},
	// 	],
	// },
	output: {
		filename: "server.js",
		path: fileURLToPath(new URL("dist", import.meta.url)),
	},
};
