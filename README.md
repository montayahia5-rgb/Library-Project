# Bibliothèque Numérique

## Installation

1. `npm install`
2. Créer fichier `.env` avec DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
3. `npm start`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/sign_up | Register user |
| POST | /auth/login | Login user |
| GET | /books | Get all books |
| POST | /borrow | Borrow a book |
| DELETE | /borrow/:id | Return a book |
| GET | /admin/stats | Dashboard statistics (admin) |

## Technologies

- React, Express, MySQL, JWT, Bcrypt