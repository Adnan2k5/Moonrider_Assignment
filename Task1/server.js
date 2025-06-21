import express from "express";

import connectDB from "./config/db.config.js";
import router from "./routes/contacts.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection error:", err));
});
