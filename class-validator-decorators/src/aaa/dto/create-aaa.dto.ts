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
