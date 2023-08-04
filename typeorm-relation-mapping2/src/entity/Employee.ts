import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Department } from "./Department";

@Entity()
export class Employee {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  name: string;

  @JoinColumn({
    name: 'd_id'
  })
  @ManyToOne(() => Department, {
    // cascade: true  // 设置了 cascade，那就只需要保存(manager.save) empolyee 就好了
  })
  department: Department
}
