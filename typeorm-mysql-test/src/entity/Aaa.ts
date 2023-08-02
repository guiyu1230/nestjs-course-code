import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


// CREATE TABLE `t_aaa` (
//   `id` int NOT NULL AUTO_INCREMENT COMMENT '这是 id', 
//   `a_aa` text NOT NULL COMMENT '这是 aaa', 
//   `bbb` varchar(10) NOT NULL DEFAULT 'bbb', 
//   `ccc` double NOT NULL, 
//   UNIQUE INDEX `IDX_d2863426da68ecd1f50b775a8f` (`bbb`), 
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB

@Entity({
  name: 't_aaa'
})
export class Aaa {

  @PrimaryGeneratedColumn({
    comment: '这是 id'
  })
  id: number

  @Column({
    name: 'a_aa',
    type: 'text',
    comment: '这是 aaa'
  })
  aaa: string

  @Column({
    unique: true,
    nullable: false,
    length: 10,
    type: 'varchar',
    default: 'bbb'
  })
  bbb: string

  @Column({
    type: 'double'
  })
  ccc: number
}