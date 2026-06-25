import { prisma } from '../config/prisma.js';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber.js';

export const generateMonthlyInvoices = async () => {

  const currentDate = new Date();

  const billingMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const activeSubscriptions = await prisma.subscriptions.findMany({
    where: {
      status: 'active'
    },
    include: {
      plans: true
    }
  });

  for (const subscription of activeSubscriptions) {

    const today = currentDate.getDate();

    const subscriptionBillingDay =
      new Date(subscription.start_date).getDate();

    if (today !== subscriptionBillingDay) {
      continue;
    }

    const existingInvoice = await prisma.invoices.findFirst({
      where: {
        tenant_id: subscription.tenant_id,
        subscription_id: subscription.id,
        billing_month: billingMonth
      }
    });

    if (existingInvoice) {
      continue;
    }

    const finalPrice =
      subscription.custom_price ??
      subscription.plans.price;

    const discount =
      Number(subscription.discount_amount ?? 0);

    const amountDue =
      Number(finalPrice) - discount;

    await prisma.invoices.create({
      data: {
        tenant_id: subscription.tenant_id,
        user_id: subscription.user_id,
        subscription_id: subscription.id,

        invoice_number: generateInvoiceNumber(),

        billing_month: billingMonth,

        amount_due: amountDue,
        amount_paid: 0,
        remaining_balance: amountDue,

        discount_applied: discount,

        due_date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          10
        ),

        status: 'unpaid'
      }
    });

    console.log(
      `Invoice generated for subscription ${subscription.id}`
    );
  }
};