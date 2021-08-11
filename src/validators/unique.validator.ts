import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getConnection } from 'typeorm';

@ValidatorConstraint({ async: true })
export class UniqueConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const tableName = args.constraints[0].table;
    const column = args.constraints[0].column || args.property;
    const required =
      'required' in args.constraints[0] ? !!args.constraints[0].required : true;
    const val = args.object[args.property];
    if (required && !val) {
      return false;
    }
    const user = await getConnection()
      .createQueryBuilder()
      .from(tableName, 't')
      .where(`t.${column} = :val`, { val })
      .getOne();
    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    ////console.log(args);
    return `$property $value is already exist`;
  }
}

export function Unique(
  repo: { table: string; column?: string; required?: boolean },
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [repo],
      validator: UniqueConstraint,
    });
  };
}
