
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Task } from '../entities/Task';

async function seed() {
    try {
        // Connect to database
        await AppDataSource.initialize();

        console.log('Database connected successfully');

        const userRepository = AppDataSource.getRepository(User);
        const taskRepository = AppDataSource.getRepository(Task);

        // Hash password for all dummy users
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create 5 dummy users
        const users = [
            {
                name: 'Seed User 1',
                email: 'seeduser1@example.com',
                password: hashedPassword
            },
            {
                name: 'Seed User 2',
                email: 'seeduser2@example.com',
                password: hashedPassword
            },
            {
                name: 'Seed User 3',
                email: 'seeduser3@example.com',
                password: hashedPassword
            },
            {
                name: 'Seed User 4',
                email: 'seeduser4@example.com',
                password: hashedPassword
            },
            {
                name: 'Seed User 5',
                email: 'seeduser5@example.com',
                password: hashedPassword
            }
        ];

        const savedUsers: User[] = [];

        for (const userData of users) {
            let user = await userRepository.findOne({
                where: { email: userData.email }
            });

            if (!user) {
                user = userRepository.create(userData);
                user = await userRepository.save(user);
            }

            savedUsers.push(user);
        }

        console.log('5 dummy users ready');

        // Create 15 dummy tasks
        const tasks = [
            {
                title: 'Finish project documentation',
                description: 'Complete the project documentation',
                status: 'pending' as const,
                priority: 'high' as const,
                userId: savedUsers[0].id
            },
            {
                title: 'Review project requirements',
                description: 'Review all project requirements',
                status: 'completed' as const,
                priority: 'medium' as const,
                userId: savedUsers[0].id
            },
            {
                title: 'Prepare presentation',
                description: 'Prepare the final presentation',
                status: 'in-progress' as const,
                priority: 'high' as const,
                userId: savedUsers[0].id
            },

            {
                title: 'Complete database design',
                description: 'Finish database design',
                status: 'completed' as const,
                priority: 'high' as const,
                userId: savedUsers[1].id
            },
            {
                title: 'Write API documentation',
                description: 'Document all API endpoints',
                status: 'pending' as const,
                priority: 'medium' as const,
                userId: savedUsers[1].id
            },
            {
                title: 'Test authentication',
                description: 'Test login and password hashing',
                status: 'in-progress' as const,
                priority: 'high' as const,
                userId: savedUsers[1].id
            },

            {
                title: 'Create user interface',
                description: 'Build the user interface',
                status: 'pending' as const,
                priority: 'medium' as const,
                userId: savedUsers[2].id
            },
            {
                title: 'Fix API errors',
                description: 'Fix remaining API errors',
                status: 'completed' as const,
                priority: 'high' as const,
                userId: savedUsers[2].id
            },
            {
                title: 'Run integration tests',
                description: 'Run all integration tests',
                status: 'in-progress' as const,
                priority: 'medium' as const,
                userId: savedUsers[2].id
            },

            {
                title: 'Update task controller',
                description: 'Update task controller functionality',
                status: 'completed' as const,
                priority: 'low' as const,
                userId: savedUsers[3].id
            },
            {
                title: 'Test pagination',
                description: 'Test pagination functionality',
                status: 'pending' as const,
                priority: 'medium' as const,
                userId: savedUsers[3].id
            },
            {
                title: 'Test sorting',
                description: 'Test task sorting',
                status: 'in-progress' as const,
                priority: 'low' as const,
                userId: savedUsers[3].id
            },

            {
                title: 'Prepare final report',
                description: 'Prepare the final project report',
                status: 'pending' as const,
                priority: 'high' as const,
                userId: savedUsers[4].id
            },
            {
                title: 'Review source code',
                description: 'Review the complete source code',
                status: 'completed' as const,
                priority: 'medium' as const,
                userId: savedUsers[4].id
            },
            {
                title: 'Final project testing',
                description: 'Perform final testing before submission',
                status: 'in-progress' as const,
                priority: 'high' as const,
                userId: savedUsers[4].id
            }
        ];

        for (const taskData of tasks) {
            const existingTask = await taskRepository.findOne({
                where: {
                    title: taskData.title,
                    userId: taskData.userId
                }
            });

            if (!existingTask) {
                const task = taskRepository.create({
                    ...taskData,
                    isDeleted: false
                });

                await taskRepository.save(task);
            }
        }

        console.log('15 dummy tasks ready');
        console.log('Seeding completed successfully!');

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
