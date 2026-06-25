import { prisma } from '../config/prisma.js';

export const getLedgerEntries = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const { user_id, type } = req.query;

    const allowedSortFields = [
      'created_at',
      'amount'
    ];

    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : 'created_at';

    const sortOrder =
      req.query.sortOrder === 'asc'
        ? 'asc'
        : 'desc';

    const allowedTypes = [
      'credit',
      'debit',
      'adjustment',
      'invoice',
      'payment'
    ];

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid ledger type filter'
      });
    }

    if (user_id && !/^[0-9a-fA-F-]{36}$/.test(user_id)) {
      return res.status(400).json({
        message: 'Invalid user_id format'
      });
    }

    const where = {
      tenant_id: req.user.tenantId,

      ...(user_id && { user_id }),

      ...(type && { type })
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
          reference_id: {
            contains: search,
            mode: 'insensitive'
          }
        },

        {
          users: {
            full_name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },

        {
          users: {
            phone: {
              contains: search
            }
          }
        }

      ];
    }

    const [entries, total] = await Promise.all([

      prisma.ledger.findMany({

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

      prisma.ledger.count({
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
        user_id: user_id || null,
        type: type || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: entries

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getLedgerEntryById = async (req, res) => {

  try {

    const { id } = req.params;

    const entry =
      await prisma.ledger.findFirst({

        where: {
          id,
          tenant_id: req.user.tenantId
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

      });

    if (!entry) {
      return res.status(404).json({
        message: 'Ledger entry not found'
      });
    }

    res.json(entry);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getCustomerLedger = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const { userId } = req.params;

    const type = req.query.type;

    const allowedTypes = [
      'credit',
      'debit',
      'adjustment',
      'invoice',
      'payment'
    ];

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid ledger type filter'
      });
    }

    if (!/^[0-9a-fA-F-]{36}$/.test(userId)) {
      return res.status(400).json({
        message: 'Invalid userId format'
      });
    }

    const user = await prisma.users.findFirst({
      where: {
        id: userId,
        tenant_id: req.user.tenantId
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        is_active: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const allowedSortFields = [
      'created_at',
      'amount'
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
      user_id: userId,

      ...(type && { type })
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
          reference_id: {
            contains: search,
            mode: 'insensitive'
          }
        }

      ];
    }

    const [ledger, total] = await Promise.all([

      prisma.ledger.findMany({

        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder
        }

      }),

      prisma.ledger.count({
        where
      })

    ]);

    res.json({

      page,
      limit,

      total,
      totalPages: Math.ceil(total / limit),

      user,

      filters: {
        search: search || null,
        type: type || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: ledger

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};