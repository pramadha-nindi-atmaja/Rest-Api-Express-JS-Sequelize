# REST API Documentation and Implementation

This project provides both API documentation and a working implementation of the REST API.

## New Features Added

1. **Search Contacts API** - Search contacts by name, email, or phone
2. **Contact Statistics API** - Get statistics about contacts and addresses
3. **Pagination Support** - Paginated results for contact listings
4. **Enhanced Error Handling** - Improved error responses

## API Endpoints

### User Management
- `POST /api/users` - Register a new user
- `POST /api/users/login` - User login

### Contact Management
- `POST /api/contacts` - Create a new contact
- `GET /api/contacts` - Get all contacts (with pagination)
- `GET /api/contacts/search` - Search contacts by query parameter
- `GET /api/contacts/stats` - Get contact statistics
- `GET /api/contacts/:id` - Get a specific contact
- `PUT /api/contacts/:id` - Update a specific contact
- `DELETE /api/contacts/:id` - Delete a specific contact

### Health Check
- `GET /health` - API health status

## Setup

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. For development: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: development)