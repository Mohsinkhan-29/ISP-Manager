import { prisma } from '../config/prisma.js';

export const createSubscription = async (req, res) => {

  try {

    const {
      user_id,
      plan_id,
      start_date,
      billing_cycle,
      custom_speed_mbps,
      custom_price,
      discount_amount
    } = req.validatedData;

    const user = await prisma.users.findFirst({
      where: {
        id: user_id,
        tenant_id: req.user.tenantId
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    if (!user.is_active) {
      return res.status(400).json({
        message: 'Cannot create subscription for inactive customer'
      });
    }

    const plan = await prisma.plans.findFirst({
      where: {
        id: plan_id,
        tenant_id: req.user.tenantId
      }
    });

    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      });
    }

    if (!plan.is_active) {
      return res.status(400).json({
        message: 'Cannot use inactive plan'
      });
    }

    const subscription = await prisma.subscriptions.create({
      data: {
        tenant_id: req.user.tenantId,
        user_id,
        plan_id,

        start_date: new Date(start_date),

        billing_cycle: billing_cycle || 'monthly',

        status: 'active',

        custom_speed_mbps:
          custom_speed_mbps ?? null,

        custom_price:
          custom_price ?? null,

        discount_amount:
          discount_amount ?? 0
      }
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getSubscriptions = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const status = req.query.status;

    const allowedStatuses = [
      'active',
      'suspended',
      'terminated'
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: 'Invalid status filter'
      });
    }

    const allowedSortFields = [
      'created_at',
      'start_date',
      'status'
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

      ...(status && {
        status
      }),

      ...(search && {
        users: {
          OR: [
            {
              full_name: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              phone: {
                contains: search
              }
            }
          ]
        }
      })
    };

    const [subscriptions, total] = await Promise.all([

      prisma.subscriptions.findMany({

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
          },

          plans: {
            select: {
              id: true,
              name: true,
              speed_mbps: true,
              price: true
            }
          }

        }

      }),

      prisma.subscriptions.count({
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
        status: status || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: subscriptions

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const updateSubscriptionStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.validatedData;

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!subscription) {
      return res.status(404).json({
        message: 'Subscription not found'
      });
    }

    const updated = await prisma.subscriptions.update({
      where: {
        id
      },
      data: {
        status
      }
    });

    res.json({
      message: 'Subscription status updated',
      subscription: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};