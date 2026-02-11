import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";

// entities/profile.entity.ts
@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio: string; // Intro/About

  @Column({ nullable: true })
  avatar: string; // Profile picture URL

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'json', nullable: true })
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };

  // Back reference to user
  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}