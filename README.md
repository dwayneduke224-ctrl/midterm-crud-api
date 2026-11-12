1. What was the most challenging part of building this API?
2. How does TypeORM make database operations easier compared to raw SQL?
3. Why is it important to exclude the password field from API responses? How did you implement this?
4. Describe a scenario where you would need to use database transactions instead of individual operations.
5. What is the difference between `synchronize: true` and migrations? When should you use each?
6. If you had to add a `Product` entity with a relationship to `User` (a user can have many products), how would you modify the code?
7. What security improvements would you make before deploying this API to production? (Hint: password hashing, rate limiting, authentication, etc.)

Answers 
1. The most challenging part of building this API was connecting TypeORM to MySQL and making sure the CRUD operations worked correctly. I had to configure the database connection, define the User entity, and handle errors when requests were invalid. Through this activity, I learned how the different parts of a REST API work together.
2. TypeORM makes database operations easier because I can work with TypeScript classes and objects instead of writing SQL queries for every operation. It provides repositories and methods for creating, retrieving, updating, and deleting records. It also helps manage entity relationships and supports type safety, which makes the code easier to maintain.
3. It is important to exclude passwords from API responses because passwords are confidential information. If they are exposed, unauthorized people could misuse them. I implemented this by using select: false in the password column of the User entity and ensuring that the controller does not include passwords in its responses. In a real application, passwords should also be hashed before being stored in the database.
4. I would use a database transaction when transferring money between two bank accounts. The system needs to subtract money from one account and add it to another account. Both operations must succeed together. If one operation fails, the transaction should be rolled back so the database remains consistent.
5. The synchronize: true option automatically updates the database schema based on the entity definitions. It is convenient during development because it reduces manual setup. However, it can cause data loss when the schema changes unexpectedly.

Migrations allow developers to define and track database schema changes through specific, versioned steps. I would use synchronize: true for simple local development and migrations for production applications, where database changes need to be controlled and reviewed.
6. I would create a new Product entity with fields such as id, name, and price. Then I would define a one-to-many relationship in the User entity and a many-to-one relationship in the Product entity using TypeORM decorators.

For example, the User entity would use @OneToMany() and the Product entity would use @ManyToOne(). I would register the Product entity in the DataSource, create product routes and controller methods, and add the necessary CRUD operations. Each product would be associated with a user through a foreign key.
7. Before deploying this API to production, I would hash passwords using bcrypt or Argon2 instead of storing plain-text passwords. I would add authentication and authorization so that users can only access information they are permitted to see. I would also implement rate limiting, stronger input validation, secure HTTP headers, and HTTPS.

7.1 README
1.What was the most challenging part of building this API?
2.How does TypeORM make database operations easier compared to raw SQL?
3.Why is it important to exclude the password field from API responses? How did you implement this?
4.Describe a scenario where you would need to use database transactions instead of individual operations.
5.What is the difference between synchronize: true and migrations? When should you use each?
6.If you had to add a Comment entity (tasks can have many comments), how would you modify the code?
7.What security improvements would you make before deploying this API to production? (Hint: password hashing, rate limiting, authentication, etc.)
8.Why did you need to add the ! (definite assignment operator) to your entity properties?
9.What are the benefits of explicitly defining column types (e.g., type: 'varchar') in your entities?
10.How do relationships in TypeORM differ from foreign keys in raw SQL? What are the advantages?

ANSWERS:
1.For me, the most challenging part was connecting the API to the MySQL database and setting up the relationship between users and tasks. I also had some difficulty understanding how TypeORM works with entities and how to handle errors properly. But after going through the steps and testing the endpoints, I started to understand how everything works together.

2.TypeORM makes database operations easier because I don't have to write SQL queries for every operation. I can use methods like find(), save(), and remove() to get, create, and delete records. It also makes it easier to connect related tables using entities and relationships. This makes the code cleaner and easier to understand.

3.It is important to hide passwords because they are private information, and other people should not be able to see them through the API. In this project, I used select: false in the password column and removed the password from the response before sending the user data. If this were a real application, I would also use bcrypt or Argon2 to hash passwords before saving them in the database.

4.One example is when creating a user and a task for that user at the same time. If the user is created successfully but the task fails, the database could end up with incomplete data. Using a transaction allows both operations to succeed together or be rolled back if something goes wrong.

5.synchronize: true automatically updates the database tables based on the entities in the code. It is useful when developing and testing because it saves time. However, it can cause problems or data loss if used in production.

Migrations are used to make database changes in a more controlled way. They allow developers to apply and undo changes when needed. I would use synchronization for simple development testing and migrations for production because they are safer and easier to manage.

6.I would create a new Comment entity with fields like id, content, taskId, and createdAt. Then, I would connect it to the Task entity using TypeORM relationships. One task could have many comments, while each comment would belong to one task.

I would also register the Comment entity in the DataSource, create a migration for its table, and make a controller and routes for adding, viewing, updating, and deleting comments. After that, I would test the new endpoints to make sure they work correctly.

