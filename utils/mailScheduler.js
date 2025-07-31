const cron = require('node-cron');
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
  const jobTime = new Date(campaign.scheduledTime);
  const cronTime = `${jobTime.getUTCMinutes()} ${jobTime.getUTCHours()} ${jobTime.getUTCDate()} ${jobTime.getUTCMonth() + 1} *`;

  console.log(`📅 Campaign "${campaign.title}" scheduled at ${jobTime.toISOString()}`);
  console.log(`🕒 Cron time: ${cronTime}`);

  cron.schedule(cronTime, async () => {
    console.log(`📨 Sending campaign "${campaign.title}"...`);

    const logs = [];
    for (const email of campaign.recipients) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: campaign.title,
          html: campaign.message
        });
        console.log(`✅ Sent to ${email}`);
        logs.push({ recipient: email, status: 'success' });
      } catch (error) {
        console.error(`❌ Failed to send to ${email}: ${error.message}`);
        logs.push({ recipient: email, status: 'failed', error: error.message });
      }
    }

    campaign.logs = logs;
    campaign.status = logs.some(l => l.status === 'failed') ? 'failed' : 'sent';
    await campaign.save();
    console.log(`📦 Campaign "${campaign.title}" status updated to: ${campaign.status}`);
  }, {
    scheduled: true,
    timezone: 'UTC'
  });
}

module.exports = { scheduleCampaign };
