
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Tag } from './Tag';

@Entity('tasks')
@Index(['userId'])
export class Task {
   @PrimaryGeneratedColumn()
   id!: number;


   @Column({ type: 'varchar', length: 200 })
   title!: string;


   @Column({ type: 'text', nullable: true })
   description: string | null = null;


   @Column({
       type: 'enum',
       enum: ['pending', 'in-progress', 'completed'],
       default: 'pending'
   })
   status!: 'pending' | 'in-progress' | 'completed';


   @Column({
       type: 'enum',
       enum: ['low', 'medium', 'high'],
       default: 'medium'
   })
   priority!: 'low' | 'medium' | 'high';


   @Column({ type: 'date', nullable: true })
   dueDate: Date | null = null;
   
get isOverdue(): boolean {
    if (!this.dueDate) {
        return false;
    }

    return this.dueDate < new Date() && this.status !== 'completed';
}

toJSON() {
    return {
        ...this,
        isOverdue: this.isOverdue
    };
}

   // Many-to-One Relationship: Many tasks belong to one user
@ManyToOne(() => User, user => user.tasks, { onDelete: 'SET NULL', nullable: true })
@JoinColumn({ name: 'userId' })
user!: User;

@Column({ type: 'int', nullable: true })
userId!: number | null;
   @ManyToOne(() => Category, category => category.tasks, { nullable: true })
@JoinColumn({ name: 'categoryId' })
category!: Category;

@Column({ type: 'int', nullable: true })
categoryId!: number | null;


// Many-to-Many Relationship: Tasks can have multiple tags
@ManyToMany(() => Tag, tag => tag.tasks)
@JoinTable()
tags!: Tag[];

@Column({ type: 'boolean', default: false })
isDeleted!: boolean;


   @CreateDateColumn()
   createdAt!: Date;


   @UpdateDateColumn()
   updatedAt!: Date;
}
