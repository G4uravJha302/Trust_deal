import { Exclude } from 'class-transformer';
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToOne,
  JoinColumn
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ nullable: true, default: null })
  @Exclude()
  otp: string | null = null;

  @Column({ type: 'bigint', nullable: true, default: null })
  @Exclude()
  otpExpire: number | null = null;

  @Column({ default: 0 })
  @Exclude()
  otpAttempts: number = 0;

  @Column({ default: false })
  @Exclude()
  isVerify: boolean = false;

  @Column({ default: false })
  @Exclude()
  isBlocked: boolean = false;

  @Column({ type: 'bigint', nullable: true })
  @Exclude()
  blockedUntil: number;

  @Column({ default: 0 })
  @Exclude()
  failedLoginAttempts!: number;

  @OneToOne(() => Profile, (profile) => profile.user, { 
    cascade: true,
    eager: true
  })
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn()
  @Exclude()
  createdAt!: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt!: Date;
  isActive: boolean;
}