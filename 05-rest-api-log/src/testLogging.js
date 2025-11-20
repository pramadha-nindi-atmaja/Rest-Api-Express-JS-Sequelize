// Test file to demonstrate the enhanced logging functionality

import sequelize from './utils/db.js';
import Log from './models/logModel.js';
import User from './models/userModel.js';

async function testLogging() {
  try {
    console.log('Testing enhanced logging functionality...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Test creating a user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('User created:', user.userId);
    
    // Test creating a log entry
    const log = await Log.createLog(
      user.userId,
      'TEST_ACTION',
      'This is a test log entry',
      '127.0.0.1',
      'Test Agent',
      200
    );
    console.log('Log entry created:', log.logId);
    
    // Test searching logs
    const searchResults = await Log.search('test', 1, 10);
    console.log('Search results:', searchResults.logs.length);
    
    // Test getting log statistics
    const stats = await Log.getStats();
    console.log('Log statistics:', stats);
    
    // Test pagination
    const paginatedLogs = await Log.paginate(1, 5, { action: 'TEST_ACTION' });
    console.log('Paginated logs:', paginatedLogs.logs.length);
    
    console.log('All logging tests completed successfully!');
  } catch (error) {
    console.error('Error during logging tests:', error.message);
  }
}

// Run the tests
testLogging();