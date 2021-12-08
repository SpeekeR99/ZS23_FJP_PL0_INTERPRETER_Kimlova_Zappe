import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack, StackItem } from '../../core/model';
import { UIStackFrame } from '../../core/uitransofmation';
import styles from '../../styles/stack.module.css';

type StackFrameValueProps = {
    orderInStackFrame: number;
    rowIndex: number;
    stackFrame: UIStackFrame;
    sp: number;
    value: StackItem;

    stackToBeHighlighed: Map<number, string>;
};
function addAlpha(color: string, opacity: number): string {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}
function getTextColor(bg: string) {
    if (bg.length > 7) {
        const alpha = parseInt(bg.substring(bg.length - 2), 16);
        if (alpha < 150) {
            return 'black';
        }
    }

    return 'white';
}

export function StackFrameValue(props: StackFrameValueProps) {
    const isSF = props.stackFrame.isStackFrame;
    const isSFHeader = isSF && props.orderInStackFrame < 3;

    const isHighlighted = props.stackToBeHighlighed.has(props.rowIndex);
    const hightlighColor = isHighlighted
        ? props.stackToBeHighlighed.get(props.rowIndex)
        : null;

    const valueBackground = isHighlighted
        ? hightlighColor
        : isSFHeader
        ? addAlpha(props.stackFrame.color, 0.8)
        : isSF
        ? addAlpha(props.stackFrame.color, 0.5)
        : 'gray';

    return (
        <div className={styles.stackFrameItem}>
            <div
                className={`${styles.stackItem} ${styles.stackRowIndex} ${
                    props.stackFrame.isStackFrame
                        ? styles.stackRowIndexSF
                        : styles.stackRowIndexOutSF
                }`}
                style={{
                    backgroundColor: isSF ? props.stackFrame.color : 'red',
                }}
            >
                {props.rowIndex}
            </div>
            <div
                className={`${styles.stackItem} ${styles.stackValue}`}
                style={{
                    backgroundColor: valueBackground,
                    color: getTextColor(valueBackground),
                }}
            >
                {props.value.value}
                {isSFHeader && (
                    <div
                        title={
                            props.orderInStackFrame === 0
                                ? 'Statická báze volajícího'
                                : props.orderInStackFrame === 1
                                ? 'Dynamická báze volajícího'
                                : 'Program counter volajícího'
                        }
                    >
                        {props.orderInStackFrame === 0
                            ? 'SB'
                            : props.orderInStackFrame === 1
                            ? 'DB'
                            : 'PC'}
                    </div>
                )}
            </div>
        </div>
    );
}