7.Before deploying the API, I would improve its security by hashing passwords using bcrypt or Argon2 instead of storing plain-text passwords. I would also add authentication so only logged-in users can access protected endpoints and authorization so users cannot access other people's data.

I would add rate limiting to prevent too many requests, validate user inputs, use HTTPS, and configure CORS to allow only trusted websites. I would also keep my database credentials in the .env file, disable synchronize in production, and use migrations to manage database changes safely.

8.I used the ! because TypeScript requires class properties to be initialized when strict mode is enabled. Since TypeORM fills in the entity properties when it gets data from the database, I don't need to assign every property a value manually. The ! tells TypeScript that the property will be assigned later.
For example:
@Column({ type: 'varchar', length: 100 })
name!: string;
This helps prevent TypeScript errors when working with the entities.

9.Explicitly defining column types helps me know exactly what kind of data each field can store. For example, I can use varchar for names and emails and text for longer descriptions. It also makes the database structure clearer and helps avoid errors when TypeORM creates or updates tables. This makes the code easier to understand and maintain.

10.In raw SQL, foreign keys are used to connect tables and make sure that related records are valid. In TypeORM, I can define these relationships directly in my TypeScript entities using decorators like @OneToMany and @ManyToOne.

PHASE 3 : 
# 7.1 API Documentation

## API Versioning

All API endpoints are now available under the `/api/v1` prefix.

Example:

```text
GET /api/v1/users
```

Old `/api` endpoints return **410 Gone** and indicate that the endpoint has moved to `/api/v1`.

---

## New API Endpoints

### Authentication

```text
POST /api/v1/auth/login
```

Used to log in a user using their email and password.

### User With Initial Task

```text
POST /api/v1/users/with-initial-task
```

Creates a user and their first task at the same time using a TypeORM transaction.

If the task creation fails, the user creation is rolled back.

### Overdue Tasks

```text
GET /api/v1/overdue
```

Returns tasks where the due date is in the past and the task status is not `completed`.

### User Task Statistics

```text
GET /api/v1/users/:userId/stats
```

Returns the total, completed, and pending tasks for a user.

### User Tasks

```text
GET /api/v1/users/:userId/tasks
POST /api/v1/users/:userId/tasks
```

These endpoints support task creation, filtering, pagination, and sorting.

### Delete Task

```text
DELETE /api/v1/tasks/:id
```

Uses soft deletion by setting `isDeleted` to `true` instead of permanently removing the task.

---

## Task Filtering, Pagination, and Sorting

Tasks can be filtered by:

```text
status
priority
```

Example:

```text
GET /api/v1/users/6/tasks?status=pending&priority=high
```

Pagination is supported using:

```text
page
limit
```

Example:

```text
GET /api/v1/users/6/tasks?page=1&limit=10
```

Sorting is supported using:

```text
sortBy
order
```

Example:

```text
GET /api/v1/users/6/tasks?sortBy=title&order=ASC
```

---

## Database Schema

### User

The `users` table contains:

```text
id
name
email
phoneNumber
password
isActive
createdAt
updatedAt
```

### Task

The `tasks` table contains:

```text
id
title
description
status
priority
dueDate
userId
categoryId
isDeleted
createdAt
updatedAt
```

### Category

The `categories` table contains:

```text
id
name
```

### Tag

The `tags` table contains:

```text
id
name
```

---

## Database Relationships

### User and Task

One user can have many tasks.

```text
User 1 ──────── * Task
```

A task belongs to one user.

If a user is deleted, the task's `userId` is set to `NULL`.

### Category and Task

One category can have many tasks.

```text
Category 1 ──────── * Task
```

A task can belong to one category.

### Task and Tag

Tasks and tags have a Many-to-Many relationship.

```text
Task * ──────── * Tag
```

A task can have multiple tags, and a tag can belong to multiple tasks.

TypeORM uses a junction table to connect the tasks and tags.

---

## Computed Task Property

The Task entity has an `isOverdue` computed property.

It returns `true` when:

```text
dueDate is in the past
AND
status is not completed
```

Example:

```json
{
    "title": "Finish project",
    "status": "pending",
    "isOverdue": true
}
```

---

## Custom Task Repository

A custom Task repository includes:

```text
findOverdueTasks()
```

This method finds tasks where the due date is before today and the status is not `completed`.

---

## DTOs

The project uses DTOs for request body typing.

DTOs are located in:

```text
src/dto/
```

The project includes:

```text
CreateUserDto
UpdateUserDto
CreateTaskDto
```

---

## Database Seeder

The project includes a seed script that creates:

- 5 dummy users
- 15 dummy tasks

Run the seeder with:

```bash
npm run seed
```

The seed script checks for existing users and tasks before inserting them, helping prevent duplicate data.

---

## Other Implemented Features

The API also includes:

- Password hashing using bcrypt
- Password exclusion from API responses
- Input sanitization for task title and description
- Request logging middleware
- Database transactions
- Custom Task repository
- Soft delete
- Pagination
- Sorting
- Filtering
- API versioning
- Graceful shutdown
- Environment-specific database configuration
- TypeORM migrations