import { prisma } from '../config/prisma.js';

export const getNotifications = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const { status, user_id, type } = req.query;

    const allowedStatuses = [
      'pending',
      'sent',
      'failed'
    ];

    const allowedTypes = [
      'invoice',
      'payment',
      'alert',
      'system'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status filter'
      });
    }

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid notification type filter'
      });
    }

    if (user_id && !/^[0-9a-fA-F-]{36}$/.test(user_id)) {
      return res.status(400).json({
        message: 'Invalid user_id format'
      });
    }

    const allowedSortFields = [
      'created_at',
      'status',
      'type'
    ];

    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : 'created_at';

    const sortOrder =
      req.query.sortOrder === 'asc'
        ? 'asc'
        : 'desc';

    const where = {
      tenant_id: req.user.tenantId,

      ...(status && { status }),
      ...(type && { type }),
      ...(user_id && { user_id })
    };

    if (search) {
      where.OR = [

        {
          type: {
            contains: search,
            mode: 'insensitive'
          }
        },

        {
          message: {
            contains: search,
            mode: 'insensitive'
          }
        }

      ];
    }

    const [notifications, total] = await Promise.all([

      prisma.notifications.findMany({

        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder
        },

        include: {

          users: {
            select: {
              id: true,
              full_name: true,
              phone: true
            }
          }

        }

      }),

      prisma.notifications.count({
        where
      })

    ]);

    res.json({

      page,
      limit,

      total,
      totalPages: Math.ceil(total / limit),

      filters: {
        search: search || null,
        status: status || null,
        type: type || null,
        user_id: user_id || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: notifications

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getNotificationById = async (req, res) => {

  try {

    const { id } = req.params;

    const notification =
      await prisma.notifications.findFirst({

        where: {
          id,
          tenant_id: req.user.tenantId
        }

      });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    res.json(notification);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const updateNotificationStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.validatedData;

    const notification =
      await prisma.notifications.findFirst({
        where: {
          id,
          tenant_id: req.user.tenantId
        }
      });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    const updated =
      await prisma.notifications.update({
        where: { id },
        data: {
          status,
          sent_at:
            status === 'sent'
              ? new Date()
              : null
        }
      });

    res.json({
      message: 'Notification updated successfully',
      notification: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};