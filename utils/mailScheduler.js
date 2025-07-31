const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');

// ✅ Verify transporter connection
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ✅ Check SMTP readiness
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP verification failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails.");
  }
});

function scheduleCampaign(campaign) {
  const jobTime = new Date(campaign.scheduledTime);
  
  // ✅ Log original and UTC time
  console.log(`📅 Scheduling campaign "${campaign.title}" at ${jobTime.toISOString()}`);
  
  const cronTime = `${jobTime.getUTCMinutes()} ${jobTime.getUTCHours()} ${jobTime.getUTCDate()} ${jobTime.getUTCMonth() + 1} *`;
  console.log(`🕒 Cron format: ${cronTime}`);

  try {
    cron.schedule(cronTime, async () => {
      console.log(`🛠 Cron job triggered for campaign "${campaign.title}" at ${new Date().toISOString()}`);

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
      timezone: 'UTC'  // or 'Asia/Kolkata' if you want local time
    });
  } catch (err) {
    console.error("🚨 Error while scheduling cron job:", err.message);
  }
}

module.exports = { scheduleCampaign };
