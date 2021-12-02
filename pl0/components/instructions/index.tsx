import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Instruction } from '../../core/model';
import { PreprocessingError } from '../../core/validator';
import { InstructionsLoader } from './InstructionsLoader';

type InstructionProps = {
    instructions: Instruction[];
    validationOK: boolean;
    validationErrors: PreprocessingError[];
    instructionsLoaded: (
        instructions: Instruction[],
        validationOK: boolean,
        validationErrors: PreprocessingError[]
    ) => void;
};

export function Instructions(props: InstructionProps) {
    return (
        <div>
            <InstructionsLoader instructionsLoaded={props.instructionsLoaded} />
        </div>
    );
}
