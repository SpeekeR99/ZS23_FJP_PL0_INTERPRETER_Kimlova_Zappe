import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Stack } from '../../core/model';
import { TransformStackFrames } from '../../core/uitransofmation';
import { Wrapper } from '../general/Wrapper';
import { Input } from './Input';
import { Output } from './Output';
import { WarningsView } from './Warnings';

type IOProps = {
    inputTxt: string;
    setInputTXT: (newValue: string) => void;

    outputTxt: string;

    warnings: string[];
};

export function IO(props: IOProps) {
    return (
        <Wrapper>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    flexShrink: 1,
                    maxHeight: '100%',
                }}
            >
                <div className="panelNH">
                    <Input inputTxt={props.inputTxt} setInputTXT={props.setInputTXT} />
                </div>
                <div className="panelNH" style={{ marginTop: '30px' }}>
                    <Output outputTxt={props.outputTxt} />
                </div>
                <div
                    className="panelNH"
                    style={{
                        marginTop: '30px',
                        flexGrow: 1,
                        flexShrink: 1,
                        overflow: 'auto',
                    }}
                >
                    <WarningsView warnings={props.warnings} />
                </div>
            </div>
        </Wrapper>
    );
}
