import { prisma } from '../config/prisma.js';

export const createUser = async (req, res) => {

  try {

    const {
      full_name,
      phone,
      email,
      address,
      city,
      latitude,
      longitude
    } = req.validatedData;

    const existing = await prisma.users.findFirst({
      where: {
        tenant_id: req.user.tenantId,
        phone
      }
    });

    if (existing) {
      return res.status(409).json({
        message: 'Customer already exists with this phone'
      });
    }

    const user = await prisma.users.create({
      data: {
        tenant_id: req.user.tenantId,
        full_name,
        phone,
        email,
        address,
        city,
        latitude,
        longitude
      }
    });

    res.status(201).json({
      message: 'Customer created successfully',
      user
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const getUsers = async (req, res) => {

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
      'full_name',
      'phone',
      'city',
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

      where.OR = [

        {
          full_name: {
            contains: search,
            mode: 'insensitive'
          }
        },

        {
          phone: {
            contains: search,
            mode: 'insensitive'
          }
        },

        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }

      ];

    }

    const [users, total] = await Promise.all([

      prisma.users.findMany({

        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder
        }

      }),

      prisma.users.count({
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

      data: users

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getUserById = async (req, res) => {

  try {

    const { id } = req.params;

    const user = await prisma.users.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    res.json(user);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const updateUser = async (req, res) => {

  try {

    const { id } = req.params;

    const existing = await prisma.users.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const updated = await prisma.users.update({
      where: { id },
      data: req.validatedData
    });

    res.json({
      message: 'Customer updated successfully',
      user: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const deactivateUser = async (req, res) => {

  try {

    const { id } = req.params;

    const existing = await prisma.users.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const updated = await prisma.users.update({
      where: { id },
      data: {
        is_active: false
      }
    });

    res.json({
      message: 'Customer deactivated successfully',
      user: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};

export const activateUser = async (req, res) => {

  try {

    const { id } = req.params;

    const existing = await prisma.users.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const updated = await prisma.users.update({
      where: { id },
      data: {
        is_active: true
      }
    });

    res.json({
      message: 'Customer reactivated successfully',
      user: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }
};