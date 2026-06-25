import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';

export const createAdmin = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.validatedData;

    const existingAdmin = await prisma.admins.findFirst({
      where: {
        email,
        tenant_id: req.user.tenantId
      }
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: 'Admin with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.admins.create({
      data: {
        tenant_id: req.user.tenantId,
        name,
        email,
        password_hash: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenant_id: true,
        created_at: true
      }
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getAdmins = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const role = req.query.role?.toUpperCase();

    const allowedRoles = [
      'OWNER',
      'ADMIN',
      'STAFF'
    ];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role filter'
      });
    }

    const allowedSortFields = [
      'created_at',
      'role',
      'name',
      'email'
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

      ...(role && {
        role
      }),

      ...(search && {
        OR: [
          {
            name: {
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
        ]
      })
    };

    const [admins, total] = await Promise.all([

      prisma.admins.findMany({

        where,

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true
        },

        orderBy: {
          [sortBy]: sortOrder
        },

        skip,
        take: limit

      }),

      prisma.admins.count({
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
        role: role || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: admins

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const deleteAdmin = async (req, res) => {

  try {

    const { id } = req.params;

    const admin = await prisma.admins.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    if (admin.id === req.user.adminId) {
      return res.status(400).json({
        message: 'You cannot delete yourself'
      });
    }

    await prisma.admins.delete({
      where: {
        id
      }
    });

    res.json({
      message: 'Admin deleted successfully'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const updateAdminRole = async (req, res) => {

  try {

    const { id } = req.params;

    const { role } = req.validatedData;

    const existingAdmin = await prisma.admins.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!existingAdmin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    if (existingAdmin.id === req.user.adminId) {
      return res.status(400).json({
        message: 'You cannot change your own role'
      });
    }

    const updatedAdmin = await prisma.admins.update({
      where: {
        id
      },
      data: {
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      message: 'Role updated successfully',
      admin: updatedAdmin
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};