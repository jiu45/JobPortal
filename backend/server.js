require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

//Middleware to handle CORS
app.use(
    cors(
        {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
            //credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"],
        }
    )
);

connectDB()

//Middleware

app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);

//Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {}));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});