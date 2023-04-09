import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

@ValidatorConstraint({ name: 'isValidEnumValue', async: false })
export class IsValidEnumValue implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [enumType] = args.constraints;
        if (typeof value === 'string') {
            return Object.values(enumType).includes(value);
        }
        if (Array.isArray(value)) {
            return value.every((v) => Object.values(enumType).includes(v));
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        const [enumType] = args.constraints;
        const allowedValues = Object.values(enumType).join(', ');
        return `The value must be one of the following: ${allowedValues}`;
    }
}



