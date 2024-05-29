import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, MaxLength, MinLength } from "class-validator";
import { CreateAaaDto } from "./create-aaa.dto";
import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/mapped-types";
import { XxxDto } from "./xxx.dto";

// export class UpdateAaaDto extends CreateAaaDto {

// }

// export class UpdateAaaDto extends PartialType(CreateAaaDto) {

// }

// export class UpdateAaaDto extends PickType(CreateAaaDto, ['age', 'email']) {

// }

// export class UpdateAaaDto extends OmitType(CreateAaaDto, ['name', 'hoobies', 'sex']) {

// }

// export class UpdateAaaDto extends IntersectionType(CreateAaaDto, XxxDto) {

// }

export class UpdateAaaDto extends IntersectionType(
  PickType(CreateAaaDto, ['name', 'age']),
  PartialType(OmitType(XxxDto, ['yyy']))
) {

}