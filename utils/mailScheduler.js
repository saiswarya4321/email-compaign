const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function scheduleCampaign(campaign) {
  const delay = new Date(campaign.scheduledTime) - new Date();

  setTimeout(async () => {
    const logs = [];
    for (const email of campaign.recipients) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: campaign.title,
          html: campaign.message
        });
        logs.push({ recipient: email, status: 'success' });
      } catch (error) {
        logs.push({ recipient: email, status: 'failed', error: error.message });
      }
    }
    campaign.logs = logs;
    campaign.status = logs.some(l => l.status === 'failed') ? 'failed' : 'sent';
    await campaign.save();
  }, delay);
}

module.exports = { scheduleCampaign };
