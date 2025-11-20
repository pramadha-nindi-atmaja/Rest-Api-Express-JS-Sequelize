import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// In-memory data store (in a real app, this would be a database)
let users = [];
let contacts = [];
let addresses = [];

// Helper function to generate unique IDs
const generateId = () => Math.floor(Math.random() * 1000000);

// User routes
app.post('/api/users', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        errors: [
          !name ? "Name is required" : "",
          !email ? "Email is required" : "",
          !password ? "Password is required" : ""
        ].filter(Boolean),
        message: "Registration failed",
        data: null
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        errors: ["Email already registered"],
        message: "Registration failed",
        data: null
      });
    }
    
    // Create new user
    const newUser = {
      id: generateId(),
      name,
      email,
      password, // In a real app, this should be hashed
      isActive: true,
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    res.status(201).json({
      errors: null,
      message: "User created successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Registration failed",
      data: null
    });
  }
});

app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        errors: [
          !email ? "Email is required" : "",
          !password ? "Password is required" : ""
        ].filter(Boolean),
        message: "Login failed",
        data: null
      });
    }
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({
        errors: ["Invalid email or password"],
        message: "Login failed",
        data: null
      });
    }
    
    // Generate tokens (simplified)
    const accessToken = `access_token_${user.id}`;
    const refreshToken = `refresh_token_${user.id}`;
    
    res.status(200).json({
      errors: null,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Login failed",
      data: null
    });
  }
});

// Contact routes
app.post('/api/contacts', (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;
    
    // Validation
    if (!firstName) {
      return res.status(400).json({
        errors: ["First name is required"],
        message: "Contact creation failed",
        data: null
      });
    }
    
    // Create new contact
    const newContact = {
      id: generateId(),
      firstName,
      lastName: lastName || "",
      fullName: `${firstName} ${lastName || ""}`,
      email: email || "",
      phone: phone || "",
      userId: req.body.userId || 1, // Simplified - in real app would come from auth
      createdAt: new Date()
    };
    
    contacts.push(newContact);
    
    // Add addresses if provided
    const contactAddresses = [];
    if (Array.isArray(address)) {
      address.forEach(addr => {
        const newAddress = {
          id: generateId(),
          addressType: addr.addressType || "",
          street: addr.street || "",
          city: addr.city || "",
          province: addr.province || "",
          country: addr.country || "",
          zipCode: addr.zipCode || "",
          contactId: newContact.id
        };
        addresses.push(newAddress);
        contactAddresses.push(newAddress);
      });
    }
    
    res.status(201).json({
      errors: null,
      message: "Contact created successfully",
      data: {
        ...newContact,
        address: contactAddresses
      }
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Contact creation failed",
      data: null
    });
  }
});

// Enhanced search endpoint for contacts
app.get('/api/contacts/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        errors: ["Query parameter is required"],
        message: "Search failed",
        data: null
      });
    }
    
    // Search contacts by first name, last name, email, or phone
    const searchResults = contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(query.toLowerCase()) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(query.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(query.toLowerCase())) ||
      (contact.phone && contact.phone.includes(query))
    );
    
    // Attach addresses to each contact
    const resultsWithAddresses = searchResults.map(contact => {
      const contactAddresses = addresses.filter(addr => addr.contactId === contact.id);
      return {
        ...contact,
        address: contactAddresses
      };
    });
    
    res.status(200).json({
      errors: null,
      message: "Search completed successfully",
      data: resultsWithAddresses
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Search failed",
      data: null
    });
  }
});

