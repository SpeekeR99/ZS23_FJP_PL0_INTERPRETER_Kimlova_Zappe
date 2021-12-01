import { Instruction, InstructionType } from './model';

export interface ValidationError {
    index: number;
    message: string;
}

export function Parse(input: string): Instruction[] {
    return [];
}

export function Validate(instructions: Instruction[]): ValidationError[] {
    return [];
}
