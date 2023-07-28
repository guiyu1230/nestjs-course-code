import { IsInt } from 'class-validator';

export class CreateFirstDto {
    name: string;
    @IsInt()
    age: number;
    sex: boolean;
    hobbies: Array<string>;
}
