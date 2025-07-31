const Campaign = require('../models/Campaign');
const { scheduleCampaign } = require('../utils/mailScheduler');

exports.createCampaign = async (req, res) => {
  const { title, message, recipients, scheduledTime } = req.body;
  const emails = recipients.split(',').map(e => e.trim());

  const campaign = new Campaign({ title, message, recipients: emails, scheduledTime });
  await campaign.save();
  scheduleCampaign(campaign);

  res.redirect('/');
};

exports.getAllCampaigns = async (req, res) => {
  const campaigns = await Campaign.find().sort({ scheduledTime: -1 });
  res.render('home', { campaigns });
};
