import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { dark, light, primary } from '../../constants/Colors';
import { DataModel, EmulationState } from '../../core/model';

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
            <Button
                onClick={props.previous}
                disabled={!props.models || !props.models.length}
            >
                Step back
            </Button>
            <Button onClick={props.nextStep} disabled={!props.canContinue()}>
                Next step
            </Button>

            <Button onClick={props.play} disabled={!props.model}>
                Play
            </Button>

            <Button onClick={props.start} disabled={!props.model}>
                Reset
            </Button>
        </div>
    );
}
