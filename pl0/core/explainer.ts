import { basename } from 'path/posix';
import {
    Instruction,
    InstructionType,
    InstructionStepParameters,
    Stack,
    StackItem,
    StackFrame,
    Heap,
    HeapBlock,
    OperationType,
} from './model';

// ------------------------------------------- INTERFACES

export interface Explanation {
    message: string;
    placeholders: Placeholder[];
}

export interface Placeholder {
    // What placeholder in message to replace
    placeholder: string;
    // Value to replace it with
    value: number;

    // Which values to highlight in stack
    stack: number[];
    // Which values to highlight in heap
    heap: number[];
    // Which instructions to highlight
    instructions: number[];

    //base: boolean;

    // Whether or not to highlight the LEVEL in instruction GUI
    level: boolean;
    // Whether or not to highlight the PARAMETER in instruction GUI
    parameter: boolean;
    // Whether or not to highlight the input field
    output: boolean;
    // Whether or not to highlight the output field
    input: boolean;
    // How to highlight - BOLD or BACKGROUND
    highlightType: HighlightType;
}

export enum HighlightType {
    BOLD,
    BACKGROUND,
}

// ------------------------------------------- INTERFACES

// ------------------------------------------- HEAP UTILITY FUNCTIONS

function AllocateBlockFirstFitDummy(heap: Heap, count: number): number {
    for (let i = 0; i < heap.blocks.length; i++) {
        if (!heap.blocks[i].empty) {
            continue;
        }
        if (heap.blocks[i].size > count) {
            return heap.blocks[i].index;
        } else if (heap.blocks[i].size == count) {
            return heap.blocks[i].index;
        }
    }
    // No empty space found
    return -1;
}

function FreeHeapBlockDummy(heap: Heap, address: number): HeapBlock {
    // Find the address
    for (let i = 0; i < heap.blocks.length; i++) {
        if (heap.blocks[i].index == address && !heap.blocks[i].empty) {
            // The block to deallocate
            return heap.blocks[i];
        }
    }

    // do warning, not fatal
    return { size: -1, index: address, empty: true, values: [] };
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
    if (heapBlock.empty) {
        return NaN;
    } else {
        return address;
    }
}

