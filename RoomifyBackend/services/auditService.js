const auditLogSchema = require('../models/auditLogSchema');

class AuditService {
    // Log an action to the audit trail
    static async logAction({
        action,
        entity,
        entityId = null,
        userId = null,
        userEmail = null,
        userRole = null,
        ipAddress = null,
        userAgent = null,
        details,
        oldValues = null,
        newValues = null,
        success = true,
        errorMessage = null,
        severity = 'MEDIUM'
    }) {
        try {
            // Generate new audit log ID
            const lastAuditLog = await auditLogSchema.findOne().sort({ id: -1 });
            const newId = lastAuditLog ? lastAuditLog.id + 1 : 1;

            // Create audit log entry
            const auditLogEntry = new auditLogSchema({
                id: newId,
                timestamp: new Date(),
                action,
                entity,
                entityId: entityId ? String(entityId) : null,
                userId,
                userEmail,
                userRole,
                ipAddress,
                userAgent,
                details,
                oldValues,
                newValues,
                success,
                errorMessage,
                severity
            });

            // Save asynchronously to avoid blocking main operations
            await auditLogEntry.save();
            
            // Log critical actions to console for immediate visibility
            if (severity === 'CRITICAL' || severity === 'HIGH') {
                console.log(`[AUDIT ${severity}] ${action} ${entity} by user ${userId} (${userEmail}): ${details}`);
            }
        } catch (error) {
            // Don't let audit logging failures break the main operation
            console.error('Failed to log audit action:', error);
        }
    }

