import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Heap, Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { HeaderWrapper } from '../general/HeaderWrapper';
import { Wrapper } from '../general/Wrapper';
import { HeapVisualisation } from './HeapVisualisation';

type HeapProps = {
    heap?: Heap;
};

export function Heap(props: HeapProps) {
    if (!props.heap) {
        return null;
    }

    return (
        <HeaderWrapper header={'Halda'}>
            <HeapVisualisation heap={props.heap} />
        </HeaderWrapper>
    );
}
