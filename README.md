# Colony Backend APIs

## Requirements

1. NodeJS 14+
1. Redis
1. PostgreSQP

## Setup

```bash
# clone repository
git clone <url>

# copy .env.example and adjust environment variables
cp .env.example .env

# Install Dependencies
npm install

# Build
npm run build

# start
npm run start

# To run in dev mode and hot reload
npm run start:dev
```

## APIs

```sh
  TEST URL          GET   /api/app
  SEED VALUES       GET   /api/seed
  GET AuthToken     GET   /api/token

  LOGIN             POST  /api/auth/login

  Complete API Documentation https://documenter.getpostman.com/view/5721584/TW71jktC
  POSTMAN Import Link: https://www.getpostman.com/collections/9262d0fde52b759b3346
  SWAGGER COLLECTION https://colony.invotyx.gq/api/docs/

```
