import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint()
export class MyValidator implements ValidatorConstraintInterface {
  validate(text: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
    console.log(text, validationArguments);
    // return true;
    // return text.includes(validationArguments.constraints[0])
    return new Promise<boolean>(resolve => {
      setTimeout(() => {
        resolve(text.includes(validationArguments.constraints[0]))
      }, 3000)
      
    })
  }
}