import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { HeaderWrapper } from '../general/HeaderWrapper';
import { Wrapper } from '../general/Wrapper';

type WarningsViewProps = {
    warnings: string[];
};

export function WarningsView(props: WarningsViewProps) {
    return (
        <HeaderWrapper header={'Varování'}>
            <>
                {props.warnings?.map((w, index) => (
                    <code style={{ display: 'block' }}>
                        {index + 1}: {w}
                    </code>
                ))}
            </>
        </HeaderWrapper>
    );
}
