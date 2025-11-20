// Test file to demonstrate the enhanced email functionality

import { sendMail, sendBulkMail, verifyEmailConfig } from "./utils/sendMail.js";

async function testEmail() {
  try {
    console.log('Testing enhanced email functionality...');
    
    // Verify email configuration
    console.log('Verifying email configuration...');
    const verifyResult = await verifyEmailConfig();
    console.log('Email configuration verification:', verifyResult);
    
    // Test sending activation email
    console.log('Testing activation email...');
    const activationResult = await sendMail('test@example.com', 'activation-token-123', 'activation');
    console.log('Activation email result:', activationResult);
    
    // Test sending welcome email
    console.log('Testing welcome email...');
    const welcomeResult = await sendMail('test@example.com', 'John Doe', 'welcome');
    console.log('Welcome email result:', welcomeResult);
    
    // Test sending notification email
    console.log('Testing notification email...');
    const notificationResult = await sendMail('test@example.com', {
      subject: 'Test Notification',
      message: 'This is a test notification message.'
    }, 'notification');
    console.log('Notification email result:', notificationResult);
    
    // Test sending bulk emails
    console.log('Testing bulk emails...');
    const recipients = [
      { email: 'user1@example.com', name: 'User One' },
      { email: 'user2@example.com', name: 'User Two' },
      { email: 'user3@example.com', name: 'User Three' }
    ];
    
    const bulkResult = await sendBulkMail(recipients, 'Bulk Test Subject', 'This is a bulk test message.');
    console.log('Bulk email result:', bulkResult);
    
    console.log('All email tests completed successfully!');
  } catch (error) {
    console.error('Error during email tests:', error.message);
  }
}

// Run the tests
testEmail();