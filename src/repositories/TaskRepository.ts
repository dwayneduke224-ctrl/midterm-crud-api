import { DataSource, Repository } from 'typeorm';
import { Task } from '../entities/Task';

export class TaskRepository extends Repository<Task> {

    constructor(dataSource: DataSource) {
        super(Task, dataSource.manager);
    }

    async findOverdueTasks(): Promise<Task[]> {
        return this.createQueryBuilder('task')
            .where('task.dueDate < CURDATE()')
            .andWhere('task.status != :status', {
                status: 'completed'
            })
            .andWhere('task.isDeleted = :isDeleted', {
                isDeleted: false
            })
            .getMany();
    }
}