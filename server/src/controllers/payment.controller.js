import { prisma } from '../config/prisma.js';

export const createPayment = async (req, res) => {

  try {

    const {
      invoice_id,
      amount_paid,
      payment_method
    } = req.validatedData;

    const invoice = await prisma.invoices.findFirst({
      where: {
        id: invoice_id,
        tenant_id: req.user.tenantId
      }
    });

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot pay cancelled invoice'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: 'Invoice already fully paid'
      });
    }

    const remainingBalance =
      Number(invoice.remaining_balance);

    if (Number(amount_paid) > remainingBalance) {
      return res.status(400).json({
        message: 'Payment exceeds remaining balance'
      });
    }

    const result = await prisma.$transaction(async (tx) => {

      const payment = await tx.payments.create({

        data: {

          tenant_id: req.user.tenantId,

          invoice_id,

          amount_paid,

          payment_method

        }

      });

      const newAmountPaid =
        Number(invoice.amount_paid) +
        Number(amount_paid);

      const newRemainingBalance =
        remainingBalance -
        Number(amount_paid);

      let newStatus = 'partial';

      if (newRemainingBalance === 0) {
        newStatus = 'paid';
      }

      if (newAmountPaid === 0) {
        newStatus = 'unpaid';
      }

      const updatedInvoice =
        await tx.invoices.update({

          where: {
            id: invoice_id
          },

          data: {

            amount_paid:
              newAmountPaid,

            remaining_balance:
              newRemainingBalance,

            status:
              newStatus

          }

        });

      await tx.ledger.create({

        data: {

          tenant_id:
            req.user.tenantId,

          user_id:
            invoice.user_id,

          type:
            'payment',

          reference_id:
            payment.id,

          amount:
            amount_paid

        }

      });

      return {
        payment,
        updatedInvoice
      };

    });

    res.status(201).json({

      message:
        'Payment recorded successfully',

      payment:
        result.payment,

      invoice:
        result.updatedInvoice

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getPayments = async (req, res) => {

  try {

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const { invoice_id } = req.query;

    const allowedSortFields = [
      'paid_at',
      'amount_paid'
    ];

    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : 'paid_at';

    const sortOrder =
      req.query.sortOrder === 'asc'
        ? 'asc'
        : 'desc';

    if (invoice_id && !/^[0-9a-fA-F-]{36}$/.test(invoice_id)) {
      return res.status(400).json({
        message: 'Invalid invoice_id format'
      });
    }

    const where = {
      tenant_id: req.user.tenantId,

      ...(invoice_id && {
        invoice_id
      })
    };

    if (search) {
      where.OR = [
        {
          payment_method: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          invoices: {
            invoice_number: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const [payments, total] = await Promise.all([

      prisma.payments.findMany({

        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder
        },

        include: {

          invoices: {
            select: {
              id: true,
              invoice_number: true,
              status: true,
              amount_due: true,
              remaining_balance: true
            }
          }

        }

      }),

      prisma.payments.count({
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
        invoice_id: invoice_id || null
      },

      sorting: {
        sortBy,
        sortOrder
      },

      data: payments

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getPaymentById = async (req, res) => {

  try {

    const { id } = req.params;

    const payment =
      await prisma.payments.findFirst({

        where: {
          id,
          tenant_id: req.user.tenantId
        },

        include: {
          invoices: true
        }

      });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.json(payment);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};