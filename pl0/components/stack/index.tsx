import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { HeaderWrapper } from '../general/HeaderWrapper';
import { Wrapper } from '../general/Wrapper';
import { StackFrameView } from './StackFrameView';
import { StackSplitter } from './StackSplitter';

type StackProps = {
    stack?: Stack;
    sp?: number;
    base?: number;
};

export function Stack(props: StackProps) {
    if (!props.stack || !props.sp) {
        return null;
    }

    return (
        <HeaderWrapper header={'Zásobník'}>
            <>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                    }}
                >
                    <div>SP: {props.sp}</div>
                    <div>Báze: {props.base}</div>
                </div>
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
            </>
        </HeaderWrapper>
    );
}
