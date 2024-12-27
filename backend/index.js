import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import authRoutes from "./routes/AuthRoutes.js"
import contactsRoutes from "./routes/ContactRoutes.js"
import setupSocket from "./socket.js"
import messagesRoute from "./routes/MessagseRoute.js"
import channelRoutes from "./routes/ChannelRoutes.js"
import path from "path"

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 4001;

const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
// app.use(cors());


app.use("/uploads/profiles", express.static("uploads/profiles"));
// app.use("/uploads/files", express.static("uploads/files"));
app.use("/uploads/profiles", express.static(path.join(__dirname, "uploads/profiles")));


app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoute);
app.use("/api/channels", channelRoutes);



mongoose.connect(databaseURL).then(() => {
    console.log("Database is connected");
}).catch((err) => {
    console.log(err.message);
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
setupSocket(server);