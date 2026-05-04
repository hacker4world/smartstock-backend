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

The backend is decomposed into modules, each module takes care of a specific domain of the app

Each module is a folder inside /src folder that contains :
- Nestjs module file
- Controller file
- Service file
- Database entities (inside "entities" folder)
- request dtos (typescript interfaces inside "dto" folder)
- enums (if entities use them, inside "enums" folder)