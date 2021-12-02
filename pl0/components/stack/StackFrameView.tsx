import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { UIStackFrame } from '../../core/uitransofmation';
import styles from '../../styles/stack.module.css';

type StackFrameViewProps = {
    stackFrame: UIStackFrame;
    firstIndex: number;
    sp: number;
};

export function StackFrameView(props: StackFrameViewProps) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: props.stackFrame.isStackFrame
                    ? props.stackFrame.color
                    : 'gray',
                maxHeight: '100%',
                height: '100%',
                flexGrow: 1,
            }}
            className={styles.stackFrame}
        >
            {props.stackFrame.values.map((value, key) => (
                <div
                    style={{
                        width: '100%',
                        minWidth: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                    key={key}
                    className={styles.stackFrameItem}
                >
                    <div style={{ minWidth: '20%' }}>{props.firstIndex + key}</div>
                    <div style={{ minWidth: '80%' }}>{value.value}</div>
                </div>
            ))}
        </div>
    );
}
