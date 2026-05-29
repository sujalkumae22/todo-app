const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: String,
    completed: {
        type: Boolean,
        default: false
    },
    userId: String
});

module.exports = mongoose.model("Task", taskSchema);