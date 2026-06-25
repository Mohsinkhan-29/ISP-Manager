import { prisma } from '../config/prisma.js';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber.js';

export const createInvoice = async (req, res) => {

  try {

    const {
      user_id,
      subscription_id,
      billing_month,
      due_date
    } = req.validatedData;

    const subscription = await prisma.subscriptions.findFirst({

      where: {
        id: subscription_id,
        user_id,
        tenant_id: req.user.tenantId
      },

      include: {
        plans: true
      }

    });

    if (!subscription) {
      return res.status(404).json({
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        message: 'Invoice can only be created for active subscriptions'
      });
    }

    const existingInvoice = await prisma.invoices.findFirst({
      where: {
        tenant_id: req.user.tenantId,
        subscription_id,
        billing_month: new Date(billing_month)
      }
    });

    if (existingInvoice) {
      return res.status(409).json({
        message: 'Invoice already exists for this billing month'
      });
    }

    const finalPrice =
      subscription.custom_price ??
      subscription.plans.price;

    const discount =
      Number(subscription.discount_amount ?? 0);

    const amountDue =
      Number(finalPrice) - discount;

    const invoice = await prisma.invoices.create({

      data: {

        tenant_id: req.user.tenantId,

        user_id,

        subscription_id,

        invoice_number:
          generateInvoiceNumber(),

        billing_month:
          new Date(billing_month),

        amount_due:
          amountDue,

        amount_paid:
          0,

        remaining_balance:
          amountDue,

        discount_applied:
          discount,

        due_date:
          due_date
            ? new Date(due_date)
            : null,

        status:
          'unpaid'

      }

    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getInvoices = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const { status, user_id } = req.query;

    const allowedStatuses = [
      'unpaid',
      'partial',
      'paid',
      'cancelled'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status filter'
      });
    }

    const allowedSortFields = [
      'created_at',
      'billing_month',
      'due_date',
      'amount_due',
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
      tenant_id: req.user.tenantId
    };

    // default behavior: exclude cancelled unless explicitly requested
    if (status) {
      where.status = status;
    } else {
      where.status = {
        not: 'cancelled'
      };
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (search) {
      where.OR = [
        {
          invoice_number: {
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

    const [invoices, total] = await Promise.all([

      prisma.invoices.findMany({

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

          subscriptions: {
            select: {
              id: true,
              status: true
            }
          }

        }

      }),

      prisma.invoices.count({
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
        status: status || 'not_cancelled',
        user_id: user_id || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: invoices

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getInvoiceById = async (req, res) => {

  try {

    const { id } = req.params;

    const invoice = await prisma.invoices.findFirst({

      where: {
        id,
        tenant_id: req.user.tenantId
      },

      include: {

        users: true,

        subscriptions: {
          include: {
            plans: true
          }
        },

        payments: true

      }

    });

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    res.json(invoice);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const cancelInvoice = async (req, res) => {

  try {

    const { id } = req.params;

    const invoice = await prisma.invoices.findFirst({
      where: {
        id,
        tenant_id: req.user.tenantId
      }
    });

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: 'Paid invoice cannot be cancelled'
      });
    }

    const updated = await prisma.invoices.update({

      where: {
        id
      },

      data: {
        status: 'cancelled'
      }

    });

    res.json({
      message: 'Invoice cancelled successfully',
      invoice: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};