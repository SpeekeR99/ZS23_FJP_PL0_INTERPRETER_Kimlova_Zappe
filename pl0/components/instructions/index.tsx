import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Instruction } from '../../core/model';
import { PreprocessingError } from '../../core/validator';
import { Wrapper } from '../general/Wrapper';
import { InstructionsLoader } from './InstructionsLoader';
import { InstructionsTable } from './InstructionsTable';

type InstructionProps = {
    instructions: Instruction[];
    validationOK: boolean;
    validationErrors: PreprocessingError[];
    pc: number;
    instructionsLoaded: (
        instructions: Instruction[],
        validationOK: boolean,
        validationErrors: PreprocessingError[]
    ) => void;
};

export function Instructions(props: InstructionProps) {
    return (
        <Wrapper>
            <div className="panel">
                <InstructionsLoader instructionsLoaded={props.instructionsLoaded} />
                <InstructionsTable instructions={props.instructions} pc={props.pc} />
            </div>
        </Wrapper>
    );
}
