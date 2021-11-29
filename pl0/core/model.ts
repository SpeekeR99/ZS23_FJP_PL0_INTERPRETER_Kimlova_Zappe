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
    // informace o položce ve stacku
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
    INT,
    NEW,
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
