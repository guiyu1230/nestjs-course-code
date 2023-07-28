import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from 'class-transformer'


/**
 * 验证管道自定义写法。 效果等同于默认的 ValidationPipe
 */
@Injectable()
export class ThirdValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype  }: ArgumentMetadata) {
        if(!metatype) {
            return value;
        }
        const object = plainToInstance(metatype, value);
        const errors = await validate(object);
        if(errors.length > 0) {
            throw new BadRequestException('参数验证失败');
        }
        return value;
    }
}