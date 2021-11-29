import {
    DataModel,
    Instruction,
    InstructionStepParameters,
    InstructionStepResult,
} from './model';

export function InitModel(stackMaxSize: number, heapSize: number): DataModel {
    const m: DataModel = {
        pc: 0,
        base: 0,
        sp: 0,

        stack: {
            maxSize: stackMaxSize,
            stackItems: [],
            stackFrames: [],
        },

        heap: {
            size: heapSize,
            blocks: [{ index: 0, size: heapSize, empty: true, values: [] }],
        },
    };

    return m;
}

export function NextStep(pars: InstructionStepParameters): InstructionStepResult {
    pars.model.pc++;

    return {
        isEnd: false,
        wasInputUsed: false,
        output: '',
        warnings: [],
    };
}
