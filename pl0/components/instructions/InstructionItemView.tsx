import React, { useEffect, useState } from 'react';
import { InstructionsToBeHighlighted } from '../../core/highlighting';
import { Instruction, InstructionType } from '../../core/model';
import { InstructionExplanation } from './InstructionExplanation';

type InstructionItemViewProps = {
    instruction: Instruction;
    hasError: boolean;
    hasBreakpoint: boolean;
    isNext: boolean;
    instructionsToBeHighlighted: Map<number, string>;
};
export function InstructionItemView(props: InstructionItemViewProps) {
    const isHighlighted = props.instructionsToBeHighlighted.has(props.instruction.index);

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
            <td
                style={
                    isHighlighted
                        ? {
                              backgroundColor:
                                  props.instructionsToBeHighlighted.get(
                                      props.instruction.index
                                  ) ?? 'white',
                              color: 'black',
                          }
                        : {}
                }
            >
                {props.instruction.index}
            </td>
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
