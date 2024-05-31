# QNX-init

A starter template for building REST APIs with Express, Drizzle ORM, and PostgreSQL.

## Features

- [x] User Signup
- [x] User Verification via Email
- [x] User Login

## API Documentation

### `GET /user`

Returns the user. Requires `AUTH_TOKEN` in the request header.

### `PUT /user/update`

Updates the user. Requires `AUTH_TOKEN` in the request header.

User can only update themselves. Properties that can be updated are `name`, `email`, and `password`.

If `email` is updated, the user will be unverified and a new verification email will be sent.

### `POST /user/create`

Creates a new user. Requires `name`, `email`, and `password` in the request body.

### `GET /user/verify`

Verifies the user. Requires `token` and `email` in the query string.

### `DELETE /user/remove`

Removes the user. Requires `AUTH_TOKEN` in the request header.

A user can only remove themselves. An admin can remove any user.

### `POST /user/login`

Logs in the user. Requires `email` and `password` in the request body.

## Running the App

Install the dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```
