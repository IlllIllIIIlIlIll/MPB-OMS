import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';

const router = Router();

// Get all alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, severity, isActive, limit = '50' } = req.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: 'An error occurred while fetching alert data'
    });
  }
});

// Get alert by ID
router.get('/:id', [
  param('id').notEmpty().withMessage('Alert ID is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id }
    });

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found',
        message: 'The specified alert does not exist'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      error: 'Failed to fetch alert',
      message: 'An error occurred while fetching alert data'
    });
  }
});

// Resolve alert
router.put('/:id/resolve', [
  param('id').notEmpty().withMessage('Alert ID is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        isActive: false,
        resolvedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      error: 'Failed to resolve alert',
      message: 'An error occurred while resolving the alert'
    });
  }
});

// Get alert statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    const where: any = {};
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start as string);
      if (end) where.createdAt.lte = new Date(end as string);
    }

    // Get total alerts
    const totalAlerts = await prisma.alert.count({ where });
    const activeAlerts = await prisma.alert.count({ where: { ...where, isActive: true } });
    const resolvedAlerts = await prisma.alert.count({ where: { ...where, isActive: false } });

    // Get alerts by type
    const alertsByType = await prisma.alert.groupBy({
      by: ['type'],
      where,
      _count: {
        type: true
      }
    });

    // Get alerts by severity
    const alertsBySeverity = await prisma.alert.groupBy({
      by: ['severity'],
      where,
      _count: {
        severity: true
      }
    });

    // Get recent alerts (last 24 hours)
    const recentAlerts = await prisma.alert.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalAlerts,
          activeAlerts,
          resolvedAlerts,
          recentAlerts
        },
        byType: alertsByType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        bySeverity: alertsBySeverity.map(item => ({
          severity: item.severity,
          count: item._count.severity
        }))
      }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch alert statistics',
      message: 'An error occurred while fetching alert statistics'
    });
  }
});

export default router; 