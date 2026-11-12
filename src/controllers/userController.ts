
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { CreateUserDto } from '../dto/CreateUserDto';
import { UpdateUserDto } from '../dto/UpdateUserDto';


const userRepository = AppDataSource.getRepository(User);


export class UserController {
   // GET /api/users - Get all users
   static async getAll(req: Request, res: Response) {
       try {
           const users = await userRepository.find({
               select: {
                   id: true,
                   name: true,
                   email: true,
                   isActive: true,
                   createdAt: true,
                   updatedAt: true
               }
           });
          
           res.json({
               success: true,
               count: users.length,
               data: users
           });
       } catch (error) {
           console.error('Error fetching users:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to fetch users'
               }
           });
       }
   }


   // GET /api/users/:id - Get user by ID
   static async getById(req: Request, res: Response) {
       try {
           const id = parseInt(String(req.params.id),
           10);
          
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'INVALID_ID',
                       message: 'User ID must be a number'
                   }
               });
           }


           const user = await userRepository.findOne({
               where: { id },
               select: {
                   id: true,
                   name: true,
                   email: true,
                   isActive: true,
                   createdAt: true,
                   updatedAt: true
               },
               relations: { tasks: true} // Load related tasks
           });


           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: {
                       code: 'USER_NOT_FOUND',
                       message: `User with ID ${id} does not exist`
                   }
               });
           }


           res.json({
               success: true,
               data: user
           });
       } catch (error) {
           console.error('Error fetching user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to fetch user'
               }
           });
       }
   }


   // POST /api/users - Create a new user
   static async create(req: Request, res: Response) {
       try {
          const { name, email, password, phoneNumber }: CreateUserDto = req.body;


           // Validation
           if (!name || !email || !password) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'MISSING_FIELDS',
                       message: 'Name, email, and password are required'
                   }
               });
           }

           // Validate phone number if provided
if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== '') {
    const phoneRegex = /^09\d{9}$/;

    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_PHONE',
                message: 'Phone number must be a valid Philippine mobile number (e.g. 09171234567)'
            }
        });
    }
}


           // Check if email already exists
           const existingUser = await userRepository.findOne({ where: { email } });
           if (existingUser) {
               return res.status(409).json({
                   success: false,
                   error: {
                       code: 'EMAIL_EXISTS',
                       message: 'A user with this email already exists'
                   }
               });
           }


           // Create new user
const hashedPassword = await bcrypt.hash(password, 10);

const user = userRepository.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber
});
           const savedUser = await userRepository.save(user);


           // Remove password from response
           const { password: _, ...userWithoutPassword } = savedUser;


           res.status(201).json({
               success: true,
               message: 'User created successfully',
               data: userWithoutPassword
           });
       } catch (error) {
           console.error('Error creating user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to create user'
               }
           });
       }
   }


   // PUT /api/users/:id - Update a user
   static async update(req: Request, res: Response) {
       try {
              const id = parseInt(String(req.params.id),
           10);
          
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'INVALID_ID',
                       message: 'User ID must be a number'
                   }
               });
           }


           const user = await userRepository.findOne({ where: { id } });
          
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: {
                       code: 'USER_NOT_FOUND',
                       message: `User with ID ${id} does not exist`
                   }
               });
           }


const { name, email, phoneNumber, isActive }: UpdateUserDto = req.body;

           // Check if email is being changed and already exists
           if (email && email !== user.email) {
               const existingUser = await userRepository.findOne({ where: { email } });
               if (existingUser) {
                   return res.status(409).json({
                       success: false,
                       error: {
                           code: 'EMAIL_EXISTS',
                           message: 'A user with this email already exists'
                       }
                   });
               }
           }


           // Update fields
           if (name !== undefined) user.name = name;
           if (email !== undefined) user.email = email;
           if (isActive !== undefined) user.isActive = isActive;


           const updatedUser = await userRepository.save(user);


           // Remove password from response
           const { password: _, ...userWithoutPassword } = updatedUser;


           res.json({
               success: true,
               message: 'User updated successfully',
               data: userWithoutPassword
           });
       } catch (error) {
           console.error('Error updating user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to update user'
               }
           });
       }
   }


   // DELETE /api/users/:id - Delete a user
   static async delete(req: Request, res: Response) {
       try {
             const id = parseInt(String(req.params.id),
           10);
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'INVALID_ID',
                       message: 'User ID must be a number'
                   }
               });
           }


           const user = await userRepository.findOne({ where: { id } });
          
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: {
                       code: 'USER_NOT_FOUND',
                       message: `User with ID ${id} does not exist`
                   }
               });
           }


           await userRepository.remove(user);


           res.status(200).json({
               success: true,
               message: 'User deleted successfully'
           });
       } catch (error) {
           console.error('Error deleting user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to delete user'
               }
           });
       }
   }

   static async createUserWithInitialTask(req: Request, res: Response) {
    try {
        const {
            name,
            email,
            password,
            phoneNumber,
            taskTitle,
            taskDescription,
            taskStatus,
            taskPriority,
            dueDate
        } = req.body;

        if (!name || !email || !password || !taskTitle) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'Name, email, password, and taskTitle are required'
                }
            });
        }

        const result = await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Check if user already exists
            const existingUser = await transactionalEntityManager.findOne(User, {
                where: { email }
            });

            if (existingUser) {
                throw new Error('EMAIL_ALREADY_EXISTS');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create User
            const user = transactionalEntityManager.create(User, {
                name,
                email,
                password: hashedPassword,
                phoneNumber
            });

            const savedUser = await transactionalEntityManager.save(User, user);

            // Create initial Task
            const task = transactionalEntityManager.create(Task, {
                title: taskTitle,
                description: taskDescription || null,
                status: taskStatus || 'pending',
                priority: taskPriority || 'medium',
                dueDate: dueDate || null,
                userId: savedUser.id,
                isDeleted: false
            });

            const savedTask = await transactionalEntityManager.save(Task, task);

            return {
                user: savedUser,
                task: savedTask
            };
        });

        const { password: _, ...userWithoutPassword } = result.user;

        return res.status(201).json({
            success: true,
            message: 'User and initial task created successfully',
            data: {
                user: userWithoutPassword,
                task: result.task
            }
        });

    } catch (error) {
        console.error('Error creating user with initial task:', error);

        if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'A user with this email already exists'
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                code: 'TRANSACTION_FAILED',
                message: 'Failed to create user and initial task'
            }
        });
    }
}
}
