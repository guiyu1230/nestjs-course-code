import { IsInt } from 'class-validator';

export class CreateFiveDto {
    name: string;
    @IsInt()
    age: number;
    sex: boolean;
    hobbies: Array<string>;
}
