import cron from 'node-cron';

import { generateMonthlyInvoices } from '../services/invoice.service.js';

export const startInvoiceCron = () => {

  cron.schedule('0 0 * * *', async () => {

    console.log('Running monthly invoice cron...');

    try {

      await generateMonthlyInvoices();

      console.log('Monthly invoices generated successfully');

    } catch (err) {

      console.error('Invoice cron failed:', err);

    }

  });

};