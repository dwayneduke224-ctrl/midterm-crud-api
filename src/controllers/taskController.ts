// src/controllers/taskController.ts
import { Request, Response } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { TaskRepository } from '../repositories/TaskRepository';



const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);
const categoryRepository = AppDataSource.getRepository(Category);
const customTaskRepository = new TaskRepository(AppDataSource);

const stripHtmlTags = (value: string): string => {
    return value.replace(/<[^>]*>/g, '');
};

export class TaskController {
   // GET /api/users/:userId/tasks - Get all tasks for a user
   static async getUserTasks(req: Request, res: Response) {
       try {
           const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
           const userId = parseInt(userIdParam, 10);
          
           const status = typeof req.query.status === 'string' ? req.query.status : undefined;
const priority = typeof req.query.priority === 'string' ? req.query.priority : undefined;
const page = Math.max(
    parseInt(typeof req.query.page === 'string' ? req.query.page : '1', 10),
    1
);

const limit = Math.max(
    parseInt(typeof req.query.limit === 'string' ? req.query.limit : '10', 10),
    1
);

const sortBy =
    typeof req.query.sortBy === 'string'
        ? req.query.sortBy
        : 'createdAt';

const order =
    typeof req.query.order === 'string'
        ? req.query.order.toUpperCase()
        : 'DESC';

        if (!['createdAt', 'updatedAt', 'title', 'dueDate'].includes(sortBy)) {
    return res.status(400).json({
        success: false,
        error: {
            code: 'INVALID_SORT_FIELD',
            message: 'Invalid sort field'
        }
    });
}

if (!['ASC', 'DESC'].includes(order)) {
    return res.status(400).json({
        success: false,
        error: {
            code: 'INVALID_SORT_ORDER',
            message: 'Order must be ASC or DESC'
        }
    });
}

           if (isNaN(userId)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'User ID must be a number' }
               });
           }

           if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({
        success: false,
        error: {
            code: 'INVALID_STATUS',
            message: 'Invalid status value'
        }
    });
}

if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({
        success: false,
        error: {
            code: 'INVALID_PRIORITY',
            message: 'Invalid priority value'
        }
    });
}


           const user = await userRepository.findOne({ where: { id: userId } });
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'USER_NOT_FOUND', message: 'User not found' }
               });
           }


       const where: FindOptionsWhere<Task> = {
    userId,
    isDeleted: false
};

if (status) {
    where.status = status as 'pending' | 'in-progress' | 'completed';
}

if (priority) {
    where.priority = priority as 'low' | 'medium' | 'high';
}

const [tasks, total] = await taskRepository.findAndCount({
    where,
   order: {
    [sortBy]: order as 'ASC' | 'DESC'
},
    skip: (page - 1) * limit,
    take: limit
});

const totalPages = Math.ceil(total / limit);

    res.json({
    success: true,
    data: tasks,
    meta: {
        total,
        page,
        limit,
        totalPages
    }
});
       } catch (error) {
           console.error('Error fetching tasks:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' }
           });
       }
   }

   // GET /api/users/:userId/stats - Get task statistics for a user
static async getUserStats(req: Request, res: Response) {
    try {
        const userIdParam = Array.isArray(req.params.userId)
            ? req.params.userId[0]
            : req.params.userId;

        const userId = parseInt(userIdParam, 10);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ID',
                    message: 'User ID must be a number'
                }
            });
        }

        // Verify user exists
        const user = await userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
           taskRepository.count({
    where: {
        userId,
        isDeleted: false
    }
}),

      taskRepository.count({
    where: {
        userId,
        status: 'completed',
        isDeleted: false
    }
}),
           taskRepository.count({
    where: {
        userId,
        status: 'pending',
        isDeleted: false
    }
})
        ]);

        res.json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                pendingTasks
            }
        });
    } catch (error) {
        console.error('Error fetching task stats:', error);

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch task statistics'
            }
        });
    }
}


   // POST /api/users/:userId/tasks - Create a task for a user
   static async createTask(req: Request, res: Response) {
       try {
            const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
           const userId = parseInt(userIdParam, 10);
           const { title, description, status, priority, dueDate, categoryId } = req.body;

           if (isNaN(userId)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'User ID must be a number' }
               });
           }


           // Verify user exists
           const user = await userRepository.findOne({ where: { id: userId } });
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'USER_NOT_FOUND', message: 'User not found' }
               });
           }


           // Validate enum values
           if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_STATUS', message: 'Invalid status value' }
               });
           }


           if (priority && !['low', 'medium', 'high'].includes(priority)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_PRIORITY', message: 'Invalid priority value' }
               });
           }
           if (categoryId !== undefined && categoryId !== null) {
    const category = await categoryRepository.findOne({
        where: { id: Number(categoryId) }
    });

    if (!category) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'CATEGORY_NOT_FOUND',
                message: 'Category not found'
            }
        });
    }
}

const sanitizedTitle = stripHtmlTags(title);
const sanitizedDescription = description
    ? stripHtmlTags(description)
    : null;

const task = taskRepository.create({
    title: sanitizedTitle,
    description: sanitizedDescription,
    status,
    priority,
    dueDate,
    userId: Number(userId),
    categoryId: categoryId || null
});
           const savedTask = await taskRepository.save(task);


           res.status(201).json({
               success: true,
               message: 'Task created successfully',
               data: savedTask
           });
       } catch (error) {
           console.error('Error creating task:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' }
           });
       }
   }


   // DELETE /api/tasks/:id - Delete a task
   static async deleteTask(req: Request, res: Response) {
       try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
           const id = parseInt(idParam, 10);
          
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'Task ID must be a number' }
               });
           }


           const task = await taskRepository.findOne({ where: { id } });
           if (!task) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
               });
           }


           task.isDeleted = true;
await taskRepository.save(task);


           res.json({
               success: true,
               message: 'Task deleted successfully'
           });
       } catch (error) {
           console.error('Error deleting task:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to delete task' }
           });
       }
   }

   static async getOverdueTasks(req: Request, res: Response) {
    try {
        const tasks = await customTaskRepository.findOverdueTasks();

        return res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error finding overdue tasks:', error);

        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to find overdue tasks'
            }
        });
    }
}
}
