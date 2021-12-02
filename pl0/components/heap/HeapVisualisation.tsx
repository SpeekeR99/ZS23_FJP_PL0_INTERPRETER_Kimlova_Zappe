import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Heap, Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { HeapBlockVisualisation } from './HeapBlockVisualisation';

type HeapVisualisationProps = {
    heap: Heap;
};

export function HeapVisualisation(props: HeapVisualisationProps) {
    return (
        <div
            style={{
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
            }}
        >
            <>
                {props.heap.blocks.map((hb, index) => (
                    <HeapBlockVisualisation heapblock={hb} key={index} />
                ))}
            </>
        </div>
    );
}
