const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // Assuming TicketCategory is an enum represented as string
    priority: { type: String, required: true }, // Assuming TicketPriority is an enum represented as string
    status: { type: String, required: true }, // Assuming TicketStatus is an enum represented as string
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users', 
      required: true 
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    attachments: [
      {
        name: { type: String, required: true },
        size: { type: Number, required: true },
        type: { type: String, required: true }
      }
    ]
  },
  { collection: "tickets", versionKey: false }
);

module.exports = mongoose.model("tickets", ticketSchema);