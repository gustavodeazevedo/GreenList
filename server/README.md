# GreenList Backend API

This is the backend API for the GreenList shopping list application. It provides endpoints for user authentication, shopping list management, and list sharing functionality.

## Setup Instructions

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/greenlist
   JWT_SECRET=your_jwt_secret_key_change_in_production
   FRONTEND_URL=http://localhost:5173
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
5. Start the development server: `npm run dev`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate a user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token

### Shopping Lists

- `GET /api/lists` - Get all lists for a user (protected)
- `POST /api/lists` - Create a new list (protected)
- `GET /api/lists/:id` - Get a single list by ID (protected)
- `PUT /api/lists/:id` - Update a list (protected)
- `DELETE /api/lists/:id` - Delete a list (protected)

### List Items

- `POST /api/lists/:id/items` - Add item to list (protected)
- `PUT /api/lists/:id/items/:itemId` - Update item in list (protected)
- `DELETE /api/lists/:id/items/:itemId` - Remove item from list (protected)

### List Sharing

- `POST /api/lists/:id/share` - Share list with another user (protected)
- `DELETE /api/lists/:id/share` - Remove user from shared list (protected)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- nodemailer for email functionality
