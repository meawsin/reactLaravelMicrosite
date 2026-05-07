# Corporate Newsroom Microsite

A modern, full-stack newsroom application built to manage and publish official press, media, and news articles. The project consists of a decoupled React frontend and a Laravel API backend, featuring a public-facing news feed and a secure admin portal for content management. 

*(Note: This is a sanitized, white-labeled version of a project originally developed during an industrial internship.)*

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

## 📂 Project Structure

The repository is divided into two main directories:
* `/frontend` - Contains the React application.
* `/backend` - Contains the Laravel API application.

## API Endpoints Reference

### Public Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/news` | Fetch paginated news articles. Accepts optional `?search=` parameter. |
| `GET` | `/api/news/{slug}` | Fetch a single news article by its unique slug. |

### Protected Admin Routes (Requires Bearer Token)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate admin and return a Sanctum token. |
| `POST` | `/api/admin/logout` | Revoke the current token. |
| `GET` | `/api/admin/news` | Fetch all articles for the admin dashboard (paginated). |
| `POST` | `/api/admin/news` | Create a new article. |
| `PUT` | `/api/admin/news/{id}` | Update an existing article. |
| `DELETE` | `/api/admin/news/{id}` | Delete an article. |
| `POST` | `/api/admin/import` | Bulk import articles via file upload. |