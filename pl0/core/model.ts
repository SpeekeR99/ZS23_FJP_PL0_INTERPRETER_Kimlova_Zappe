import { ExplanationMessagePart } from './highlighting';
import { Explanation } from './explainer';
// ------------------------------------------- INTERFACES

import { BlockList } from 'net';

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
    NEW,
    DEL,
    LDA,
    STA,
    PLD,
    PST,
}

export enum OperationType {
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
    explanationParts: ExplanationMessagePart[] | null;
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

export enum EmulationState {
    NOT_STARTED,
    PAUSED,
    FINISHED,
    ERROR,
}

// ------------------------------------------- INTERFACES

// ------------------------------------------- HEAP UTILITY FUNCTIONS

function CreateArray(size: number, value: number = 0): number[] {
    let arr: number[] = [];
    for (let i = 0; i < size; i++) {
        arr.push(value);
    }

    return arr;
}

function AllocateBlockFirstFit(heap: Heap, count: number): number {
    for (let i = 0; i < heap.blocks.length; i++) {
        if (!heap.blocks[i].empty) {
            continue;
        }

        if (heap.blocks[i].size > count) {
            let blocksAfter = heap.blocks.slice(i + 1);
            let blocksBefore = heap.blocks.slice(0, i);
            let fullBlock: HeapBlock = {
                empty: false,
                index: heap.blocks[i].index,
                size: count,
                values: CreateArray(count),
            };
            let emptyBlock: HeapBlock = {
                empty: true,
                index: heap.blocks[i].index + count,
                size: heap.blocks[i].size - count,
                values: CreateArray(heap.blocks[i].size - count),
            };
            blocksBefore.push(fullBlock);
            blocksBefore.push(emptyBlock);
            heap.blocks = blocksBefore.concat(blocksAfter);

            return fullBlock.index;
        } else if (heap.blocks[i].size == count) {
            // Trivial case - the first block is the exact size needed
            heap.blocks[i].empty = false;
            return heap.blocks[i].index;
        }
    }

    // No empty space found
    return -1;
}

function FreeHeapBlock(heap: Heap, address: number) {
    // Find the address
    for (let i = 0; i < heap.blocks.length; i++) {
        if (heap.blocks[i].index == address && !heap.blocks[i].empty) {
            // The block to deallocate
            let targetBlock = heap.blocks[i];
            targetBlock.empty = true;

            // @ts-ignore
            let leftBlocks;
            // @ts-ignore
            let rightBlocks;

            // See if the block on the left is empty - if yes, merge it
            if (i != 0) {
                if (heap.blocks[i - 1].empty) {
                    let leftBlock = heap.blocks[i - 1];
                    leftBlocks = heap.blocks.slice(0, i);
                    leftBlocks.pop();
                    targetBlock.size += leftBlock.size;
                    targetBlock.index = leftBlock.index;
                } else {
                    leftBlocks = heap.blocks.slice(0, i);
                }
            } else {
                leftBlocks = [];
            }

            if (i != heap.blocks.length - 1) {
                if (heap.blocks[i + 1].empty) {
                    let rightBlock = heap.blocks[i + 1];
                    rightBlocks = heap.blocks.slice(i + 1);
                    rightBlocks = rightBlocks.reverse();
                    rightBlocks.pop();
                    rightBlocks = rightBlocks.reverse();
                    targetBlock.size += rightBlock.size;
                } else {
                    rightBlocks = heap.blocks.slice(i + 1);
                }
            } else {
                rightBlocks = [];
            }

            let resultBlocks: HeapBlock[] = [];

            if (i != 0) {
                // @ts-ignore
                leftBlocks.push(targetBlock);
                // @ts-ignore
                resultBlocks = resultBlocks.concat(leftBlocks);
            } else {
                resultBlocks.push(targetBlock);
            }

            if (i != heap.blocks.length - 1) {
                // @ts-ignore
                resultBlocks = resultBlocks.concat(rightBlocks);
            }

            heap.blocks = resultBlocks;
            return;
        }
    }

    // do warning, not fatal
    throw new Error('Na adrese ' + address + ' nezačíná žádný alokovaný blok paměti');
}

function FindHeapBlockGivenAddress(heap: Heap, address: number): HeapBlock {
    for (let i = 0; i < heap.blocks.length; i++) {
        let heapBlock = heap.blocks[i];
        if (
            heapBlock.index <= address &&
            address <= heapBlock.index + heapBlock.size - 1
        ) {
            return heapBlock;
        }
    }

    return { size: 0, values: [], empty: true, index: -1 };
}

function PutValueOnHeap(heap: Heap, address: number, value: number) {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (heapBlock.index == -1) {
        throw new Error(
            'Přístup do paměti na nedefinovaném indexu ' +
                address +
                ', velikost paměti = ' +
                heap.size
        );
    } else if (heapBlock.empty) {
        throw new Error('Přístup do nealokované paměti indexem ' + address);
    } else {
        heapBlock.values[address - heapBlock.index] = value;
    }
}

function GetValueFromHeap(heap: Heap, address: number): number {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (heapBlock.index == -1) {
        throw new Error(
            'Přístup do paměti na nedefinovaném indexu ' +
                address +
                ', velikost paměti = ' +
                heap.size
        );
    } else if (heapBlock.empty) {
        throw new Error('Přístup do nealokované paměti indexem ' + address);
    } else {
        return heapBlock.values[address - heapBlock.index];
    }
}

// ------------------------------------------- HEAP UTILITY FUNCTIONS

// ------------------------------------------- STACK UTILITY FUNCTIONS

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

function GetValueFromStack(stack: Stack, index: number): number {
    if (index >= stack.stackItems.length) {
        while (stack.stackItems.length - 1 != index) {
            stack.stackItems.push({ value: 0 });
            if (stack.stackItems.length > stack.maxSize) {
                throw new Error('Překročena maximální velikost zásobníku');
            }
        }
        return 0;
    } else {
        return stack.stackItems[index].value;
    }
}

function PutOntoStack(stack: Stack, index: number, value: number) {
    if (index >= stack.stackItems.length) {
        while (stack.stackItems.length - 1 != index) {
            stack.stackItems.push({ value: 0 });
        }
    }

    if (index < 0) {
        throw new Error('Pokus o vložení na záporný index zásobníku');
    }

    if (stack.stackItems.length > stack.maxSize) {
        throw new Error('Překročena maximální velikost zásobníku');
    }

    stack.stackItems[index].value = value;
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
        newBase = stack.stackItems[newBase].value;
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

// ------------------------------------------- STACK UTILITY FUNCTIONS

// ------------------------------------------- INSTRUCTION FUNCTIONS

export function DoStep(params: InstructionStepParameters): InstructionStepResult {
    if (params.model.pc >= params.instructions.length) {
        throw new Error('Neexistující instrukce');
    }

    let instruction = params.instructions[params.model.pc];
    let op = instruction.instruction;
    let level = instruction.level;
    let parameter = instruction.parameter;

    let heap = params.model.heap;
    let stack = params.model.stack;

    let inputString = params.input;
    let warnings: string[] = [];
    let isEnd = false;

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
            params.model.sp--;
            if (operands[0] == 0) {
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
                ConvertToStackItems(params.model.pc + 1),
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
                ConvertToStackItems(GetValueFromStack(stack, address))
            );
            params.model.pc++;
            break;
        case InstructionType.STO:
            var base = FindBase(stack, params.model.base, level);
            var address = base + parameter;
            var res = GetValuesFromStack(stack, params.model.sp, 1);
            PutOntoStack(stack, address, res[0]);
            params.model.sp--;
            params.model.pc++;
            break;
        case InstructionType.WRI:
            var code = GetValuesFromStack(stack, params.model.sp, 1);

            if (code[0] < 0 || code[0] > 255) {
                throw new Error('Na vrcholu zásobníku je hodnota mimo interval <0, 255>');
            }

            params.model.output += String.fromCharCode(code[0]);
            inputString = inputString.substring(1);
            params.model.sp--;
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
            params.model.pc++;
            break;
        case InstructionType.NEW:
            var count = GetValuesFromStack(stack, params.model.sp, 1);
            params.model.sp--;

            if (count[0] <= 0 || count[0] > params.model.heap.size) {
                params.model.sp = PushOntoStack(
                    stack,
                    params.model.sp,
                    ConvertToStackItems(-1)
                );
            } else {
                params.model.sp = PushOntoStack(
                    stack,
                    params.model.sp,
                    ConvertToStackItems(AllocateBlockFirstFit(heap, count[0]))
                );
            }
            params.model.pc++;
            break;
        case InstructionType.DEL:
            var addr = GetValuesFromStack(stack, params.model.sp, 1);
            params.model.sp--;
            params.model.pc++;
            FreeHeapBlock(heap, addr[0]);
            break;
        case InstructionType.LDA:
            var addr: number[] = GetValuesFromStack(stack, params.model.sp, 1);
            params.model.sp--;
            params.model.sp = PushOntoStack(
                stack,
                params.model.sp,
                ConvertToStackItems(GetValueFromHeap(heap, addr[0]))
            );
            params.model.pc++;
            break;
        case InstructionType.STA:
            var addr: number[] = GetValuesFromStack(stack, params.model.sp, 2);
            params.model.sp -= 2;
            PutValueOnHeap(heap, addr[1], addr[0]);
            params.model.pc++;
            break;
        case InstructionType.PLD:
            var values: number[] = GetValuesFromStack(stack, params.model.sp, 2);
            params.model.sp -= 2;
            var base = FindBase(stack, params.model.base, values[1]);
            params.model.sp = PushOntoStack(
                stack,
                params.model.sp,
                ConvertToStackItems(GetValueFromStack(stack, base + values[0]))
            );
            params.model.pc++;
            break;
        case InstructionType.PST:
            var values: number[] = GetValuesFromStack(stack, params.model.sp, 3);
            params.model.sp -= 3;
            var base = FindBase(stack, params.model.base, values[1]);
            PutOntoStack(stack, base + values[0], values[2]);
            params.model.pc++;
            break;
        default:
            throw new Error('Neznámá instrukce ' + InstructionType[op]);
    }

    if (params.model.pc >= params.instructions.length) {
        isEnd = true;
    }

    return {
        warnings: warnings,
        isEnd: isEnd,
        output: params.model.output,
        inputNextStep: inputString,
    };
}

function PerformINT(stack: Stack, sp: number, count: number) {
    let currentStackFrame: StackFrame = stack.stackFrames[stack.stackFrames.length - 1];
    if (count >= 0) {
        sp += count;
        currentStackFrame.size += count;
        let toAdd = sp - stack.stackItems.length + 1;
        for (let i = 0; i < toAdd; i++) {
            stack.stackItems.push({ value: 0 });
        }
    } else {
        if (sp + count < -1) {
            throw new Error('Pokus o snížení SP na -2');
        } else if (sp + count < currentStackFrame.index) {
            throw new Error('Pokus o snížení SP pod aktuální stack frame');
        } else {
            sp += count;
            currentStackFrame.size += count;
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
