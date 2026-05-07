# BuyWise AI - Backend v2.0

Simple Express backend for price tracking.

## Quick Start

```bash
npm install
npm start
```

## Environment

Create `.env`:
```
MONGO_URI=mongodb+srv://...
PORT=5000
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - Get all products
- `POST /api/products` - Add product
