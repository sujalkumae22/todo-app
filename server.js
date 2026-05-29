require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("./user");
const Task = require("./task");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static(__dirname));

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Register
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.json({ message: "Registration Successful" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

        res.json({
            message: "Login Successful",
            token,
            userId: user._id
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Create Task
app.post("/task", async (req, res) => {
    try {
        const { title, userId } = req.body;

        const task = new Task({
            title,
            userId,
            completed: false
        });

        await task.save();

        res.json({ message: "Task created", task });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get Tasks
app.get("/task/:userId", async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.params.userId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete Task
app.delete("/task/:id", async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});