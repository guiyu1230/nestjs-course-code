import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Employee } from "./Employee";

@Entity()
export class Department {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  name: string;

  @OneToMany(() => Employee, (employee) => employee.department, {
    cascade: true // 设置了department cascade. 就要把emploee cascade去掉
  })
  employees: Employee[];
}
