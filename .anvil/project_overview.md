## 1. Project Summary
- **Purpose:** A backend system called "smartstock-backend" designed for inventory and stock management, featuring modules for products, accounts, suppliers, construction sites, and event tracking.
- **Architecture:** Server-side application built with the NestJS framework (Modular Architecture).

## 2. Core Tech Stack
- **Languages:** TypeScript
- **Frontend:** N/A
- **Backend:** NestJS (Node.js)
- **Database & ORM:** PostgreSQL (via `pg` driver) and TypeORM
- **Infrastructure:** Docker (implied by `.env` and standard NestJS setup), Puppeteer (for PDF/web scraping/automation)

## 3. Directory Map & File Inventory (Where things live)
- `/` (Root): Project configuration and manifests.
  - Files: `package.json`, `tsconfig.json`, `nest-cli.json`, `.env.example`
- `/src`: Primary source code organized by feature modules.
  - Files: `main.ts`, `app.module.ts`, `app.controller.ts`, `seed.ts`
- `/src/accounts-module`: User account and authentication management.
  - Files: `accounts.controller.ts`, `accounts.service.ts`, `entities/account.entity.ts`, `dto/login.dto.ts`, `dto/create-account.dto.ts`
- `/src/product-module`: Product catalog and stock tracking.
  - Files: `product.controller.ts`, `product.service.ts`, `stock-change.service.ts`, `entities/product.entity.ts`, `entities/stock-change.entity.ts`
- `/src/common`: Shared utilities and decorators (not explored deeply).
- `/src/[other]-module`: Feature-specific logic for:
  - `construction-site-module`, `import-export-module`, `configuration-module`, `calendar-module`, `request-return-module`, `roles-module`, `supplier-manufacturer-module`, `notifications-module`, `events-module`, `classification-module`.

## 4. Architecture & Data Flow
- **Routing/Wiring:** Handled by NestJS Controllers using decorators (e.g., `@Controller`). The application boots from `main.ts` and wires modules through `app.module.ts`.
- **State/Data Management:** Persistent data is managed via TypeORM entities. DTOs (Data Transfer Objects) are used for request validation and transformation via `ValidationPipe`.
- **Auth Strategy:** Uses `@nestjs/jwt` and `bcrypt` for password hashing. Cookies are handled via `cookie-parser`.

## 5. Execution Commands (DO NOT GUESS THESE)
- **Install Dependencies:** `npm install` (implied by `package.json`)
- **Run Dev Server:** `npm run start:dev`
- **Run Linter/Formatter:** `npm run lint` or `npm run format`
- **Run Tests:** `npm run test` or `npm run test:e2e`
- **Seed Database:** `npm run seed`

## 6. Coding Conventions & QA
- **Patterns:** Modular architecture with a clear separation between Controllers (API layer), Services (Business logic), and Entities (Data layer).
- **Naming Conventions:** Kebab-case for module folders (e.g., `product-module`), PascalCase for classes/entities, and dot-notation for files (e.g., `product.service.ts`).
- **Testing Setup:** Uses Jest. Unit tests are identified by the `.spec.ts` suffix. E2E tests are located in the `/test` directory.