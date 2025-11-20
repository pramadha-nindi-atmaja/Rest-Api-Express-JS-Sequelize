import sequelize from './utils/db.js';
import User from './models/userModel.js';
import Contact from './models/contactModel.js';
import Address from './models/addressModel.js';
import Log from './models/logModel.js';

// Test the enhanced models
async function testModels() {
  try {
    console.log('Testing enhanced models...');
    
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
    
    // Test creating a contact
    const contact = await Contact.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      userId: user.userId
    });
    console.log('Contact created:', contact.contactId);
    
    // Test creating addresses
    const address1 = await Address.create({
      addressType: 'Home',
      street: '123 Main St',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      zipCode: '10001',
      contactId: contact.contactId
    });
    
    const address2 = await Address.create({
      addressType: 'Work',
      street: '456 Business Ave',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      zipCode: '10002',
      contactId: contact.contactId
    });
    console.log('Addresses created:', address1.addressId, address2.addressId);
    
    // Test search functionality
    const searchResults = await Contact.search('John');
    console.log('Search results:', searchResults.length);
    
    // Test statistics functionality
    const contactStats = await Contact.getStats();
    console.log('Contact statistics:', contactStats);
    
    const addressStats = await Address.getStats();
    console.log('Address statistics:', addressStats);
    
    const userStats = await User.getStats();
    console.log('User statistics:', userStats);
    
    // Test pagination
    const paginatedContacts = await Contact.paginate(1, 5);
    console.log('Paginated contacts:', paginatedContacts.contacts.length);
    
    // Test logging
    const log = await Log.createLog(user.userId, 'CREATE_CONTACT', 'Created a new contact', '127.0.0.1', 'Test Agent');
    console.log('Log created:', log.logId);
    
    const paginatedLogs = await Log.paginate(1, 5);
    console.log('Paginated logs:', paginatedLogs.logs.length);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

// Run the tests
testModels();