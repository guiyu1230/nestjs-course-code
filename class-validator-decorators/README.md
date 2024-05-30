我们过了一遍 class-validator 的常用装饰器。

它们可以对各种类型的数据做精确的校验。

然后 @ValidateIf 可以根据别的字段来决定是否校验当前字段。

如果内置的装饰器不符合需求，完全可以自己实现，然后用 @Validate 来应用，用自定义装饰器 applyDecorators 包一层之后，和 class-validator 的内置装饰器就一模一样了。

所有的 class-validator 内置装饰器我们完全可以自己实现一遍。

| 装饰器 | 类型 | 描述 |
| --- | --- | --- |
| `IsNotEmpty` | any | 不能为空.检查 `''、undefined、null` |
| `IsDefined` | any | 不能为空. 检查`undefined、null` |
| `IsString` | string | 必须是字符串 |
| `IsEmail` | email | 必须是邮箱 |
| `IsIn` | any[] | 必须包含 |
| `IsNotIn` | any[] | 必须不包含 |
| `IsArray` | array | 必须是数组 |
| `ArrayMinSize` | array | 数组最少多少位 |
| `ArrayContains` | array | 数组最多多少位 |
| `ArrayUnique` | array | 数组项必须唯一不重复 |
| `IsNumber` | number | 必须是数字 |
| `Min` | number | 数字最小限制 |
| `Max` | number | 数字最大限制 |
| `IsPositive` | number | 数字必须是正数 |
| `IsNegative` | number | 数字必须是负数 |
| `IsDivisibleBy` | number | 数字必须能被指定数整除 |
| `IsDate` | date | 必须是日期格式 |
| `IsDateString` | date | 必须是 ISO 标准的日期字符串 |
| `IsAlpha` | string | 必须是字母 |
| `IsAlphanumeric` | string | 必须是字母和数字 |
| `Contains` | string | 必须包含某个值 |
| `MinLength` | string | 字符串限制最小长度 |
| `MaxLength` | string | 字符串限制最大长度 |
| `Length` | string | 字符串最小最大长度限制 |
| `IsIP` | string | 是否是ip |
| `IsPort` | string | 是否是端口 |
| `JSON` | any | 是否是json |
| `IsBoolean` | boolean | 是否是boolean |
| `IsHexColor` | string | 颜色校验 |
| `IsHSL` | string | 颜色校验 |
| `IsRgbColor` | string | 颜色校验 |
| `ValidateIf` | function | 校验条件判断 |

### dto规则
```js
import { ArrayContains, ArrayMaxSize, ArrayMinSize, ArrayNotContains, ArrayUnique, Contains, IsAlpha, IsAlphanumeric, IsArray, IsBoolean, IsDateString, IsDefined, IsDivisibleBy, IsEmail, IsHexColor, IsIn, IsNotEmpty, IsNotIn, IsOptional, IsPositive, IsString, Length, Max, MaxLength, Min, MinLength, Validate, ValidateIf } from "class-validator";
import { MyValidator } from "../my-validator";
import { MyContains } from "../my-contains.decorator";

export class CreateAaaDto {

  @IsNotEmpty({message: 'aaa 不能为空'})
  @IsString({message: 'aaa必须是字符串'})
  @IsEmail({}, {message: 'aaa 必须是邮箱'})
  // @IsOptional()
  // @IsIn(['aaa@aa.com', 'bbb@bb.com'])
  @IsNotIn(['aaa@aa.com', 'bbb@bb.com'])
  aaa: string;

  @IsArray()
  // @ArrayContains(['aaa'])
  @ArrayNotContains(['aaa'])
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @ArrayUnique()
  bbb: string;

  // @IsDefined()
  @IsNotEmpty()
  ccc: string;

  @IsPositive()
  @Min(1)
  @Max(10)
  @IsDivisibleBy(2)
  ddd: number;

  @IsDateString()
  eee: string;

  @IsAlphanumeric()
  // @IsAlpha()
  @Contains("aaa")
  fff: string;

  // @MinLength(2)
  // @MaxLength(6)
  @Length(2, 6)
  ggg: string;

  @IsBoolean()
  hhh: boolean;

  @ValidateIf(o => o.hhh === true)
  @IsNotEmpty()
  @IsHexColor()
  iii: string;

  // @Validate(MyValidator, [11, 22], {
  //   message: 'jjj 校验失败'
  // })
  @MyContains('111', {
    message: 'jjj 必须包含111'
  })
  jjj: string;
}
```

### 校验规则`my-validator.ts`

```js
// my-validator.ts
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint()
export class MyValidator implements ValidatorConstraintInterface {
    validate(text: string, validationArguments: ValidationArguments) {
        console.log(text, validationArguments)
        return text.includes(validationArguments.constraints[0]);
    }
}

// create-aaa.dto.ts
@Validate(MyValidator, [11, 22], {
    message: 'jjj 校验失败',
})
jjj: string;
```

### 校验规则`my-contains.decorator.ts`
```js
import { applyDecorators } from '@nestjs/common';
import { Validate, ValidationOptions } from 'class-validator';
import { MyValidator } from './my-validator';

export function MyContains(content: string, options?: ValidationOptions) {
  return applyDecorators(
     Validate(MyValidator, [content], options)
  )
}

// create-aaa.dto.ts
@MyContains('111', {
    message: 'jjj 必须包含 111'
})
jjj: string;
```









