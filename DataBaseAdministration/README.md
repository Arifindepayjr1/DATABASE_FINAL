# 📚 Blog Website — Database Administration

Welcome to the **Blog Website** Database Administration repository. This project is focused on designing and managing the database infrastructure for a robust and scalable blog platform. It supports user roles, privileges, post management, and comment interactions.

---

## 🚀 Project Overview

The Blog Website allows users to create, edit, and interact with blog content. This repository handles the backend database structure and CRUD operations for managing:

- Users
- Roles & Privileges


It follows **Role-Based Access Control (RBAC)** to ensure secure and flexible permission management.

---

## 🧱 Technologies Used

- **MySQL** (with `mysql2/promise`) — relational database
- **Node.js & Express.js** — RESTful API server
- **React** — frontend UI
- **Axios** — HTTP client
- **Tailwind CSS** — UI styling
- **React Toastify** — user notifications

---

## 🔐 Role-Based Access Control (RBAC)

The system uses RBAC to manage user access:

- **Admin**: Full control over users, roles, posts, and privileges.
- **Editor**: Can manage and moderate any posts and categories.
- **Author**: Can write and manage their own posts.
- **Reader**: Can view, like, and comment on posts.

Privileges are dynamically assigned to roles through an associative `role_privileges` table.

---

## 🗃️ Database Structure

Key tables include:

- `users`
- `roles`
- `user_roles`
- `privileges`
- `role_privileges`
- `categories`
- `posts`
- `post_versions`
- `comments`
- `post_likes`

Each table is normalized and optimized for maintainability and performance.

---

## ✅ Features

- **Dynamic Role Creation**: Admin can create new roles with custom privilege combinations.
- **Privilege Management**: Add, edit, or delete specific permissions.
- **User-Role Assignment**: Assign roles to users and manage access easily.
- **CRUD Operations**: Full backend support for creating, reading, updating, and deleting roles and privileges.
- **Post Versioning**: Support for editing and tracking different versions of blog posts.

---


---

## 🛠️ How to Run

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/DatabaseAdministration.git

2. Install Backend Dependencies:

cd server
npm install

3. Install Frontend Dependencies:

cd ../client
npm install

4. Configure .env or DB Connection in db.js

Run the App:

    Start backend: npm run dev or node server.js

    Start frontend: npm run dev (Vite)
