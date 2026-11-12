
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
    // POST /api/auth/login
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'Email and password are required'
                    }
                });
            }

            // Find user and include password
            const user = await userRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .where('user.email = :email', { email })
                .getOne();

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                });
            }

            // Compare entered password with hashed password
            const passwordMatches = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                });
            }

            // Remove password before sending response
            const { password: _, ...userWithoutPassword } = user;

            res.json({
                success: true,
                message: 'Login successful',
                data: userWithoutPassword
            });
        } catch (error) {
            console.error('Error logging in:', error);

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to login'
                }
            });
        }
    }
}
