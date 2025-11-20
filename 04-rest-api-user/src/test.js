// Test file to demonstrate the enhanced user API functionality

import sequelize from './utils/db.js';
import User from './models/userModel.js';

async function testUserAPI() {
  try {
    console.log('Testing enhanced user API...');
    
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
    
    // Test searching users
    const searchResults = await User.search('Test');
    console.log('Search results:', searchResults.length);
    
    // Test getting user statistics
    const stats = await User.getStats();
    console.log('User statistics:', stats);
    
    // Test pagination
    const paginatedUsers = await User.paginate(1, 5, { search: 'Test' });
    console.log('Paginated users:', paginatedUsers.users.length);
    
    // Test updating user password
    const updatedUser = await User.updatePassword(user.userId, 'newpassword123');
    console.log('User password updated:', updatedUser.userId);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

// Run the tests
testUserAPI();