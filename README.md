# Session Booking Platform - Backend API

A REST API backend for a platform where users can book sessions with teachers. Built with **Node.js**, **TypeScript**, **Express.js**, **MongoDB**, and **Mongoose**.

## Features

- **User Management**: Create users with unique email validation
- **Teacher Management**: Create teachers with specialization and experience
- **Session Management**: Create, book, and complete sessions
- **Aggregation Pipelines**: MongoDB aggregation for available sessions and user session history
- **Centralized Error Handling**: Consistent error responses across all endpoints
- **Input Validation**: Request validation using express-validator
- **Clean Architecture**: Organized project structure with separation of concerns

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose

## Project Structure

```
src/
├── config/
│   ├── index.ts          # Environment config
│   └── database.ts       # MongoDB connection
├── controllers/
│   ├── userController.ts
│   ├── teacherController.ts
│   └── sessionController.ts
├── middleware/
│   ├── errorHandler.ts   # Centralized error handler
│   └── validate.ts       # Validation middleware
├── models/
│   ├── User.ts
│   ├── Teacher.ts
│   ├── Session.ts
│   └── index.ts
├── routes/
│   ├── userRoutes.ts
│   ├── teacherRoutes.ts
│   ├── sessionRoutes.ts
│   └── index.ts
├── utils/
│   ├── constants.ts      # Enums and constants
│   └── errors.ts         # Custom error classes
├── validators/
│   └── index.ts          # Validation rules
├── app.ts                # Express app setup
└── server.ts             # Server entry point
```

## Prerequisites

- **Node.js** >= 18.x
- **MongoDB** >= 6.x (running locally or remote)
- **npm** >= 9.x

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (a default one is provided):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/session-booking
NODE_ENV=development
```

| Variable       | Description                    | Default                                          |
|----------------|--------------------------------|--------------------------------------------------|
| `PORT`         | Server port                    | `3000`                                           |
| `MONGODB_URI`  | MongoDB connection string      | `mongodb://localhost:27017/session-booking`       |
| `NODE_ENV`     | Environment mode               | `development`                                    |

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

Or use MongoDB Atlas by updating `MONGODB_URI` in `.env`.

### 5. Run the Application

**Development mode** (with hot-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

### 6. Verify

Open your browser or use curl:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API Endpoints

### Health Check

| Method | Endpoint  | Description         |
|--------|-----------|---------------------|
| GET    | `/health` | Server health check |

### Users

| Method | Endpoint              | Description                               |
|--------|-----------------------|-------------------------------------------|
| POST   | `/users`              | Create a new user                         |
| GET    | `/users/:id/sessions` | Get user sessions (upcoming & completed)  |

### Teachers

| Method | Endpoint    | Description           |
|--------|-------------|-----------------------|
| POST   | `/teachers` | Create a new teacher  |

### Sessions

| Method | Endpoint                                         | Description                    |
|--------|--------------------------------------------------|--------------------------------|
| POST   | `/sessions`                                      | Create a new session           |
| GET    | `/sessions/available?dateTimestamp={timestamp}`   | Get available sessions by date |
| POST   | `/sessions/:id/book`                             | Book an available session      |
| PATCH  | `/sessions/:id/complete`                         | Mark a session as completed    |

## API Details

### POST `/users`

Create a new user. Email must be unique.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### POST `/teachers`

Create a new teacher.

**Request Body:**

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "specialization": "Mathematics",
  "experience": 5
}
```

### POST `/sessions`

Create a new session (status defaults to AVAILABLE).

**Request Body:**

```json
{
  "teacherId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "startTime": "2024-12-01T10:00:00.000Z",
  "endTime": "2024-12-01T11:00:00.000Z"
}
```

### GET `/sessions/available?dateTimestamp={timestamp}`

Get all available sessions for a specific date. Uses **MongoDB Aggregation Pipeline**.

**Example:** `/sessions/available?dateTimestamp=1701388800000`

### POST `/sessions/:id/book`

Book an available session.

**Request Body:**

```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d2"
}
```

### PATCH `/sessions/:id/complete`

Mark a booked session as completed. No request body required.

### GET `/users/:id/sessions`

Get all sessions for a user, separated into upcoming and completed. Uses **MongoDB Aggregation Pipeline**.

## Session Status Flow

```
AVAILABLE → BOOKED → COMPLETED
```

- **AVAILABLE**: Session created by teacher, open for booking
- **BOOKED**: Session booked by a user
- **COMPLETED**: Session finished and moved to history

## Error Handling

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status Code | Description                           |
|-------------|---------------------------------------|
| 400         | Bad request / Validation error        |
| 404         | Resource not found                    |
| 409         | Conflict (duplicate / already booked) |
| 500         | Internal server error                 |

## Postman Collection

A Postman collection file (`postman_collection.json`) is included in the project root. Import it into Postman to test all API endpoints.

## Available Scripts

| Script              | Description                         |
|---------------------|-------------------------------------|
| `npm run dev`       | Start in development mode (nodemon) |
| `npm run build`     | Compile TypeScript to JavaScript    |
| `npm start`         | Run compiled production build       |
| `npm run build:check` | Type-check without emitting files |