function GetValueFromHeap(heap: Heap, address: number): number {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (heapBlock.empty) {
        return NaN;
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
        /*if (decrementCurrentFrame) {
            stack.stackFrames[stack.stackFrames.length - 1].size--;
        }*/
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

function FindBaseDummy(stack: Stack, base: number, level: number): number[] {
    let newBase = base;
    let levels = [base];
    while (level > 0) {
        newBase = stack.stackItems[newBase].value;
        level--;
        levels.push(newBase);
        if (newBase == 0 && level != 0) {
            return [-1];
        }
    }

    return levels;
}

// ------------------------------------------- STACK UTILITY FUNCTIONS

// ------------------------------------------- EXPLAINER

export function ExplainInstruction(params: InstructionStepParameters): Explanation {
    let instruction = params.instructions[params.model.pc];
    let op = instruction.instruction;
    let level = instruction.level;
    let parameter = instruction.parameter;

    let heap = params.model.heap;
    let stack = params.model.stack;

    let explanation: Explanation = {
        message: '',
        placeholders: [],
    };

    switch (op) {
        case InstructionType.LIT:
            explanation.message = 'Přidá hodnotu %1 na vrchol zásobníku';
            explanation.placeholders.push({
                placeholder: '1',
                value: parameter,
                heap: [],
                stack: [],
                instructions: [],
                level: false,
                parameter: true,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case InstructionType.OPR:
            explanation = ExplainOPR(stack, parameter, params.model.sp);
            break;
        case InstructionType.INT:
            explanation.message = 'Zvýší vrchol zásobníku o %1';
            explanation.placeholders.push({
                placeholder: '1',
                value: parameter,
                heap: [],
                stack: [],
                instructions: [],
                level: false,
                parameter: true,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case InstructionType.JMP:
            explanation.placeholders.push({
                placeholder: '1',
                value: parameter,
                heap: [],
                stack: [],
                instructions: [],
                level: false,
                parameter: true,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            if (parameter >= params.instructions.length) {
                explanation.message = 'Skočí na instrukci %1, která neexistuje';
            } else {
                explanation.message = 'Skočí na instrukci %1';
                explanation.placeholders[0].instructions.push(parameter);
            }
            break;
        case InstructionType.JMC:
            if (stack.stackItems[params.model.sp].value == 0) {
                if (parameter >= params.instructions.length) {
                    explanation.message =
                        'Hodnota na vrcholu zásobníku je %1, ale skok povede na neexistující instrukci (%2)';
                    explanation.placeholders.push({
                        placeholder: '1',
                        value: stack.stackItems[params.model.sp].value,
                        heap: [],
                        stack: [params.model.sp],
                        instructions: [],
                        level: false,
                        parameter: false,
                        output: false,
                        input: false,
                        highlightType: HighlightType.BOLD,
                    });
                    explanation.placeholders.push({
                        placeholder: '2',
                        value: parameter,
                        heap: [],
                        stack: [],
                        instructions: [],
                        level: false,
                        parameter: true,
                        output: false,
                        input: false,
                        highlightType: HighlightType.BOLD,
                    });
                } else {
                    explanation.message =
                        'Hodnota na vrcholu zásobníku je %1, bude proveden skok na instrukci %2';
                    explanation.placeholders.push({
                        placeholder: '1',
                        value: stack.stackItems[params.model.sp].value,
                        heap: [],
                        stack: [params.model.sp],
                        instructions: [],
                        level: false,
                        parameter: false,
                        output: false,
                        input: false,
                        highlightType: HighlightType.BOLD,
                    });
                    explanation.placeholders.push({
                        placeholder: '2',
                        value: parameter,
                        heap: [],
                        stack: [params.model.sp],
                        instructions: [parameter],
                        level: false,
                        parameter: false,
                        output: false,
                        input: false,
                        highlightType: HighlightType.BOLD,
                    });
                }
                explanation.message;
            } else {
                explanation.message =
                    'Hodnota na vrcholu zásobníku je %1, skok nebude proveden';
                explanation.placeholders.push({
                    placeholder: '1',
                    value: stack.stackItems[params.model.sp].value,
                    heap: [],
                    stack: [params.model.sp],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BOLD,
                });
            }
            break;
        case InstructionType.CAL:
            if (parameter >= params.instructions.length) {
                explanation.message = 'Instrukce %1 je mimo rozsah';
                explanation.placeholders.push({
                    placeholder: '1',
                    value: parameter,
                    heap: [],
                    stack: [],
                    instructions: [],
                    level: false,
                    parameter: true,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BOLD,
                });
                break;
            }

            let levels = FindBaseDummy(stack, params.model.base, level);
            if (levels[0] == -1) {
                explanation.message =
                    'Level je příliš velký - statická báze by musela být pod prvním rámcem';
                break;
            }
            explanation.message =
                'Skočí na instrukci %1, vytvoří rámec s následující instrukcí (' +
                (params.model.pc + 1) +
                '), dynamickou bází (%2) a statickou bází (%3)';
            explanation.placeholders.push({
                placeholder: '1',
                value: parameter,
                heap: [],
                stack: [],
                instructions: [parameter],
                level: false,
                parameter: true,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '2',
                value: params.model.base,
                heap: [],
                stack: [params.model.base],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '3',
                value: levels[levels.length - 1],
                heap: [],
                stack: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            for (let i = 0; i < levels.length; i++) {
                explanation.placeholders[2].stack.push(levels[i]);
            }
            break;
        case InstructionType.RET:
            if (params.model.base == 0) {
                explanation.message = 'Konec programu';
                break;
            }

            explanation.message =
                'Odstraní rámec, skočí na instrukci %1, nastaví bázi na dynamickou bázi %2, SP=%3';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[params.model.base + 2].value,
                heap: [],
                stack: [params.model.base + 2],
                instructions: [stack.stackItems[params.model.base + 2].value],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[params.model.base + 1].value,
                heap: [],
                stack: [params.model.base + 1],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '3',
                value: params.model.base - 1,
                heap: [],
                stack: [params.model.base - 1],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case InstructionType.LOD:
            let bases = FindBaseDummy(stack, params.model.base, level);
            if (bases[0] == -1) {
                explanation.message =
                    'Level je příliš velký - statická báze by musela být pod prvním rámcem';
                break;
            }

            var address = bases[bases.length - 1] + parameter;

            explanation.message =
                'Načte hodnotu z levelu %1 adresy %2 zásobníku (index ' +
                address +
                ', hodnota ' +
                stack.stackItems[address].value +
                ') a přidá ji na vrchol';
            explanation.placeholders.push({
                placeholder: '1',
                value: level,
                heap: [],
                stack: [],
                instructions: [],
                level: true,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            for (let i = 0; i < bases.length; i++) {
                explanation.placeholders[0].stack.push(bases[i]);
            }
            explanation.placeholders.push({
                placeholder: '2',
                value: parameter,
                heap: [],
                stack: [address],
                instructions: [],
                level: false,
                parameter: true,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            break;
        case InstructionType.STO:
            bases = FindBaseDummy(stack, params.model.base, level);
            if (bases[0] == -1) {
                explanation.message =
                    'Level je příliš velký - statická báze by musela být pod prvním rámcem';
                break;
            }

            var address = bases[bases.length - 1] + parameter;

            explanation.message =
                'Uloží hodnotu na vrcholu zásobníku (%1) na level %2 adresu %3 zásobníku (index ' +
                address +
                ')';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[params.model.sp].value,
                heap: [],
                stack: [params.model.sp],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '2',
                value: level,
                heap: [],
                stack: [],
                instructions: [],
                level: true,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            for (let i = 0; i < bases.length; i++) {
                explanation.placeholders[1].stack.push(bases[i]);
            }
            explanation.placeholders.push({
                placeholder: '3',
                value: parameter,
                heap: [],
                stack: [address],
                instructions: [],
                level: false,
                parameter: true,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case InstructionType.WRI:
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[params.model.sp].value,
                heap: [],
                stack: [params.model.sp],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (
                stack.stackItems[params.model.sp].value < 0 ||
                stack.stackItems[params.model.sp].value > 255
            ) {
                explanation.message = 'Hodnota na vrcholu zásobníku není unsigned byte';
            } else {
                explanation.message =
                    'Bude vypsána hodnota na vrcholu zásobníku (%1) jako ASCII ' +
                    String.fromCharCode(stack.stackItems[params.model.sp].value);
            }
            break;
        case InstructionType.REA:
            if (params.input.length == 0) {
                explanation.message =
                    'Není co přečíct ze vstupu - doplňte vstup, jinak se interpret ukončí';
            } else {
                explanation.message =
                    'Na vrchol bude přidán znak ' +
                    params.input.at(0) +
                    ' (' +
                    params.input.charCodeAt(0) +
                    ')';
            }
            break;
        case InstructionType.NEW:
            var count = stack.stackItems[params.model.sp].value;
            explanation.placeholders.push({
                placeholder: '1',
                value: count,
                heap: [],
                stack: [params.model.sp],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (count <= 0 || count > params.model.heap.size) {
                explanation.message =
                    'Pokus o alokaci %1 buněk haldy, což není validní počet - na vrchol se přidá -1';
            } else {
                let res = AllocateBlockFirstFitDummy(heap, count);
                if (res == -1) {
                    explanation.message =
                        'Pokus o alokaci %1 buněk haldy, ale není dostatečně velký volný blok - na vrchol se přidá -1';
                } else {
                    explanation.message =
                        'Alokace %1 buněk haldy od indexu %2, na vrchol se přidá %2';
                    explanation.placeholders.push({
                        placeholder: '2',
                        value: res,
                        heap: [],
                        stack: [],
                        instructions: [],
                        level: false,
                        parameter: false,
                        output: false,
                        input: false,
                        highlightType: HighlightType.BACKGROUND,
                    });
                    for (let i = 0; i < count; i++) {
                        explanation.placeholders[1].heap.push(res + i);
                    }
                }
            }
            break;
        case InstructionType.DEL:
            var addr = stack.stackItems[params.model.sp].value;
            let block = FreeHeapBlockDummy(heap, addr);

            if (block.index == -1) {
                explanation.message = 'Na indexu %1 nezačíná žádný alokovaný blok';
                explanation.placeholders.push({
                    placeholder: '1',
                    value: addr,
                    heap: [],
                    stack: [params.model.sp],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BOLD,
                });
            } else {
                explanation.message = 'Dealokace %1 buněk od adresy %2';
                explanation.placeholders.push({
                    placeholder: '1',
                    value: block.size,
                    heap: [],
                    stack: [],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BOLD,
                });
                explanation.placeholders.push({
                    placeholder: '2',
                    value: block.index,
                    heap: [],
                    stack: [],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BACKGROUND,
                });
                for (let i = 0; i < block.size; i++) {
                    explanation.placeholders[1].heap.push(block.index + i);
                }
            }

            break;
        case InstructionType.LDA:
            var addr = stack.stackItems[params.model.sp].value;
            explanation.placeholders.push({
                placeholder: '1',
                value: addr,
                heap: [],
                stack: [params.model.sp],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            if (addr < 0 || addr >= heap.size) {
                explanation.message = 'Adresa %1 je mimo rozsah haldy';
            } else {
                let res = GetValueFromHeap(heap, addr);
                if (Number.isNaN(res)) {
                    explanation.message = 'Adresa %1 není alokovaná';
                    explanation.placeholders[0].highlightType = HighlightType.BACKGROUND;
                    explanation.placeholders[0].heap.push(addr);
                } else {
                    explanation.message =
                        'Na vrchol zásobníku se přidá hodnota z adresy %1 v haldě';
                    explanation.placeholders[0].highlightType = HighlightType.BACKGROUND;
                    explanation.placeholders[0].heap.push(addr);
                }
            }
            break;
        case InstructionType.STA:
            if (params.model.sp - 1 < 0) {
                explanation.message = 'Přístup na zásobník indexem < 0';
                return explanation;
            }

            var addr = stack.stackItems[params.model.sp - 1].value;
            var val = stack.stackItems[params.model.sp].value;
            var temp = PutValueOnHeap(heap, addr, val);

            if (Number.isNaN(temp)) {
                explanation.message = 'Přístup do paměti na nealokovanou adresu %1';
                explanation.placeholders.push({
                    placeholder: '1',
                    value: addr,
                    heap: [addr],
                    stack: [params.model.sp - 1],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BACKGROUND,
                });
            } else {
                explanation.message = 'Uložení hodnoty %1 na adresu %2 v haldě';
                explanation.placeholders.push({
                    placeholder: '1',
                    value: val,
                    heap: [],
                    stack: [params.model.sp],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BOLD,
                });
                explanation.placeholders.push({
                    placeholder: '2',
                    value: addr,
                    heap: [addr],
                    stack: [params.model.sp - 1],
                    instructions: [],
                    level: false,
                    parameter: false,
                    output: false,
                    input: false,
                    highlightType: HighlightType.BACKGROUND,
                });
            }
            break;
        case InstructionType.PLD:
            var values: number[] = GetValuesFromStack(stack, params.model.sp, 2);
            bases = FindBaseDummy(stack, params.model.base, values[1]);
            if (bases[0] == -1) {
                explanation.message =
                    'Level je příliš velký - statická báze by musela být pod prvním rámcem';
                break;
            }

            explanation.message =
                'Načte hodnotu z levelu %1 adresy %2 zásobníku (index %3' +
                ', hodnota ' +
                stack.stackItems[bases[bases.length - 1] + values[0]].value +
                ') a přidá ji na vrchol';

            explanation.placeholders.push({
                placeholder: '1',
                value: values[1],
                heap: [],
                stack: [params.model.sp - 1],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            for (let i = 0; i < bases.length; i++) {
                explanation.placeholders[0].stack.push(bases[i]);
            }
            explanation.placeholders.push({
                placeholder: '2',
                value: values[0],
                heap: [],
                stack: [params.model.sp],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '3',
                value: stack.stackItems[bases[bases.length - 1] + values[0]].value,
                heap: [],
                stack: [bases[bases.length - 1] + values[0]],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case InstructionType.PST: // TODO PST
            var values: number[] = GetValuesFromStack(stack, params.model.sp, 3);
            bases = FindBaseDummy(stack, params.model.base, values[1]);
            if (bases[0] == -1) {
                explanation.message =
                    'Level je příliš velký - statická báze by musela být pod prvním rámcem';
                break;
            }

            explanation.message =
                'Uloží hodnotu %1 na level %2 adresu %3 zásobníku (index %4)';

            explanation.placeholders.push({
                placeholder: '1',
                value: values[2],
                heap: [],
                stack: [params.model.sp - 2],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '2',
                value: values[1],
                heap: [],
                stack: [params.model.sp - 1],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            for (let i = 0; i < bases.length; i++) {
                explanation.placeholders[1].stack.push(bases[i]);
            }
            explanation.placeholders.push({
                placeholder: '3',
                value: values[0],
                heap: [],
                stack: [params.model.sp],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            explanation.placeholders.push({
                placeholder: '4',
                value: bases[bases.length - 1] + values[0],
                heap: [],
                stack: [bases[bases.length - 1] + values[0]],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            break;
        default:
            throw new Error('Neznámá instrukce ' + InstructionType[op]);
    }

    if (params.model.pc + 1 >= params.instructions.length) {
        if (op == InstructionType.JMC) {
            if (stack.stackItems[params.model.sp].value != 0) {
                explanation.message =
                    'Hodnota na vrcholu zásobníku je %1, skok nebude proveden a následující instrukce neexistuje';
            }
        } else {
            explanation = { placeholders: [], message: 'Další instrukce neexistuje' };
        }
    }

    return explanation;
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

function ExplainOPR(stack: Stack, operation: number, sp: number): Explanation {
    let e_op = operation as OperationType;
    let explanation: Explanation = { message: '', placeholders: [] };

    if (sp < 0) {
        explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
        return explanation;
    }

    switch (e_op) {
        case OperationType.U_MINUS:
            explanation.message =
                'Hodnota na vrcholu zásobníku se přenásobí -1 (-1 * %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.ADD:
            explanation.message =
                'První dvě hodnoty na vrcholu zásobníku se sečtou (%2 + %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.SUB:
            explanation.message =
                'První dvě hodnoty na vrcholu zásobníku se odečtou (%2 - %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.MULT:
            explanation.message =
                'První dvě hodnoty na vrcholu zásobníku se vynásobí (%2 * %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.DIV:
            explanation.message =
                'První dvě hodnoty na vrcholu zásobníku se podělí (%2 / %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
            break;
        case OperationType.MOD:
            explanation.message =
                'Modulo prvních dvou hodnot na vrcholu zásobníku (%2 mod %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
            break;
        case OperationType.IS_ODD:
            explanation.message = 'Test lichosti hodnoty na vrcholu zásobníku (%1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.EQ:
            explanation.message =
                'Test rovnosti prvních dvou hodnot na vrcholu zásobníku (%2 == %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.N_EQ:
            explanation.message =
                'Test nerovnosti prvních dvou hodnot na vrcholu zásobníku (%2 != %1)';
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.LESS_THAN:
            explanation.message =
                "Test 'menší než' prvních dvou hodnot na vrcholu zásobníku (%2 < %1)";
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.MORE_EQ_THAN:
            explanation.message =
                "Test 'větší nebo rovno' prvních dvou hodnot na vrcholu zásobníku (%2 >= %1)";
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.MORE_THAN:
            explanation.message =
                "Test 'větší než' prvních dvou hodnot na vrcholu zásobníku (%2 > %1)";
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'CHYBA: Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        case OperationType.LESS_EQ_THAN:
            explanation.message =
                "Test 'menší nebo rovno' prvních dvou hodnot na vrcholu zásobníku (%2 <= %1)";
            explanation.placeholders.push({
                placeholder: '1',
                value: stack.stackItems[sp].value,
                stack: [sp],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });

            if (sp - 1 < 0) {
                explanation.message = 'Přístup na zásobník indexem < 0';
                explanation.placeholders = [];
                return explanation;
            }

            explanation.placeholders.push({
                placeholder: '2',
                value: stack.stackItems[sp - 1].value,
                stack: [sp - 1],
                heap: [],
                instructions: [],
                level: false,
                parameter: false,
                output: false,
                input: false,
                highlightType: HighlightType.BOLD,
            });
            break;
        default:
            explanation.message = 'Neznámá operace';
    }

    return explanation;
}