// Get all contacts with pagination
app.get('/api/contacts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // For search functionality from request body (as per docs)
    let filteredContacts = contacts;
    if (req.body.search) {
      const search = req.body.search.toLowerCase();
      filteredContacts = contacts.filter(contact => 
        contact.firstName.toLowerCase().includes(search) ||
        (contact.lastName && contact.lastName.toLowerCase().includes(search)) ||
        (contact.email && contact.email.toLowerCase().includes(search)) ||
        (contact.phone && contact.phone.includes(search))
      );
    }
    
    // Paginate results
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
    
    // Attach addresses to each contact
    const contactsWithAddresses = paginatedContacts.map(contact => {
      const contactAddresses = addresses.filter(addr => addr.contactId === contact.id);
      return {
        ...contact,
        address: contactAddresses
      };
    });
    
    res.status(200).json({
      errors: null,
      message: "Contacts retrieved successfully",
      data: contactsWithAddresses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredContacts.length / limit),
        totalCount: filteredContacts.length,
        hasNextPage: endIndex < filteredContacts.length,
        hasPrevPage: startIndex > 0,
        limit: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Failed to retrieve contacts",
      data: null
    });
  }
});

// Get contact by ID
app.get('/api/contacts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contact = contacts.find(c => c.id === id);
    
    if (!contact) {
      return res.status(404).json({
        errors: ["Contact not found"],
        message: "Get contact failed",
        data: null
      });
    }
    
    // Attach addresses
    const contactAddresses = addresses.filter(addr => addr.contactId === id);
    
    res.status(200).json({
      errors: null,
      message: "Contact retrieved successfully",
      data: {
        ...contact,
        address: contactAddresses
      }
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Failed to retrieve contact",
      data: null
    });
  }
});

// Get contact statistics
app.get('/api/contacts/stats', (req, res) => {
  try {
    const totalContacts = contacts.length;
    const contactsWithAddress = contacts.filter(contact => 
      addresses.some(addr => addr.contactId === contact.id)
    ).length;
    
    // Group addresses by type
    const addressTypes = {};
    addresses.forEach(addr => {
      if (addr.addressType) {
        addressTypes[addr.addressType] = (addressTypes[addr.addressType] || 0) + 1;
      }
    });
    
    const addressTypeStats = Object.entries(addressTypes).map(([type, count]) => ({
      type,
      count
    }));
    
    res.status(200).json({
      errors: null,
      message: "Contact statistics retrieved successfully",
      data: {
        totalContacts,
        contactsWithAddress,
        addressTypes: addressTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Failed to retrieve statistics",
      data: null
    });
  }
});

// Update contact
app.put('/api/contacts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contactIndex = contacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        errors: ["Contact not found"],
        message: "Update contact failed",
        data: null
      });
    }
    
    const { firstName, lastName, email, phone } = req.body;
    
    // Update contact
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      firstName: firstName || contacts[contactIndex].firstName,
      lastName: lastName !== undefined ? lastName : contacts[contactIndex].lastName,
      fullName: `${firstName || contacts[contactIndex].firstName} ${lastName !== undefined ? lastName : contacts[contactIndex].lastName || ""}`,
      email: email !== undefined ? email : contacts[contactIndex].email,
      phone: phone !== undefined ? phone : contacts[contactIndex].phone,
      updatedAt: new Date()
    };
    
    res.status(200).json({
      errors: null,
      message: "Contact updated successfully",
      data: contacts[contactIndex]
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Failed to update contact",
      data: null
    });
  }
});

// Delete contact
app.delete('/api/contacts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contactIndex = contacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        errors: ["Contact not found"],
        message: "Delete contact failed",
        data: null
      });
    }
    
    // Remove contact
    const deletedContact = contacts.splice(contactIndex, 1)[0];
    
    // Remove associated addresses
    addresses = addresses.filter(addr => addr.contactId !== id);
    
    res.status(200).json({
      errors: null,
      message: "Contact deleted successfully",
      data: {
        id: deletedContact.id,
        firstName: deletedContact.firstName,
        lastName: deletedContact.lastName,
        fullName: deletedContact.fullName,
        email: deletedContact.email,
        phone: deletedContact.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      errors: ["Internal server error"],
      message: "Failed to delete contact",
      data: null
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    errors: ['Endpoint not found'],
    message: 'The requested endpoint does not exist',
    data: null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    errors: ['Internal server error'],
    message: 'Something went wrong!',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;