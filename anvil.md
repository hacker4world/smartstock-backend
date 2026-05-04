### Project overview :
This is the backend of a stock management system, this system will manage :
- products
- supprliers
- manufacturers
- construction sites
- product categorization (family, subfamily, category)
- product entries and sales
- configuration (warehouses and product measuring units)

### Project techstack :
- Main framework : NestJs + Typescript
- Database : Postgresql + Typeorm

### Architecture
Currently, this project will use a monolith architecture but will later be converted into microservice architecture

The backend is decomposed into **domain modules** under `/src`. Each module contains:
- `*.module.ts` — NestJS module definition
- `*.controller.ts` — REST API endpoints
- `*.service.ts` — Business logic
- `entities/` — TypeORM entity definitions
- `dto/` — Request/response DTOs with validation decorators
- `enums/` — Enum definitions (if applicable)

Each module is a folder inside /src folder that contains :
- Nestjs module file
- Controller file
- Service file
- Database entities (inside "entities" folder)
- request dtos (typescript interfaces inside "dto" folder)
- enums (if entities use them, inside "enums" folder)

### Current implemented modules :
1. configuration module :
Manages base configuration entities: **warehouses** (stock locations) and **units** (measurement units like kg, liter, piece).

2. classification module :
Manages the **product classification hierarchy** used to categorize products:
**Family** → **Subfamily** → **Category** (single chain, top-down).

**Constraints:**
- A `Family` can have many `Subfamilies`
- A `Subfamily` belongs to exactly one `Family`, can have many `Categories`
- A `Category` belongs to exactly one `Subfamily`
- All relationships are **non-nullable** (must provide parent ID on creation)

3. Supplier & Manufacturer Module :
Manages **suppliers** (vendors who provide products) and **manufacturers** (companies that produce products).

Both services implement a `findFiltered()` method with:
- **Pagination:** `page` and `pageSize` query params in the POST body
- **Max page size:** Controlled via the `PAGE_SIZE` env variable (default: 20)
- **Filtering:** Uses `ILike` for case-insensitive partial matching on `name`, `contact`, and (for manufacturers) `address`
- **Response shape:**
  ```ts
  {
    message: string,
    data: {
      items: Entity[],
      total: number,
      page: number,
      pageSize: number
    }
  }

### Shared utilities :
Path: src/common/utils/success-response.ts

A standardized response wrapper used across all services:

interface SuccessResponse<T> {
  message: string;
  data: T;
}
Factory function: successResponse<T>(data, message?) defaults message to "Operation completed successfully".

### App Bootstrap
File: src/main.ts

CORS: Enabled for http://localhost:8080 with credentials
Global ValidationPipe:
whitelist: true — strips unknown properties
forbidNonWhitelisted: true — throws error on unknown properties
transform: true — auto-transforms payloads to DTO instances
Port: From PORT env variable, defaults to 3000