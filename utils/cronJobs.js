const cron = require('node-cron');
const Application = require('../models/Application');
const User = require('../models/User');
const emailService = require('./emailService');

const checkDeadlines = async () => {
  try {
    console.log('Checking for upcoming deadlines...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);
    const upcomingDeadlines = await Application.find({
      deadline: { $gte: today, $lte: threeDaysFromNow },
      status: { $in: ['Applied', 'Interview'] }
    }).populate('user');
    console.log(`Found ${upcomingDeadlines.length} upcoming deadlines`);
    
    if (upcomingDeadlines.length > 0) {
      console.log('Deadline details:', upcomingDeadlines.map(app => ({
        company: app.companyName,
        deadline: app.deadline,
        status: app.status
      })));
    }
    
    for (const application of upcomingDeadlines) {
      try {
        await emailService.sendDeadlineReminder(application.user.email, application.user.name, application);
        console.log(`Reminder sent for ${application.companyName}`);
      } catch (error) {
        console.error(`Failed to send reminder:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in checkDeadlines:', error);
  }
};

const checkInterviewReminders = async () => {
  try {
    console.log('Checking for upcoming interviews...');
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000);
    const upcomingInterviews = await Application.find({
      interviewDateTime: { $gte: tenMinutesFromNow, $lt: elevenMinutesFromNow },
      status: { $in: ['Applied', 'Interview'] }
    }).populate('user');
    console.log(`Found ${upcomingInterviews.length} upcoming interviews`);
    
    if (upcomingInterviews.length > 0) {
      console.log('Interview details:', upcomingInterviews.map(app => ({
        company: app.companyName,
        time: app.interviewDateTime,
        status: app.status
      })));
    }
    
    for (const application of upcomingInterviews) {
      try {
        await emailService.sendInterviewReminder(application.user.email, application.user.name, application);
        console.log(`Interview reminder sent for ${application.companyName}`);
      } catch (error) {
        console.error(`Failed to send interview reminder:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in checkInterviewReminders:', error);
  }
};

const startCronJobs = () => {
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily deadline check...');
    checkDeadlines();
  });
  cron.schedule('* * * * *', () => {
    checkInterviewReminders();
  });
  console.log('✅ Cron jobs started');
  console.log('  - Deadline reminders: Daily at 9:00 AM');
  console.log('  - Interview reminders: Every minute');
};

module.exports = { startCronJobs, checkDeadlines, checkInterviewReminders };