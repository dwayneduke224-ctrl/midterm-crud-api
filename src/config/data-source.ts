// src/config/data-source.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';
import * as dotenv from 'dotenv';
import path from 'path';


dotenv.config();


export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    entities: [User, Task, Category, Tag],

    // NEVER enable synchronize
    synchronize: false,

    // Only enable SQL logging in development
    logging: process.env.NODE_ENV === 'development',

    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
});