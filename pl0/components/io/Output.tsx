import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { Wrapper } from '../general/Wrapper';

type InputProps = {
    outputTxt: string;
};

export function Output(props: InputProps) {
    return (
        <div>
            Výstup:
            <textarea
                style={{ width: '100%' }}
                rows={10}
                value={props.outputTxt}
                onChange={() => {}}
                readOnly={true}
            />
        </div>
    );
}
