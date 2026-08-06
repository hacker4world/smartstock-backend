## 1. Project Summary
- **Purpose:** A NestJS backend application for inventory and stock management, featuring product tracking, supplier/manufacturer management, account management, and event tracking.
- **Architecture:** Modular NestJS application with feature-based modules, following the enterprise framework's standard architecture.

## 2. Core Tech Stack
- **Languages:** TypeScript 5.7.3
- **Frontend:** N/A (Backend-only project)
- **Backend:** NestJS 11.x with Express
- **Database & ORM:** PostgreSQL with TypeORM 0.3.28
- **Infrastructure:** Docker Compose (implied by .env files and uploads directory)

## 3. Directory Map (Where things live)
- `/` (Root): Configuration files (package.json, tsconfig.json, nest-cli.json), source code (src/), test files (test/), build output (dist/), uploads directory, and documentation (anvil.md, README.md)
- `/src`: Main application source with feature modules (accounts-module, calendar-module, classification-module, construction-site-module, events-module, import-export-module, notifications-module, product-module, request-return-module, supplier-manufacturer-module), common utilities, and bootstrap logic
- `/src/common`: Shared utilities, decorators, guards, interceptors, and filters
- `/test`: Jest test configuration and test files
- `/uploads`: File upload storage directory
- `/dist`: Compiled TypeScript output directory

## 4. Architecture & Data Flow
- **Routing/Wiring:** NestJS modular architecture with feature modules. Main application bootstraps in main.ts with global validation pipes and CORS enabled. Routes are organized within each feature module's controller.
- **State/Data Management:** TypeORM for database operations with PostgreSQL. Uses Entity classes for data models. Modules follow NestJS pattern with Controllers, Services, and Entities.
- **Auth Strategy:** JWT authentication (@nestjs/jwt) with cookie-parser for session management. Global validation pipe enforces DTO schemas using class-validator and class-transformer.

## 5. Execution Commands (DO NOT GUESS THESE)
- **Install Dependencies:** `npm install`
- **Run Dev Server:** `npm run start:dev`
- **Run Build:** `npm run build`
- **Run Linter/Formatter:** `npm run lint` (ESLint with Prettier)
- **Run Tests:** `npm test` (Jest)
- **Run Seed:** `npm run seed`

## 6. Coding Conventions & QA
- **Patterns:** NestJS standard patterns with feature modules, dependency injection, DTO validation, and global pipes. Uses WebSocket support via Socket.IO for real-time features. File uploads handled with Express static files.
- **Naming Conventions:** TypeScript files use PascalCase for modules/controllers (e.g., app.controller.ts), snake_case for entities and services. Module directories use kebab-case (e.g., accounts-module).
- **Testing Setup:** Jest for unit and integration testing. Test files use `.spec.ts` suffix. Test configuration in package.json with ts-jest transformer. Coverage reports generated to `/coverage` directory.