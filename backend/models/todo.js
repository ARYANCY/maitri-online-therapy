const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [
    {
      _id: { type: String, default: () => uuidv4() },
      title: { type: String, required: true },
      completed: { type: Boolean, default: false },
      priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
      category: {
        type: String,
        enum: ["self-care", "mindfulness", "social", "physical", "professional"],
        default: "self-care"
      },
      dueDate: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      chatMessage: { type: String },
      chatTimestamp: { type: Date },
    },
  ],
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Todo", TodoSchema);
