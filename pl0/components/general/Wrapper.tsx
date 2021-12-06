import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Instruction } from '../../core/model';
import { PreprocessingError } from '../../core/validator';

type WrapperProps = {
    children: JSX.Element | JSX.Element[];
};

export function Wrapper(props: WrapperProps) {
    return (
        <div
            style={{
                padding: 10,
            }}
        >
            {props.children}
        </div>
    );
}
