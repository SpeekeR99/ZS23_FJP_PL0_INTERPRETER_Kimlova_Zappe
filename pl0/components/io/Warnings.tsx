import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { Wrapper } from '../general/Wrapper';

type WarningsViewProps = {
    warnings: string[];
};

export function WarningsView(props: WarningsViewProps) {
    return (
        <div>
            <div>Varování:</div>
            {props.warnings?.map((w) => (
                <code>{w}</code>
            ))}
        </div>
    );
}
