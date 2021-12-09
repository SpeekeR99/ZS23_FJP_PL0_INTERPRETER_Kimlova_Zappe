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
        sp: -1,

        input: '',
        output: '',

        stack: {
            maxSize: stackMaxSize,
            stackItems: [{ value: 0 }, { value: 0 }, { value: 0 }],
            stackFrames: [{ index: 0, size: 0 }],
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
        isEnd: res.isEnd,
        inputNextStep: res.inputNextStep,
        output: res.output,
        warnings: res.warnings,
    };
}
