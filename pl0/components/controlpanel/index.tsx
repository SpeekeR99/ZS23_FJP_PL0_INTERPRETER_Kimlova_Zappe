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
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '20px',
            }}
        >
            <div>
                <IconButton
                    onClick={props.previous}
                    disabled={!props.models || !props.models.length}
                    text={'Krok zpět'}
                    icon={faStepBackward}
                />
                <IconButton
                    onClick={props.nextStep}
                    disabled={!props.canContinue()}
                    text={'Krok vpřed'}
                    icon={faStepForward}
                    style={ButtonStyle.STANDARD}
                />
                <IconButton
                    onClick={props.play}
                    disabled={!props.model}
                    text={'Spustit'}
                    icon={faPlay}
                    style={ButtonStyle.STANDARD}
                />
                <IconButton
                    onClick={props.start}
                    disabled={!props.model}
                    text={'Obnovit'}
                    icon={faRedo}
                    style={ButtonStyle.DANGER}
                />
            </div>
            {/*
            <div
                style={{
                    marginRight: '30px',
                    color: light,
                    fontSize: 'small',
                    justifySelf: 'flex-end',
                }}
            >
                Vytvořili Lukáš Vlček a Vojtěch Bartička <br />
                Semestrální práce z KIV/FJP, FAV ZČU 2021/2022
            </div>*/}
        </div>
    );
}
