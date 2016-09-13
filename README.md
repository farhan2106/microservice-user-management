# Micro Service: User Management

## Features
Available defined tasks:
- `npm run dev` - Starts development server.
- `npm run lint` - Runs `eslint`.
- `npm test` - Runs api testing.

Rename .env.sample to .env with your configurations.

Below are the features of this micro service.

## Routes
- Index:
  - POST: /login
    - Payloads:
      - usernameOrEmail
      - password
      - expiresIn
      - issuer
  - POST: /logout
    - Headers:
      - Authorization {token}
  - POST: /register
    - Payloads:
      - username
      - email
      - password
  - POST: /socialRegister
    - Payloads:
      - socialId - Social site user id
      - socialSource - Social site eg. facebook, twitter etc
  - GET: /activate/{secret}
    - Params:
      - secret
  - POST: /verifyToken
    - Headers:
      - Authorization {token}
  - POST: /resetPassword
    - Payloads:
      - usernameOrEmail - *If only this is provided then it will generate secret string that can be used to reset password.*
      - secret
      - password
- User:
  - POST: /users
    - Headers:
      - Authorization {token}      
    - Payloads:
      - username
      - email
      - password      
  - GET: /users/{finder}
    - Headers:
      - Authorization {token}
    - Params:
      - finder - User Id, email or username
  - PUT: /users/{id}
    - Headers:
      - Authorization {token}
    - Params:
      - id - User Id      
    - Payloads:
      - username
      - email
      - password
      - active    
  - DELETE: /users/{id}
    - Headers:
      - Authorization {token}      
    - Params:
      - id - User Id       

### Database
It is using [js-data](http://www.js-data.io/) for ORM. Technically is should support
Firebase, MySql, RethinkDB, MongoDB, Redis and etc via adapters. I only tested in MySql.

Database migration and seeding is provided for `sql` database. Please run `knex migrate:latest` and `knex seed:run`.

Please install `knex` globally, if you want to do migration and seeding,  `npm install knex -g`.

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

## Testing
Testing is conducted using using `jasmine` with `istanbul` for code coverage.
- `npm install -g istanbul`
- `npm install -g jasmine`

Linting is also available via `eslint`. I follow `eslint-config-google` standard.
