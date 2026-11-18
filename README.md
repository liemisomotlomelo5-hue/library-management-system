# Library Management System

Full-stack web application for managing a library: books, stock/transactions, and users.

**Course:** BIWA2110 – Web Application Development  
**Stack:** React (frontend) + Express + MySQL (backend)

---

## Features

### Book Management
- Add new books (Title, Author, Genre, ISBN, Initial Quantity)
- Update existing book details
- Delete books

### Availability / Transactions
- Track quantity of each book in stock
- Record transactions: borrow (deduct stock), return, add stock
- Transaction history log

### User Management
- Login form – users enter **their own** Membership ID and password
- Create Account (self-registration)
- Add / update / delete users (name, membership ID, role)
- Roles: admin, librarian, member

### User Interface
- **Dashboard** – book availability table, low-stock highlight (&lt; 2 copies)
- **Book Management** – form + editable list with Update / Delete
- **Transactions** – form to add/deduct stock + history log
- **User Management** – login + admin forms to manage users
- Responsive layout with React Router navigation

---

## Tech Stack

| Layer            | Technology                                      |
|------------------|-------------------------------------------------|
| Frontend         | React (Vite), JSX, Hooks, React Router, Fetch API |
| Styling          | CSS                                             |
| State            | React hooks (useState, useEffect)               |
| Backend          | Express.js (RESTful API)                        |
| Database         | MySQL                                           |
| Auth             | JWT + bcryptjs                                  |
| Config           | `.env` file (dotenv)                            |

---

## Project Structure

```
library-management/
├── frontend/                 # React app
│   └── src/
│       ├── components/       # Navbar
│       ├── pages/            # Dashboard, Books, Transactions, Users, Login
│       ├── services/api.js   # Fetch API calls
│       └── context/          # AuthContext
├── backend/                  # Express + MySQL
│   ├── .env                  # Environment variables (edit DB_PASSWORD)
│   ├── .env.example          # Template
│   ├── routes/               # books, transactions, users
│   ├── schema.sql            # Database tables + sample books
│   ├── seedAdmin.js          # Optional: create admin account
│   ├── db.js
│   └── server.js
└── README.md
```

---

## Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- MySQL installed and running

### 1. Database

Create the database and tables:

```bash
mysql -u root -p < backend/schema.sql
```

(Enter your MySQL root password when prompted.)

### 2. Backend – configure `.env`

The project already includes a **`.env`** file in `backend/`.

Open `backend/.env` and set your MySQL password:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          ← put your MySQL password here
DB_NAME=library_db
DB_PORT=3306
PORT=5000
JWT_SECRET=library_management_secret_key_change_me_in_production
```

If the file is missing, copy the example:

```bash
cd backend
cp .env.example .env
# then edit .env
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

You should see: `Server running on port 5000`  
API: http://localhost:5000

### 4. Start Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173)

### 5. Create your account

1. Go to **Login**
2. Click **Create Account**
3. Enter **your own** Full Name, Membership ID and Password
4. You are signed in automatically

To make yourself **admin** (optional):

```bash
cd backend
node seedAdmin.js "Your Name" YOURMEMBERSHIPID yourpassword
```

---

## API Endpoints

### Books
| Method | Endpoint       | Description      |
|--------|----------------|------------------|
| GET    | /books         | List all books   |
| GET    | /books/:id     | Get one book     |
| POST   | /books         | Create book      |
| PUT    | /books/:id     | Update book      |
| DELETE | /books/:id     | Delete book      |

### Transactions
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /transactions               | List all transactions    |
| POST   | /transactions               | Create (borrow/return/add_stock) |
| GET    | /transactions/book/:bookId  | Transactions for a book  |

### Users
| Method | Endpoint        | Description                |
|--------|-----------------|----------------------------|
| GET    | /users          | List all users             |
| POST   | /users          | Create user                |
| POST   | /users/login    | Login (returns JWT + user) |
| PUT    | /users/:id      | Update user                |
| DELETE | /users/:id      | Delete user                |

---

## Submission

Submit a **GitHub link** containing both:

- `frontend/` (React app)
- `backend/` (Express + DB)

**Note:** `.env` is listed in `.gitignore` so secrets are not pushed.  
Keep `.env.example` in the repo. Markers will copy it to `.env` and set their own password.

---

## Marking Alignment

| Criteria                                      | Marks |
|-----------------------------------------------|-------|
| User Interface (consistent, responsive)       | 20    |
| Functionality (CRUD, navigation, API)         | 25    |
| Code Quality (React best practices, routes)   | 15    |
| Student’s Own Work                            | 20    |
| **Total**                                     | **80**|

---

Limkokwing University – Faculty of Information Communication Technology  
BIWA2110 Web Application Development
