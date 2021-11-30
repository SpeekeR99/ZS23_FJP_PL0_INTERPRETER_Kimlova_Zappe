// ------------------------------------------- INTERFACES

export interface DataModel {
    pc: number;
    base: number;
    sp: number;

    stack: Stack;
    heap: Heap;

    input: string;
    output: string;
}

export interface Stack {
    maxSize: number;

    stackItems: StackItem[];
    stackFrames: StackFrame[];
}
export interface StackItem {
    value: number;
}
export interface StackFrame {
    index: number;
    size: number;
}

export interface Heap {
    size: number;
    blocks: HeapBlock[];
}
export interface HeapBlock {
    index: number;
    size: number;
    empty: boolean;

    values: number[];
}

export enum InstructionType {
    LIT,
    OPR,
    LOD,
    STO,
    CAL,
    INT,
    JMP,
    JMC,
    RET,
    REA,
    WRI,
    // OPF,
    // RTI,
    // ITR,
    NEW,
    DEL,
    LDA,
    STA,
    PLD,
    PST,
}

enum OperationType {
    U_MINUS = 1,
    ADD = 2,
    SUB = 3,
    MULT = 4,
    DIV = 5,
    MOD = 6,
    IS_ODD = 7,
    EQ = 8,
    N_EQ = 9,
    LESS_THAN = 10,
    MORE_EQ_THAN = 11,
    MORE_THAN = 12,
    LESS_EQ_THAN = 13,
}

export interface Instruction {
    index: number;
    instruction: InstructionType;
    level: number;
    parameter: number;
}

export interface InstructionStepParameters {
    model: DataModel;
    instructions: Instruction[];
    input: string;
}
export interface InstructionStepResult {
    isEnd: boolean;

    output: string;

    warnings: string[];
    inputNextStep: string;
}

// ------------------------------------------- INTERFACES

// ------------------------------------------- UTILITY FUNCTIONS

function GetValuesFromStack(
    stack: Stack,
    index: number,
    count: number,
    decrementCurrentFrame: boolean = true
): number[] {
    let retvals: number[] = [];
    for (let i = 0; i < count; i++) {
        if (!CheckSPInBounds(index - i)) {
            throw new Error('Pokus o přístup na zásobník záporným indexem');
        }
        retvals.push(stack.stackItems[index - i].value);
        if (decrementCurrentFrame) {
            stack.stackFrames[stack.stackFrames.length - 1].size--;
        }
    }
    return retvals;
}

function ConvertToStackItems(...values: number[]) {
    let items: StackItem[] = [];
    for (let i = 0; i < values.length; i++) {
        items.push({ value: values[i] });
    }
    return items;
}

// Pushes StackItems onto stack
// Check if the stack if large enough and expands it if needed
// Returns new stack pointer
function PushOntoStack(
    stack: Stack,
    sp: number,
    values: StackItem[],
    increment: boolean = true
): number {
    let currentStackFrame: StackFrame = stack.stackFrames[stack.stackFrames.length - 1];
    for (let i = 0; i < values.length; i++) {
        if (increment) {
            sp++;
            currentStackFrame.size++;
        }

        if (sp > stack.stackItems.length - 1) {
            stack.stackItems.push({ value: 0 });
        }
        stack.stackItems[sp] = values[i];
    }

    if (!CheckStackSize(stack)) {
        throw new Error(
            'Velikost zásobníku přesáhla maximální povolenou hodnotu (' +
                stack.maxSize +
                ')'
        );
    }

    return sp;
}

// Checks if stack size is larger than the maximum permissible value
function CheckStackSize(stack: Stack) {
    if (stack.stackItems.length > stack.maxSize) {
        return false;
    }
    return true;
}

// Checks if SP is not pointing under the stack
function CheckSPInBounds(sp: number) {
    if (sp < 0) {
        return false;
    } else {
        return true;
    }
}

function ChangeCurrentStackFrameSize(stack: Stack, count: number) {
    let currentSF: StackFrame = stack.stackFrames[stack.stackFrames.length - 1];
    currentSF.size += count;
}

function FindBase(stack: Stack, base: number, level: number): number {
    let newBase = base;
    while (level > 0) {
        newBase = stack.stackItems[base].value;
        level--;

        if (newBase == 0 && level != 0) {
            throw new Error(
                'Hledání statické báze došlo do prvního rámce a level není 0 (level je ' +
                    level +
                    ')'
            );
        }
    }
    return newBase;
}

// ------------------------------------------- UTILITY FUNCTIONS

// ------------------------------------------- INSTRUCTION FUNCTIONS

