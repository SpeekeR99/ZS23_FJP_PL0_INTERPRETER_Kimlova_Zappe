import { Instruction, InstructionType } from './model';

export interface ValidationResult {
    emptyInput: boolean;
    parseOK: boolean;
    validationOK: boolean;
    instructions: Instruction[];
    parseErrors: PreprocessingError[];
    validationErrors: PreprocessingError[];
}

export interface PreprocessingError {
    rowIndex: number;
    error: string;
}

export let stringInstructionMap = new Map<string, InstructionType>([
    ['LIT', InstructionType.LIT],
    ['OPR', InstructionType.OPR],
    ['LOD', InstructionType.LOD],
    ['STO', InstructionType.STO],
    ['CAL', InstructionType.CAL],
    ['INT', InstructionType.INT],
    ['JMP', InstructionType.JMP],
    ['JMC', InstructionType.JMC],
    ['RET', InstructionType.RET],
    ['REA', InstructionType.REA],
    ['WRI', InstructionType.WRI],
    ['NEW', InstructionType.NEW],
    ['DEL', InstructionType.DEL],
    ['LDA', InstructionType.LDA],
    ['STA', InstructionType.STA],
    ['PLD', InstructionType.PLD],
    ['PST', InstructionType.PST],
]);

export let instructionStringMap = new Map<InstructionType, string>([
    [InstructionType.LIT, 'LIT'],
    [InstructionType.OPR, 'OPR'],
    [InstructionType.LOD, 'LOD'],
    [InstructionType.STO, 'STO'],
    [InstructionType.CAL, 'CAL'],
    [InstructionType.INT, 'INT'],
    [InstructionType.JMP, 'JMP'],
    [InstructionType.JMC, 'JMC'],
    [InstructionType.RET, 'RET'],
    [InstructionType.REA, 'REA'],
    [InstructionType.WRI, 'WRI'],
    [InstructionType.NEW, 'NEW'],
    [InstructionType.DEL, 'DEL'],
    [InstructionType.LDA, 'LDA'],
    [InstructionType.STA, 'STA'],
    [InstructionType.PLD, 'PLD'],
    [InstructionType.PST, 'PST'],
]);

export function ParseAndValidate(input: string): ValidationResult {
    let lines = input.split(/\r?\n/);

    if (lines.length == 1 && lines[0] == '') {
        return {
            emptyInput: true,
            validationOK: false,
            parseOK: false,
            parseErrors: [],
            validationErrors: [],
            instructions: [],
        };
    }

    let parseOK = true;
    let validationOK = true;
    let instructions: Instruction[] = [];
    let validationErrors: PreprocessingError[] = [];
    let parseErrors: PreprocessingError[] = [];

    for (let i = 0; i < lines.length; i++) {
        let splitLine = lines[i].split(/\s+/);

        if (splitLine.length < 4) {
            parseOK = false;
            parseErrors.push({
                rowIndex: i,
                error: 'Řádka obsahuje méně než 4 parametry',
            });
            continue;
        } else if (splitLine.length > 4) {
            parseOK = false;
            parseErrors.push({
                rowIndex: i,
                error: 'Řádka obsahuje více než 4 parametry',
            });
            continue;
        }

        let index = Number(splitLine[0]);
        if (index == NaN) {
            parseOK = false;
            parseErrors.push({ rowIndex: i, error: 'Index musí být celé číslo' });
            continue;
        }
        let level = Number(splitLine[2]);
        if (level == NaN) {
            parseOK = false;
            parseErrors.push({ rowIndex: i, error: 'Level (L) musí být celé číslo' });
            continue;
        }
        let parameter = Number(splitLine[3]);
        if (parameter == NaN) {
            parseOK = false;
            parseErrors.push({ rowIndex: i, error: 'Parametr (A) musí být celé číslo' });
            continue;
        }
        let op: string = splitLine[1];
        if (!stringInstructionMap.has(op.toUpperCase())) {
            parseOK = false;
            parseErrors.push({ rowIndex: i, error: 'Neznámá instrukce' });
            continue;
        }

        if (!parseOK) {
            continue;
        }

        let instruction: Instruction = {
            index: index,
            // @ts-ignore
            instruction: stringInstructionMap.get(op.toUpperCase()),
            level: level,
            parameter: parameter,
        };
        instructions.push(instruction);
    }

    for (let i = 0; i < instructions.length; i++) {
        let instruction: Instruction = instructions[i];
        if (instruction.index != i) {
            validationOK = false;
            validationErrors.push({
                rowIndex: i,
                error: 'Index instrukce neodpovídá číslu řádky. Instrukce je nutné číslovat od 0.',
            });
            continue;
        }

        if (instruction.level < 0) {
            validationOK = false;
            validationErrors.push({ rowIndex: i, error: 'Level nemůže být záporný' });
            continue;
        }

        if (instruction.instruction == InstructionType.LIT && instruction.level != 0) {
            validationOK = false;
            validationErrors.push({ rowIndex: i, error: 'LIT musí mít level 0' });
            continue;
        } else if (instruction.instruction == InstructionType.OPR) {
            if (instruction.level != 0) {
                validationOK = false;
                validationErrors.push({ rowIndex: i, error: 'OPR musí mít level 0' });
                continue;
            } else if (instruction.parameter < 1 || instruction.parameter > 13) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'OPR musí mít parametr (A) mezi 0 a 13',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.CAL) {
            validationOK = false;
            validationErrors.push({
                rowIndex: i,
                error: 'CAL musí skočit na adresu >= 0',
            });
            continue;
        } else if (instruction.instruction == InstructionType.JMP) {
            if (instruction.level != 0) {
                validationOK = false;
                validationErrors.push({ rowIndex: i, error: 'JMP musí mít level 0' });
                continue;
            } else if (instruction.parameter == 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'JMP musí mít parametr (A) >= 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.JMC) {
            if (instruction.level != 0) {
                validationOK = false;
                validationErrors.push({ rowIndex: i, error: 'JMC musí mít level 0' });
                continue;
            } else if (instruction.parameter == 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'JMC musí mít parametr (A) >= 0',
                });
                continue;
            }
        } else if (
            instruction.instruction == InstructionType.INT &&
            instruction.level != 0
        ) {
            validationOK = false;
            validationErrors.push({ rowIndex: i, error: 'INT musí mít level 0' });
            continue;
        } else if (instruction.instruction == InstructionType.RET) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'RET musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.REA) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'REA musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.WRI) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'WRI musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.NEW) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'NEW musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.DEL) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'DEL musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.LDA) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'LDA musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.STA) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'STA musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.PLD) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'PLD musí mít level i parametr (A) 0',
                });
                continue;
            }
        } else if (instruction.instruction == InstructionType.PST) {
            if (instruction.level != 0 || instruction.parameter != 0) {
                validationOK = false;
                validationErrors.push({
                    rowIndex: i,
                    error: 'PST musí mít level i parametr (A) 0',
                });
                continue;
            }
        }
    }

    if (!parseOK) {
        instructions = [];
    }

    console.log(parseErrors);
    console.log(validationErrors);

    return {
        parseOK: parseOK,
        validationOK: validationOK,
        validationErrors: validationErrors,
        parseErrors: parseErrors,
        instructions: instructions,
    };
}
