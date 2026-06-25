import { prisma } from '../config/prisma.js';

export const createPlan = async (req, res) => {
  try {

    const {
      name,
      speed_mbps,
      price
    } = req.validatedData;

    const existingPlan = await prisma.plans.findFirst({
      where: {
        tenant_id: req.user.tenantId,
        name
      }
    });

    if (existingPlan) {
      return res.status(409).json({
        message: 'Plan with this name already exists'
      });
    }

    const plan = await prisma.plans.create({
      data: {
        tenant_id: req.user.tenantId,
        name,
        speed_mbps,
        price
      }
    });

    res.status(201).json({
      message: 'Plan created successfully',
      plan
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const getPlans = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const status = req.query.status || 'active';

    const allowedStatuses = [
      'active',
      'inactive',
      'all'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status filter'
      });
    }

    const allowedSortFields = [
      'name',
      'price',
      'speed_mbps',
      'created_at'
    ];

    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : 'created_at';

    const sortOrder =
      req.query.sortOrder === 'asc'
        ? 'asc'
        : 'desc';

    const where = {
      tenant_id: req.user.tenantId
    };

    if (status === 'active') {
      where.is_active = true;
    }

    if (status === 'inactive') {
      where.is_active = false;
    }

    if (search) {

      where.name = {
        contains: search,
        mode: 'insensitive'
      };

    }

    const [plans, total] = await Promise.all([

      prisma.plans.findMany({

        where,

        skip,

        take: limit,

        orderBy: {
          [sortBy]: sortOrder
        },

        select: {
          id: true,
          name: true,
          speed_mbps: true,
          price: true,
          is_active: true,
          created_at: true
        }

      }),

      prisma.plans.count({
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
        status
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: plans

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const updatePlan = async (req, res) => {
  try {

    const { id } = req.params;

    const existingPlan = await prisma.plans.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existingPlan) {
      return res.status(404).json({
        message: 'Plan not found'
      });
    }

    if (req.validatedData.name) {

      const duplicatePlan = await prisma.plans.findFirst({
        where: {
          tenant_id: req.user.tenantId,
          name: req.validatedData.name,
          NOT: {
            id
          }
        }
      });

      if (duplicatePlan) {
        return res.status(409).json({
          message: 'Another plan with this name already exists'
        });
      }

    }

    const updatedPlan = await prisma.plans.update({
      where: {
        id
      },
      data: req.validatedData
    });

    res.json({
      message: 'Plan updated successfully',
      plan: updatedPlan
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const activatePlan = async (req, res) => {
  try {

    const { id } = req.params;

    const existingPlan = await prisma.plans.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existingPlan) {
      return res.status(404).json({
        message: 'Plan not found'
      });
    }

    const updatedPlan = await prisma.plans.update({
      where: {
        id
      },
      data: {
        is_active: true
      }
    });

    res.json({
      message: 'Plan activated successfully',
      plan: updatedPlan
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const deactivatePlan = async (req, res) => {
  try {

    const { id } = req.params;

    const existingPlan = await prisma.plans.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existingPlan) {
      return res.status(404).json({
        message: 'Plan not found'
      });
    }

    const updatedPlan = await prisma.plans.update({
      where: {
        id
      },
      data: {
        is_active: false
      }
    });

    res.json({
      message: 'Plan deactivated successfully',
      plan: updatedPlan
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};