export function DoStep(params: InstructionStepParameters): InstructionStepResult {
    let instruction = params.instructions[params.model.pc];
    let op = instruction.instruction;
    let level = instruction.level;
    let parameter = instruction.parameter;

    let heap = params.model.heap;
    let stack = params.model.stack;

    let inputString = params.input;
    let warnings: string[] = [];
    let isEnd = false;
    let outputString = '';

    switch (op) {
        case InstructionType.LIT:
            params.model.sp = PushOntoStack(
                stack,
                params.model.sp,
                ConvertToStackItems(parameter)
            );
            params.model.pc++;
            break;
        case InstructionType.OPR:
            params.model.sp = PerformOPR(stack, parameter, params.model.sp);
            params.model.pc++;
            break;
        case InstructionType.INT:
            params.model.sp = PerformINT(stack, params.model.sp, parameter);
            params.model.pc++;
            break;
        case InstructionType.JMP:
            if (parameter >= params.instructions.length) {
                throw new Error('Instrukce na indexu ' + parameter + ' je mimo rozsah');
            }
            params.model.pc = parameter;
            break;
        case InstructionType.JMC:
            var operands = GetValuesFromStack(stack, params.model.sp, 1);
            if (operands[0] == 1) {
                if (parameter >= params.instructions.length) {
                    throw new Error(
                        'Instrukce na indexu ' + parameter + ' je mimo rozsah'
                    );
                }
                params.model.pc = parameter;
            } else {
                params.model.pc++;
            }
            break;
        case InstructionType.CAL:
            let newBase = FindBase(stack, params.model.base, level);
            PushOntoStack(
                stack,
                params.model.sp + 1,
                ConvertToStackItems(newBase),
                false
            );
            PushOntoStack(
                stack,
                params.model.sp + 2,
                ConvertToStackItems(params.model.base),
                false
            );
            PushOntoStack(
                stack,
                params.model.sp + 3,
                ConvertToStackItems(params.model.pc),
                false
            );

            if (parameter >= params.instructions.length) {
                throw new Error('Instrukce na indexu ' + parameter + ' je mimo rozsah');
            }

            stack.stackFrames.push({ index: params.model.sp + 1, size: 0 });

            params.model.base = params.model.sp + 1;
            params.model.pc = parameter;
            break;
        case InstructionType.RET:
            if (params.model.base == 0) {
                isEnd = true;
                break;
            }

            var res: number[] = GetValuesFromStack(
                params.model.stack,
                params.model.base + 2,
                2,
                false
            );

            params.model.sp = params.model.base - 1;
            params.model.pc = res[0];
            params.model.base = res[1];
            params.model.stack.stackFrames.pop();
            break;
        case InstructionType.LOD:
            var base = FindBase(stack, params.model.base, level);
            var address = base + parameter;
            params.model.sp = PushOntoStack(
                stack,
                params.model.sp,
                ConvertToStackItems(stack.stackItems[address].value)
            );
            params.model.pc++;
            break;
        case InstructionType.STO:
            var base = FindBase(stack, params.model.base, level);
            var address = base + parameter;
            var res = GetValuesFromStack(stack, params.model.sp, 1);
            stack.stackItems[address].value = res[0];
            params.model.pc++;
            break;
        case InstructionType.WRI:
            var code = GetValuesFromStack(stack, params.model.sp, 1);
            outputString = String.fromCharCode(code[0]);
            params.model.pc++;
            break;
        case InstructionType.REA:
            if (inputString.length == 0) {
                throw new Error('Není co přečíst ze vstupu');
            }

            params.model.sp = PushOntoStack(
                stack,
                params.model.sp,
                ConvertToStackItems(inputString.charCodeAt(0))
            );
            inputString = inputString.slice(1);
            break;
        default:
            throw new Error('Neznámá instrukce ' + InstructionType[op]);
    }

    return {
        warnings: warnings,
        isEnd: isEnd,
        output: outputString,
        inputNextStep: inputString,
    };
}

function PerformINT(stack: Stack, sp: number, count: number) {
    let currentStackFrame: StackFrame = stack.stackFrames[stack.stackFrames.length - 1];
    for (let i = 0; i < count; i++) {
        sp++;
        currentStackFrame.size++;
        if (sp > stack.stackItems.length - 1) {
            stack.stackItems.push({ value: 0 });
        }
    }

    if (!CheckStackSize(stack)) {
        throw new Error(
            'Velikost zásobníku přesáhla maximální povolenou hodnotu (' +
                stack.maxSize +
                ')'
        );
    }

    return sp;
}

function PerformOPR(stack: Stack, operation: number, sp: number): number {
    let e_op = operation as OperationType;
    let operands: number[];
    switch (e_op) {
        case OperationType.U_MINUS:
            stack.stackItems[sp].value *= -1;
            break;
        case OperationType.ADD:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(stack, sp, ConvertToStackItems(operands[0] + operands[1]));
            break;
        case OperationType.SUB:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(stack, sp, ConvertToStackItems(operands[1] - operands[0]));
            break;
        case OperationType.MULT:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(stack, sp, ConvertToStackItems(operands[0] * operands[1]));
            break;
        case OperationType.DIV:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(Math.floor(operands[1] / operands[0]))
            );
            break;
        case OperationType.MOD:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(Math.floor(operands[1] % operands[0]))
            );
            break;
        case OperationType.IS_ODD:
            operands = GetValuesFromStack(stack, sp, 1);
            sp -= 1;
            sp = PushOntoStack(stack, sp, ConvertToStackItems(operands[0] % 2));
            break;
        case OperationType.EQ:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(operands[0] === operands[1] ? 1 : 0)
            );
            break;
        case OperationType.N_EQ:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(operands[0] === operands[1] ? 0 : 1)
            );
            break;
        case OperationType.LESS_THAN:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(operands[1] < operands[0] ? 1 : 0)
            );
            break;
        case OperationType.MORE_EQ_THAN:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(operands[1] >= operands[0] ? 1 : 0)
            );
            break;
        case OperationType.MORE_THAN:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(operands[1] > operands[0] ? 1 : 0)
            );
            break;
        case OperationType.LESS_EQ_THAN:
            operands = GetValuesFromStack(stack, sp, 2);
            sp -= 2;
            sp = PushOntoStack(
                stack,
                sp,
                ConvertToStackItems(operands[1] <= operands[0] ? 1 : 0)
            );
            break;
        default:
            throw new Error('Neznámá OPR operace ' + OperationType[e_op]);
    }

    return sp;
}

// ------------------------------------------- INSTRUCTION FUNCTIONS
