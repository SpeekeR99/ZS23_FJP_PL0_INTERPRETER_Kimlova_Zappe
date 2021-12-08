import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { dark, light, primary } from '../../constants/Colors';
import { DataModel, EmulationState } from '../../core/model';

import {
    faStepBackward,
    faStepForward,
    faPlay,
    faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonStyle, IconButton } from '../general/IconButton';

type ControlPanelProps = {
    models: DataModel[];
    model: DataModel | null;

    nextStep: () => void;
    previous: () => void;
    play: () => void;
    start: () => void;

    emulationState: EmulationState;
    canContinue: () => boolean;
};
export function ControlPanel(props: ControlPanelProps) {
    return (
        <div>
            <IconButton
                onClick={props.previous}
                disabled={!props.models || !props.models.length}
                text={'Step back'}
                icon={faStepBackward}
            />
            <IconButton
                onClick={props.nextStep}
                disabled={!props.canContinue()}
                text={'Next step'}
                icon={faStepForward}
                style={ButtonStyle.STANDARD}
            />
            <IconButton
                onClick={props.play}
                disabled={!props.model}
                text={'Play'}
                icon={faPlay}
                style={ButtonStyle.STANDARD}
            />
            <IconButton
                onClick={props.start}
                disabled={!props.model}
                text={'Reset'}
                icon={faRedo}
                style={ButtonStyle.DANGER}
            />
        </div>
    );
}
