import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { StackFrameView } from './StackFrameView';

type StackProps = {
    stack?: Stack;
    sp?: number;
};

export function Stack(props: StackProps) {
    if (!props.stack || !props.sp) {
        return null;
    }

    return (
        <div style={{ maxHeight: '100%' }}>
            {TransformStackFrames(props.stack).map((sf, index) => (
                <StackFrameView
                    firstIndex={0 /* todo */}
                    stackFrame={sf}
                    sp={props.sp ?? 0}
                    key={index}
                />
            ))}
        </div>
    );
}
