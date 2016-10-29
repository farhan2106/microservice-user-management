# Micro Service: User Management
[![Build Status](https://travis-ci.org/farhan2106/microservice-user-management.svg?branch=master)](https://travis-ci.org/farhan2106/microservice-user-management)
[![Coverage Status](https://coveralls.io/repos/github/farhan2106/microservice-user-management/badge.svg?branch=master)](https://coveralls.io/github/farhan2106/microservice-user-management?branch=master)

## Development:
Install the following packages:
- `npm install -g standard`
- `npm install -g npm-check-updates`
- `npm install -g nodemon`

Rename .env.sample to .env with your configurations.

## Testing
Testing is conducted using using `jasmine` with `istanbul` for code coverage.
- `npm install -g istanbul`
- `npm install -g jasmine`

## Features
Available defined tasks:
- `npm run dev` - Starts development server.
- `npm run lint` - Runs [`standard`](https://github.com/feross/standard).
- `npm test` - Runs api testing.

### Database
It is using mongodb with mongoose.

### Login & Logout
- User can login with `username` or `email`.
- After successful login, a `jwt` token will be generated.
- After logout, logged out token in stored in `blacklisted_tokens` table until the `expiredAt` value is less than the current unix time. There is a timer that will run every 24h.

### Registration
- Username type can be configured with a regex.
- Password strength can be configured with a regex.
- Required fields are `username`, `email`, and `password`.
- `username` and `email` is unique.
- After registration, a `secret` will be given for user activation.
- Register user from social login by submitting a social user id and a social source eg. facebook, twitter etc.

### Reset Password
- A `secret` will be given when user wants to reset password. User will also be deactivated.
- Use this `secret` when submitting a new `password`.

### View Profile
- User data can be retrieved by `id`, `username`, and `email`.