    // Get audit logs with filtering and pagination
    static async getAuditLogs(filters = {}, options = {}) {
        try {
            const {
                userId,
                action,
                entity,
                severity,
                startDate,
                endDate,
                success,
                entityId
            } = filters;

            const {
                page = 1,
                limit = 50,
                sortBy = 'timestamp',
                sortOrder = 'desc'
            } = options;

            // Build query
            const query = {};

            if (userId) query.userId = userId;
            if (action) query.action = action;
            if (entity) query.entity = entity;
            if (severity) query.severity = severity;
            if (success !== undefined) query.success = success;
            if (entityId) query.entityId = String(entityId);

            // Date range filter
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            // Calculate pagination
            const skip = (page - 1) * limit;
            const sortDirection = sortOrder === 'desc' ? -1 : 1;
            const sort = { [sortBy]: sortDirection };

            // Execute query
            const [logs, total] = await Promise.all([
                auditLogSchema.find(query, { _id: 0 })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                auditLogSchema.countDocuments(query)
            ]);

            return {
                logs,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalLogs: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Failed to retrieve audit logs:', error);
            throw error;
        }
    }

    // Get audit statistics
    static async getAuditStats(filters = {}) {
        try {
            const {
                startDate,
                endDate,
                userId
            } = filters;

            // Build base match query
            const matchQuery = {};
            if (userId) matchQuery.userId = userId;
            
            if (startDate || endDate) {
                matchQuery.timestamp = {};
                if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
                if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
            }

            const pipeline = [
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalLogs: { $sum: 1 },
                        successfulActions: { $sum: { $cond: [{ $eq: ["$success", true] }, 1, 0] } },
                        failedActions: { $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] } },
                        criticalActions: { $sum: { $cond: [{ $eq: ["$severity", "CRITICAL"] }, 1, 0] } },
                        highSeverityActions: { $sum: { $cond: [{ $eq: ["$severity", "HIGH"] }, 1, 0] } },
                        actionsByEntity: { 
                            $push: {
                                entity: "$entity",
                                action: "$action"
                            }
                        }
                    }
                }
            ];

            const [stats] = await auditLogSchema.aggregate(pipeline);

            if (!stats) {
                return {
                    totalLogs: 0,
                    successfulActions: 0,
                    failedActions: 0,
                    criticalActions: 0,
                    highSeverityActions: 0,
                    topActions: [],
                    topEntities: []
                };
            }

            // Calculate top actions and entities
            const actionCounts = {};
            const entityCounts = {};

            stats.actionsByEntity.forEach(({ entity, action }) => {
                actionCounts[action] = (actionCounts[action] || 0) + 1;
                entityCounts[entity] = (entityCounts[entity] || 0) + 1;
            });

            const topActions = Object.entries(actionCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([action, count]) => ({ action, count }));

            const topEntities = Object.entries(entityCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([entity, count]) => ({ entity, count }));

            return {
                totalLogs: stats.totalLogs,
                successfulActions: stats.successfulActions,
                failedActions: stats.failedActions,
                criticalActions: stats.criticalActions,
                highSeverityActions: stats.highSeverityActions,
                successRate: stats.totalLogs > 0 ? (stats.successfulActions / stats.totalLogs * 100).toFixed(2) : 0,
                topActions,
                topEntities
            };
        } catch (error) {
            console.error('Failed to get audit statistics:', error);
            throw error;
        }
    }

    // Helper method to extract user context from request
    static extractUserContext(req, user = null) {
        return {
            userId: user?.id || null,
            userEmail: user?.email || null,
            userRole: user?.role || null,
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown'
        };
    }

    // Predefined audit log templates for common actions
    static async logUserAction(action, user, req, entityId = null, oldValues = null, newValues = null) {
        const userContext = this.extractUserContext(req, user);
        let details, severity;

        switch (action) {
            case 'CREATE':
                details = `User registered: ${user.email}`;
                severity = 'MEDIUM';
                break;
            case 'UPDATE':
                details = `User profile updated: ${user.email}`;
                severity = 'LOW';
                break;
            case 'DELETE':
                details = `User deleted: ${user.email}`;
                severity = 'HIGH';
                break;
            case 'LOGIN':
                details = `User logged in: ${user.email}`;
                severity = 'LOW';
                break;
            case 'LOGOUT':
                details = `User logged out: ${user.email}`;
                severity = 'LOW';
                break;
            default:
                details = `User action ${action}: ${user.email}`;
                severity = 'MEDIUM';
        }

        await this.logAction({
            action,
            entity: 'USER',
            entityId: entityId || user.id,
            details,
            oldValues,
            newValues,
            severity,
            ...userContext
        });
    }

    static async logBookingAction(action, booking, user, req, oldValues = null) {
        const userContext = this.extractUserContext(req, user);
        let details, severity;

        switch (action) {
            case 'CREATE':
                details = `Booking created: Room ${booking.roomName} from ${booking.startTime}-${booking.endTime} on ${booking.bookingDate.toDateString()}`;
                severity = 'MEDIUM';
                break;
            case 'UPDATE':
                details = `Booking updated: ID ${booking.id}`;
                severity = 'LOW';
                break;
            case 'DELETE':
                details = `Booking cancelled: ID ${booking.id}`;
                severity = 'MEDIUM';
                break;
            default:
                details = `Booking action ${action}: ID ${booking.id}`;
                severity = 'MEDIUM';
        }

        await this.logAction({
            action,
            entity: 'BOOKING',
            entityId: booking.id,
            details,
            oldValues,
            newValues: action !== 'DELETE' ? {
                roomId: booking.roomId,
                roomName: booking.roomName,
                bookingDate: booking.bookingDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                purpose: booking.purpose
            } : null,
            severity,
            ...userContext
        });
    }

    static async logRoomAction(action, room, user, req, oldValues = null) {
        const userContext = this.extractUserContext(req, user);
        let details, severity;

        switch (action) {
            case 'CREATE':
                details = `Room created: ${room.name} in ${room.building}`;
                severity = 'MEDIUM';
                break;
            case 'UPDATE':
                details = `Room updated: ${room.name}`;
                severity = 'LOW';
                break;
            case 'DELETE':
                details = `Room deleted: ${room.name}`;
                severity = 'HIGH';
                break;
            default:
                details = `Room action ${action}: ${room.name}`;
                severity = 'MEDIUM';
        }

        await this.logAction({
            action,
            entity: 'ROOM',
            entityId: room.id,
            details,
            oldValues,
            newValues: action !== 'DELETE' ? {
                name: room.name,
                building: room.building,
                floor: room.floor,
                capacity: room.capacity,
                type: room.type
            } : null,
            severity,
            ...userContext
        });
    }

    static async logMaintenanceAction(action, maintenance, user, req, oldValues = null) {
        const userContext = this.extractUserContext(req, user);
        let details, severity;

        switch (action) {
            case 'CREATE':
                details = `Maintenance period created: ${maintenance.title}`;
                severity = 'HIGH';
                break;
            case 'UPDATE':
                details = `Maintenance period updated: ${maintenance.title}`;
                severity = 'MEDIUM';
                break;
            case 'DELETE':
                details = `Maintenance period deleted: ${maintenance.title}`;
                severity = 'HIGH';
                break;
            default:
                details = `Maintenance action ${action}: ${maintenance.title}`;
                severity = 'MEDIUM';
        }

        await this.logAction({
            action,
            entity: 'MAINTENANCE',
            entityId: maintenance.id,
            details,
            oldValues,
            newValues: action !== 'DELETE' ? {
                title: maintenance.title,
                startDate: maintenance.startDate,
                endDate: maintenance.endDate,
                isActive: maintenance.isActive
            } : null,
            severity,
            ...userContext
        });
    }

    static async logTicketAction(action, ticket, user, req, oldValues = null) {
        const userContext = this.extractUserContext(req, user);
        let details, severity;

        switch (action) {
            case 'CREATE':
                details = `Ticket created: ${ticket.title || ticket.subject}`;
                severity = 'LOW';
                break;
            case 'UPDATE':
                details = `Ticket updated: ID ${ticket.id}`;
                severity = 'LOW';
                break;
            case 'DELETE':
                details = `Ticket deleted: ID ${ticket.id}`;
                severity = 'MEDIUM';
                break;
            default:
                details = `Ticket action ${action}: ID ${ticket.id}`;
                severity = 'LOW';
        }

        await this.logAction({
            action,
            entity: 'TICKET',
            entityId: ticket.id,
            details,
            oldValues,
            newValues: action !== 'DELETE' ? {
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category
            } : null,
            severity,
            ...userContext
        });
    }
}

module.exports = AuditService;