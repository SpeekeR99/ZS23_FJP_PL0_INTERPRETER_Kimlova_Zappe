import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Heap, HeapBlock, HeapCellType, Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import styles from '../../styles/heap.module.css';
import classNames from 'classnames';
import { GetValueFromHeap } from '../../core/allocator';

type HeapCellVisualisationProps = {
    index: number;
    value: number;
    type: HeapCellType;
    heapToBeHighlighted: Map<number, string>;
};

export function HeapCellVisualisation(props: HeapCellVisualisationProps) {
    const index = props.index;
    const highlightedColor: string | null = props.heapToBeHighlighted.has(index)
        ? props.heapToBeHighlighted.get(index) ?? null
        : null;

    function isAllocated() {
        return (
            props.type === HeapCellType.ALLOCATED_DATA ||
            props.type === HeapCellType.ALLOCATED_META
        );
    }

    function getCellStyle() {
        switch (props.type) {
            case HeapCellType.NOT_ALLOCATED:
                return styles.heapCellEmpty;
            case HeapCellType.NOT_ALLOCATED_META:
                return styles.heapCellEmptyMeta;
            case HeapCellType.ALLOCATED_META:
                return styles.heapCellFullMeta;
            case HeapCellType.ALLOCATED_DATA:
                return styles.heapCellFull;
        }
    }

    function showValue() {
        return (
            props.type === HeapCellType.ALLOCATED_DATA ||
            props.type === HeapCellType.ALLOCATED_META ||
            props.type === HeapCellType.NOT_ALLOCATED_META
        );
    }

    return (
        <div
            key={index}
            className={`${styles.heapCell} ${getCellStyle()}`}
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
                (!isAllocated() && '-- nealokováno --') +
                (showValue() && 'hodnota: ' + props.value)
            }
        >
            {showValue() && props.value}
        </div>
    );
}
