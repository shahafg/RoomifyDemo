const express = require("express");
const auditLogsRouter = express.Router();
const AuditService = require('../services/auditService');

// Middleware to check if user has admin role (role >= 4)
const requireAdminRole = (req, res, next) => {
    // For now, we'll assume user role is passed in headers or body
    // In a real implementation, this would come from authentication middleware
    const userRole = req.headers['user-role'] || req.body.userRole;
    
    if (!userRole || parseInt(userRole) < 4) {
        return res.status(403).send({ 
            message: "Access denied. Admin role required to view audit logs." 
        });
    }
    
    next();
};

// GET all audit logs with filtering and pagination
auditLogsRouter.get("/", requireAdminRole, async (req, res) => {
    try {
        const filters = {
            userId: req.query.userId ? parseInt(req.query.userId) : undefined,
            action: req.query.action,
            entity: req.query.entity,
            severity: req.query.severity,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            success: req.query.success !== undefined ? req.query.success === 'true' : undefined,
            entityId: req.query.entityId
        };

        const options = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50,
            sortBy: req.query.sortBy || 'timestamp',
            sortOrder: req.query.sortOrder || 'desc'
        };

        // Validate limit to prevent performance issues
        if (options.limit > 1000) {
            return res.status(400).send({ 
                message: "Limit cannot exceed 1000 records per request" 
            });
        }

        const result = await AuditService.getAuditLogs(filters, options);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).send({ 
            message: "Error fetching audit logs", 
            error: error.message 
        });
    }
});

// GET audit log statistics
auditLogsRouter.get("/stats", requireAdminRole, async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            userId: req.query.userId ? parseInt(req.query.userId) : undefined
        };

        const stats = await AuditService.getAuditStats(filters);
        res.status(200).send(stats);
    } catch (error) {
        console.error("Error fetching audit statistics:", error);
        res.status(500).send({ 
            message: "Error fetching audit statistics", 
            error: error.message 
        });
    }
});

// GET audit logs for specific entity
auditLogsRouter.get("/entity/:entityType/:entityId", requireAdminRole, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        
        const filters = {
            entity: entityType.toUpperCase(),
            entityId: entityId
        };

        const options = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        const result = await AuditService.getAuditLogs(filters, options);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error fetching audit logs for ${req.params.entityType} ${req.params.entityId}:`, error);
        res.status(500).send({ 
            message: "Error fetching entity audit logs", 
            error: error.message 
        });
    }
});

// GET audit logs for specific user
auditLogsRouter.get("/user/:userId", requireAdminRole, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).send({ message: "Invalid user ID format" });
        }

        const filters = {
            userId: userId
        };

        const options = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        const result = await AuditService.getAuditLogs(filters, options);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error fetching audit logs for user ${req.params.userId}:`, error);
        res.status(500).send({ 
            message: "Error fetching user audit logs", 
            error: error.message 
        });
    }
});

// GET recent critical/high severity audit logs
auditLogsRouter.get("/critical", requireAdminRole, async (req, res) => {
    try {
        const filters = {
            severity: req.query.severity || 'CRITICAL'
        };

        // Default to last 7 days if no date range specified
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        if (!req.query.startDate) {
            filters.startDate = startDate.toISOString();
        }
        if (!req.query.endDate) {
            filters.endDate = endDate.toISOString();
        }

        const options = {
            page: 1,
            limit: 100,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        const result = await AuditService.getAuditLogs(filters, options);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching critical audit logs:", error);
        res.status(500).send({ 
            message: "Error fetching critical audit logs", 
            error: error.message 
        });
    }
});

// GET audit log export (CSV format)
auditLogsRouter.get("/export", requireAdminRole, async (req, res) => {
    try {
        const filters = {
            userId: req.query.userId ? parseInt(req.query.userId) : undefined,
            action: req.query.action,
            entity: req.query.entity,
            severity: req.query.severity,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            success: req.query.success !== undefined ? req.query.success === 'true' : undefined,
            entityId: req.query.entityId
        };

        // Limit export to 10,000 records for performance
        const options = {
            page: 1,
            limit: 10000,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        const result = await AuditService.getAuditLogs(filters, options);
        
        // Convert to CSV format
        const csvHeader = 'Timestamp,Action,Entity,Entity ID,User ID,User Email,User Role,Details,Success,Severity\n';
        const csvData = result.logs.map(log => {
            const timestamp = log.timestamp.toISOString();
            const action = log.action || '';
            const entity = log.entity || '';
            const entityId = log.entityId || '';
            const userId = log.userId || '';
            const userEmail = log.userEmail || '';
            const userRole = log.userRole || '';
            const details = (log.details || '').replace(/"/g, '""'); // Escape quotes
            const success = log.success;
            const severity = log.severity || '';
            
            return `"${timestamp}","${action}","${entity}","${entityId}","${userId}","${userEmail}","${userRole}","${details}","${success}","${severity}"`;
        }).join('\n');

        const csv = csvHeader + csvData;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
        res.status(200).send(csv);
    } catch (error) {
        console.error("Error exporting audit logs:", error);
        res.status(500).send({ 
            message: "Error exporting audit logs", 
            error: error.message 
        });
    }
});

// Manual audit log creation (for testing purposes - admin only)
auditLogsRouter.post("/", requireAdminRole, async (req, res) => {
    try {
        const {
            action,
            entity,
            entityId,
            userId,
            userEmail,
            userRole,
            details,
            oldValues,
            newValues,
            success = true,
            severity = 'MEDIUM'
        } = req.body;

        if (!action || !entity || !details) {
            return res.status(400).send({ 
                message: "Action, entity, and details are required fields" 
            });
        }

        const userContext = AuditService.extractUserContext(req);

        await AuditService.logAction({
            action,
            entity: entity.toUpperCase(),
            entityId,
            userId,
            userEmail,
            userRole,
            details,
            oldValues,
            newValues,
            success,
            severity,
            ipAddress: userContext.ipAddress,
            userAgent: userContext.userAgent
        });

        res.status(201).send({ 
            message: "Audit log created successfully" 
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
        res.status(500).send({ 
            message: "Error creating audit log", 
            error: error.message 
        });
    }
});

module.exports = auditLogsRouter;