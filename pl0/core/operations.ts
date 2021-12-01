import {
    DataModel,
    InstructionStepParameters,
    InstructionStepResult,
    DoStep,
} from './model';

export function InitModel(stackMaxSize: number, heapSize: number): DataModel {
    const m: DataModel = {
        pc: 0,
        base: 0,
        sp: 2,

        input: '',
        output: '',

        stack: {
            maxSize: stackMaxSize,
            stackItems: [{ value: 0 }, { value: 3 }, { value: 2 }],
            stackFrames: [{ index: 0, size: 3 }],
        },

        heap: {
            size: heapSize,
            blocks: [{ index: 0, size: heapSize, empty: true, values: [] }],
        },
    };

    return m;
}

export function NextStep(pars: InstructionStepParameters): InstructionStepResult {
    //pars.model.pc++;
    var res = DoStep(pars);
    return {
        isEnd: false,
        inputNextStep: pars.input,
        output: '',
        warnings: [],
    };
}
