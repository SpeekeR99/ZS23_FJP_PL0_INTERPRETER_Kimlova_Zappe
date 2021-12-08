import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Instruction } from '../../core/model';
import { InstructionItemView } from './InstructionItemView';
import styles from '../../styles/instructions.module.css';

type InstructionsTableProps = {
    instructions: Instruction[];
    pc: number;
    instructionsToBeHighlighted: Map<number, string>;
};
export function InstructionsTable(props: InstructionsTableProps) {
    return (
        <Table className={styles.instructionsTable}>
            <thead>
                <tr>
                    <th style={{ width: '35px' }}></th>
                    <th style={{ width: '50px' }}>Instrukce</th>
                    <th style={{ width: '35px' }}>Level</th>
                    <th style={{ width: '35px' }}>Par</th>
                    <th>Popis</th>
                </tr>
            </thead>
            <tbody>
                {props.instructions?.map((i, index) => (
                    <InstructionItemView
                        key={index}
                        instruction={i}
                        hasBreakpoint={false}
                        hasError={false}
                        isNext={index == props.pc}
                        instructionsToBeHighlighted={props.instructionsToBeHighlighted}
                    />
                ))}
            </tbody>
        </Table>
    );
}
