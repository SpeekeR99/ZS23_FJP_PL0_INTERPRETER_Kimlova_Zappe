import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Heap, HeapBlock, Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import styles from '../../styles/heap.module.css';
import classNames from 'classnames';

type HeapBlockVisualisationProps = {
    heapblock: HeapBlock;
    heapToBeHighlighted: Map<number, string>;
};

export function HeapBlockVisualisation(props: HeapBlockVisualisationProps) {
    function GetHeapCell(i: number) {}

    return (
        <>
            {[...Array(props.heapblock.size)].map((e, i) => {
                const index = props.heapblock.index + i;
                const highlightedColor: string | null = props.heapToBeHighlighted.has(
                    index
                )
                    ? props.heapToBeHighlighted.get(index) ?? null
                    : null;
                return (
                    <div
                        key={index}
                        className={`${styles.heapCell} ${
                            props.heapblock.empty
                                ? styles.heapCellEmpty
                                : styles.heapCellFull
                        }`}
                        style={
                            highlightedColor
                                ? {
                                      backgroundColor: highlightedColor,
                                      color: 'black',
                                  }
                                : {}
                        }
                        title={
                            'index: ' +
                            index.toString() +
                            '\nhodnota: ' +
                            (props.heapblock.empty
                                ? '-- nealokováno --'
                                : props.heapblock.values[i].toString())
                        }
                    >
                        {props.heapblock.empty ? '' : props.heapblock.values[i]}
                    </div>
                );
            })}
        </>
    );
}
