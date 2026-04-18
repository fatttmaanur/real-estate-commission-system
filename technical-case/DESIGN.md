# Design Document

## Project Overview

This is a **Transaction Management Dashboard** - a full-stack web application designed for managing real estate transactions with commission tracking and agent earnings calculation. The application provides a comprehensive interface for creating, viewing, updating, and deleting transactions while automatically calculating commission breakdowns and agent earnings.

### Key Features
- Complete CRUD operations for transactions
- Commission breakdown calculation (agency and agent splits)
- Agent earnings tracking and reporting
- Stage-based transaction workflow management
- Search and filtering capabilities
- Responsive web interface

## Architecture

### Overall Architecture
The application follows a **monorepo structure** with separate backend and frontend applications that communicate via REST API. This separation allows for independent development, deployment, and scaling of each component.

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│   (Nuxt.js)     │                │   (NestJS)      │
│   Port: 3001    │                │   Port: 3000    │
└─────────────────┘                └─────────────────┘
                                      │
                                      ▼
                               ┌─────────────────┐
                               │   Database      │
                               │   (MongoDB)     │
                               └─────────────────┘
```

### Backend Architecture

#### Framework & Technology Stack
- **Framework**: NestJS 11.0.1
- **Database**: MongoDB with Mongoose ODM 9.4.1
- **Language**: TypeScript 5.7.3
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest with e2e tests

#### Module Structure
The backend follows NestJS's modular architecture with clear separation of concerns:

1. **App Module** (`app.module.ts`)
   - Root module that configures the application
   - Establishes MongoDB connection
   - Imports feature modules

2. **Transactions Module** (`transactions/`)
   - **Controller** (`transactions.controller.ts`): Handles HTTP requests and responses
   - **Service** (`transactions.service.ts`): Contains business logic
   - **Schema** (`schemas/transaction.schema.ts`): MongoDB document definition
   - **DTOs** (`dto/`): Request/response objects with validation
   - **Constants** (`constants/transaction.constants.ts`): Transaction stages and validation rules

3. **Common Infrastructure**
   - **Exception Filter** (`common/filters/http-exception.filter.ts`): Global error handling
   - **Error Response DTO** (`common/dto/error-response.dto.ts`): Standardized error format

#### Database Schema
```typescript
Transaction {
  propertyId: string;
  listingAgent: string;
  sellingAgent: string;
  serviceFee: number;
  stage: 'agreement' | 'earnest_money' | 'title_deed' | 'completed';
  breakdown: Record<string, { amount: number; role: string }>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions` | Create new transaction |
| GET | `/transactions` | List all transactions |
| GET | `/transactions/:id` | Get single transaction |
| PATCH | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/transactions/:id/breakdown` | Get commission breakdown |
| GET | `/transactions/:agent/earnings` | Get agent earnings summary |

### Frontend Architecture

#### Framework & Technology Stack
- **Framework**: Nuxt 4.4.2 (Vue 3.5.32)
- **Styling**: Tailwind CSS 6.14.0
- **Language**: TypeScript
- **State Management**: Vue 3 Composition API
- **API Client**: Native fetch API

#### Component Structure
The frontend follows a component-based architecture with clear separation of responsibilities:

1. **App Layout** (`app.vue`)
   - Root component with global styling
   - Provides consistent layout and theming

2. **Pages** (`pages/`)
   - **Index Page** (`index.vue`): Main dashboard page
     - Manages application state
     - Handles API interactions
     - Coordinates between components

3. **Components** (`components/`)
   - **TransactionForm**: Handles transaction creation and editing
   - **TransactionTable**: Displays transactions with search/filter capabilities
   - **InsightsPanel**: Shows commission breakdowns and agent earnings

## Design Decisions

### 1. Technology Choices

#### Backend: NestJS
- **Rationale**: Provides excellent TypeScript support, modular architecture, and built-in features like dependency injection, validation, and API documentation
- **Benefits**: Scalable, maintainable, and follows enterprise-grade patterns

#### Frontend: Nuxt.js
- **Rationale**: Full-featured Vue.js framework with server-side rendering capabilities, excellent TypeScript support, and built-in routing
- **Benefits**: Developer experience, performance optimizations, and ecosystem maturity

#### Database: MongoDB
- **Rationale**: Document-based storage fits the transaction data structure well, flexible schema for breakdown calculations
- **Benefits**: Easy scaling, JSON-like documents match application data models

### 2. Architectural Patterns

#### Stage-Based Workflow
- Transactions follow a strict lifecycle: agreement → earnest_money → title_deed → completed
- **Benefits**: Prevents invalid state transitions, ensures data consistency
- **Implementation**: Constants define valid transitions, validated in service layer

#### Commission Calculation Logic
- Agency receives 50% of service fee
- Agent split: 50% if same agent, 25% each if different agents
- **Benefits**: Automated calculation prevents manual errors
- **Implementation**: Calculated on create/update, stored in breakdown field

#### DTO Pattern
- Separate DTOs for requests and responses
- **Benefits**: Type safety, input validation, API contract definition
- **Implementation**: class-validator decorators for validation rules

### 3. Data Flow & State Management

#### Frontend State Management
- Uses Vue 3 Composition API with reactive references
- State centralized in the main page component
- **Benefits**: Simple, reactive, no external state management library needed

#### API Communication
- Direct fetch calls from components to backend
- No additional HTTP client library
- **Benefits**: Lightweight, native browser API, reduced bundle size

### 4. Error Handling

#### Backend Error Handling
- Global exception filter catches all errors
- Standardized error response format
- **Benefits**: Consistent error responses, better debugging

#### Frontend Error Handling
- Try-catch blocks around API calls
- User-friendly error messages
- **Benefits**: Graceful failure handling, improved user experience

### 5. Validation Strategy

#### Input Validation
- Backend: class-validator decorators on DTOs
- Frontend: HTML5 validation + custom logic
- **Benefits**: Double validation (client and server), type safety

#### Business Rule Validation
- Stage transitions validated in service layer
- Commission calculations validated before saving
- **Benefits**: Data integrity, prevents invalid operations

## Security Considerations

### API Security
- CORS configured for specific origins (localhost:3000, 3001)
- Input validation prevents injection attacks
- No authentication implemented (development/demo purposes)

### Data Validation
- All inputs validated using DTOs
- MongoDB injection prevention through parameterized queries
- Type safety throughout the application stack

## Performance Considerations

### Backend Performance
- MongoDB indexing on frequently queried fields
- Efficient queries with proper projections
- Minimal data transformation in service layer

### Frontend Performance
- Vue 3's optimized reactivity system
- Tailwind CSS for minimal CSS bundle
- Lazy loading of components (Nuxt.js default)

## Testing Strategy

### Backend Testing
- Unit tests for services and utilities
- E2E tests for API endpoints
- **Tools**: Jest, Supertest

### Frontend Testing
- Component testing (planned)
- E2E testing (planned)
- **Tools**: Vue Test Utils, Playwright (future)

## Deployment & DevOps

### Development Environment
- Local development with hot reload
- Separate ports for backend (3000) and frontend (3001)
- MongoDB running locally or via Docker

### Production Considerations
- Environment-based configuration
- API base URL configurable via Nuxt runtime config
- Database connection string from environment variables

## Future Enhancements

### Potential Improvements
- User authentication and authorization
- Real-time updates with WebSockets
- Advanced filtering and sorting
- Export functionality (CSV/PDF)
- Audit logging for transactions
- Multi-tenancy support
- API rate limiting
- Comprehensive test coverage

### Scalability Considerations
- Database sharding for large datasets
- Caching layer (Redis) for frequently accessed data
- Microservices architecture for complex features
- CDN for static assets

## Conclusion

This design provides a solid foundation for a transaction management system with clear separation of concerns, type safety, and maintainable code structure. The chosen technologies and patterns support both current requirements and future scalability needs.