const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    
    // Action details
    action: { type: String, required: true }, // "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"
    entity: { type: String, required: true }, // "USER", "ROOM", "BOOKING", "TICKET", "MAINTENANCE", "MESSAGE"
    entityId: { type: String }, // ID of affected entity
    
    // User context
    userId: { type: Number }, // Who performed the action
    userEmail: { type: String }, // Email for reference
    userRole: { type: Number }, // Role at time of action
    ipAddress: { type: String }, // Client IP
    userAgent: { type: String }, // Browser/client info
    
    // Change details
    details: { type: String, required: true }, // Human-readable description
    oldValues: { type: mongoose.Schema.Types.Mixed }, // Before state (for updates/deletes)
    newValues: { type: mongoose.Schema.Types.Mixed }, // After state (for creates/updates)
    
    // Metadata
    success: { type: Boolean, default: true }, // Was action successful
    errorMessage: { type: String }, // If failed, why
    severity: { 
      type: String, 
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
      default: 'MEDIUM' 
    }
  },
  { collection: "auditLogs", versionKey: false }
);

// Indexes for performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });

module.exports = mongoose.model("auditLogs", auditLogSchema);