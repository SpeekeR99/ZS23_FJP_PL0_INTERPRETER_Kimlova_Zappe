import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { Wrapper } from '../general/Wrapper';
import { StackFrameView } from './StackFrameView';
import { StackSplitter } from './StackSplitter';

type StackProps = {
    stack?: Stack;
    sp?: number;
};

export function Stack(props: StackProps) {
    if (!props.stack || !props.sp) {
        return null;
    }

    return (
        <Wrapper>
            <div className="panel">
                Stack: <br />
                SP: {props.sp}
                <hr />
                {TransformStackFrames(props.stack).map((sf, index) => (
                    <>
                        <StackFrameView
                            firstIndex={sf.startIndex}
                            stackFrame={sf}
                            sp={props.sp ?? 0}
                            key={index}
                        />
                        {sf.startIndex + sf.values.length == (props.sp ?? -1) + 1 && (
                            <StackSplitter />
                        )}
                    </>
                ))}
            </div>
        </Wrapper>
    );
}
