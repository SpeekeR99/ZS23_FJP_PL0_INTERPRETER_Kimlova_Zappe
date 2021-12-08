import React, { useEffect, useState } from 'react';
import { Instruction, InstructionType } from '../../core/model';
import { InstructionExplanation } from './InstructionExplanation';

type InstructionItemViewProps = {
    instruction: Instruction;
    hasError: boolean;
    hasBreakpoint: boolean;
    isNext: boolean;
};
export function InstructionItemView(props: InstructionItemViewProps) {
    return (
        <tr
            style={
                props.isNext
                    ? {
                          backgroundColor: 'white',
                          borderLeft: '3px solid green',
                      }
                    : {}
            }
        >
            <td>{props.instruction.index}</td>
            <td>{InstructionType[props.instruction.instruction]}</td>
            <td>{props.instruction.level}</td>
            <td>{props.instruction.parameter}</td>
            <td>
                <InstructionExplanation
                    explanationParts={props.instruction.explanationParts ?? []}
                    isNext={props.isNext}
                />
            </td>
        </tr>
    );
}
