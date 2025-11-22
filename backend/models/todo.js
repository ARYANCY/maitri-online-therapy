const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false },
      priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
      category: {
        type: String,
        enum: ["self-care", "mindfulness", "social", "physical", "professional"],
        default: "self-care"
      },
      dueDate: { type: Date },
    },
  ],
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Todo", TodoSchema);
