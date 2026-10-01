# Mini Inventory & Order Management System

A full-stack inventory and order management system built with the MERN stack.

## Tech Stack

**Frontend**

* React.js
* TypeScript
* Tailwind CSS
* Axios
* React Router
* Lucide React

**Backend**

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose

## Installation

Clone the repository and install dependencies.

### Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### Seed Database

To add sample products, customers, and orders:

```bash
npm run seed
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```
