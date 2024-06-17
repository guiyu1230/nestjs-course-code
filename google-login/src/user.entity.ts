import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum registerType {
  normal = 1,
  google = 2
}

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  email: string;

  @Column({
    length: 20
  })
  password: string;

  @Column({
    length: 50
  })
  nickName: string;

  @Column({
    comment: '头像 url',
    length: 200
  })
  avater: string;

  @Column({
    comment: '注册类型: 1.用户密码注册 2. google自动注册',
    default: 1
  })
  registerType: registerType;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}