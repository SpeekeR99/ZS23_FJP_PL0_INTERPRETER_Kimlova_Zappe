import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Heap, HeapBlock, Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import styles from '../../styles/heap.module.css';
import classNames from 'classnames';

type HeapBlockVisualisationProps = {
    heapblock: HeapBlock;
};

export function HeapBlockVisualisation(props: HeapBlockVisualisationProps) {
    function GetHeapCell(i: number) {}

    return (
        <>
            {[...Array(props.heapblock.size)].map((e, i) => {
                return (
                    <div
                        className={`${styles.heapCell} ${
                            props.heapblock.empty
                                ? styles.heapCellEmpty
                                : styles.heapCellFull
                        }`}
                    >
                        {props.heapblock.empty ? 'E' : props.heapblock.values[i]}
                    </div>
                );
            })}
        </>
    );
}
