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



