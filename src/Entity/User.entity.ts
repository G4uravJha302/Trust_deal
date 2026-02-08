import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true, default: null })
  otp: string | null = null;

  @Column({ type: 'bigint', nullable: true, default: null })
  otpExpire: number | null = null;

  @Column({ default: 0 })
  otpAttempts: number = 0;

  @Column({ default: false })
  isVerify: boolean = false;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}