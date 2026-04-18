# Backend

NestJS + MongoDB backend for transaction management.

## Features

- Create, list, get, update, and delete transactions
- Automatic commission breakdown calculation
- Stage transition validation
- Agent earnings summary
- Breakdown summary by transaction

## Project Structure

```text
backend/
  src/
    main.ts
    app.module.ts
    transactions/
      constants/
      dto/
      schemas/
      transactions.controller.ts
      transactions.module.ts
      transactions.service.ts
```

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://fatmanurakbas1998_db_user:RLSW6JZkwygbFqAO@cluster0.q2xp9kx.mongodb.net/estate-db
PORT=3000

```

## Run

```bash
npm install
npm run start:dev
```

## Test

```bash
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e
```

## API Endpoints

### Create transaction

`POST /transactions`

```json
{
  "propertyId": "prop-123",
  "listingAgent": "john",
  "sellingAgent": "jane",
  "serviceFee": 10000
}
```

### Update transaction

`PATCH /transactions/:id`

```json
{
  "serviceFee": 12000,
  "stage": "earnest_money"
}
```

### Delete transaction

`DELETE /transactions/:id`

### Extra endpoints

- `GET /transactions`
- `GET /transactions/:id`
- `GET /transactions/:id/breakdown`
- `GET /transactions/agent/:agentName/earnings`
