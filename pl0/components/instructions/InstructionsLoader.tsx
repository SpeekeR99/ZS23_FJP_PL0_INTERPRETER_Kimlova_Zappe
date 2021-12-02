import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';
import { Instruction } from '../../core/model';
import { ParseAndValidate, PreprocessingError } from '../../core/validator';
import { OKView } from '../general/OKView';

type InstructionsLoaderProps = {
    instructionsLoaded: (
        instructions: Instruction[],
        validationOK: boolean,
        validationErrors: PreprocessingError[]
    ) => void;
};

export function InstructionsLoader(props: InstructionsLoaderProps) {
    const [showTextEdit, setShowTextEdit] = useState(false);
    const [showFileSubmit, setShowFileSubmit] = useState(false);

    const handleClose = (fnc: (show: boolean) => void) => fnc(false);
    const handleShow = (fnc: (show: boolean) => void) => fnc(true);

    const [textInstructions, setTextInstructions] = useState('');

    const [parseOK, setParseOK] = useState(false);
    const [validationOK, setValidationOK] = useState(false);
    const [parseErrors, setParseErrors] = useState<PreprocessingError[]>([]);
    const [validationErrors, setValidationErrors] = useState<PreprocessingError[]>([]);

    function onChange(e: React.FormEvent<HTMLTextAreaElement>): void {
        setTextInstructions(e.currentTarget.value);
    }

    useEffect(() => {
        console.log('test');
        const pav = ParseAndValidate(textInstructions.trim());
        console.log(pav);

        setParseOK(pav.parseOK);
        setValidationOK(pav.validationOK);

        setParseErrors(pav.parseErrors);
        setValidationErrors(pav.validationErrors);
    }, [textInstructions]);

    function ParseErrorsView() {
        return (
            <div>
                Parsování instrukcí: <OKView value={parseOK} />
                {parseErrors.map((e) => (
                    <code style={{ display: 'block' }}>
                        {e.rowIndex}: {e.error}
                    </code>
                ))}
            </div>
        );
    }
    function ValidationErrorsView() {
        return (
            <div>
                Validace instrukcí: <OKView value={validationOK} />
            </div>
        );
    }

    return (
        <>
            <Button variant="primary" onClick={() => handleShow(setShowTextEdit)}>
                Načíst z textového vstupu
            </Button>

            <Modal
                show={showTextEdit}
                onHide={() => handleClose(setShowTextEdit)}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Načíst z textového vstupu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{}}>
                        <textarea
                            style={{ width: '100%' }}
                            rows={15}
                            value={textInstructions}
                            onChange={onChange}
                        />

                        <div>
                            <ParseErrorsView />
                            {parseOK && <ValidationErrorsView />}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => handleClose(setShowTextEdit)}
                    >
                        Zrušit
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleClose(setShowTextEdit)}
                    >
                        Uložit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
