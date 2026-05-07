# Startup Bangladesh Newsroom Microsite

A modern, full-stack newsroom application built to manage and publish official press, media, and news articles. The project consists of a decoupled React frontend and a Laravel API backend, featuring a public-facing news feed and a secure admin portal for content management.

## Features

**Public Facing (Frontend)**
* **News Feed:** Browse paginated news articles sorted by publication date.
* **Search:** Real-time, debounced search functionality querying titles and content.
* **Article Details:** Dedicated pages for reading full articles with rich text rendering.
* **Responsive UI:** Clean, modern interface designed for readability.

**Admin Portal (Backend)**
* **Secure Authentication:** JWT-style token authentication using Laravel Sanctum.
* **Content Management (CRUD):** Create, read, update, and delete news articles.
* **Bulk Import:** Upload JSON, CSV, or Excel files to bulk-import legacy data or WordPress backups automatically.
* **Backdating:** Ability to set custom publication dates for archival content.

## Tech Stack

* **Frontend:** React 19, Vite, React Router DOM v7
* **Backend:** Laravel (PHP), MySQL/SQLite, Laravel Sanctum
* **Styling:** Custom CSS

## Project Structure

The repository is divided into two main directories:
* `/frontend` - Contains the React application.
* `/backend` - Contains the Laravel API application.

## API Endpoints Reference

Base URL: `http://localhost:8080/reactLaravelMicrosite/backend/public/api`

### Public Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/news` | Fetch paginated news articles. Accepts optional `?search=` parameter. |
| `GET` | `/news/{slug}` | Fetch a single news article by its unique slug. |

### Protected Admin Routes (Requires Bearer Token)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/admin/login` | Authenticate admin and return a Sanctum token. |
| `POST` | `/admin/logout` | Revoke the current token. |
| `GET` | `/admin/news` | Fetch all articles for the admin dashboard (paginated). |
| `POST` | `/admin/news` | Create a new article. |
| `PUT` | `/admin/news/{id}` | Update an existing article. |
| `DELETE` | `/admin/news/{id}` | Delete an article. |
| `POST` | `/admin/import` | Bulk import articles via file upload. |

## 💻 Local Development Setup

### Backend (Laravel) Setup
1. Navigate to the backend directory: `cd backend`
2. Install PHP dependencies: `composer install`
3. Copy the environment file: `cp .env.example .env`
4. Generate the application key: `php artisan key:generate`
5. Configure your `.env` database settings (e.g., MySQL or SQLite).
6. Run database migrations: `php artisan migrate`
7. Start the local server: `php artisan serve`

### Frontend (React) Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install JavaScript dependencies: `npm install`
3. Ensure the `API` constant in `src/App.jsx` matches your local Laravel server URL.
4. Start the Vite development server: `npm run dev`

## Authentication Flow
The application uses local storage (`sbl_admin_token`) on the frontend to persist the user session. All requests to `/admin/*` routes (except login) require this token to be passed in the `Authorization: Bearer <token>` header.