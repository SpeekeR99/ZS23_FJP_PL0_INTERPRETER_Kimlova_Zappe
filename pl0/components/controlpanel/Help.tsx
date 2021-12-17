import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal, Table } from 'react-bootstrap';
import { Instruction } from '../../core/model';
import { ParseAndValidate, PreprocessingError } from '../../core/validator';
import { ShowToast } from '../../utils/alerts';
import { OKView } from '../general/OKView';
import styles from '../../styles/instructions.module.css';
import { ButtonStyle, IconButton } from '../general/IconButton';

import { faEdit, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export function Help() {
    const { t, i18n } = useTranslation();
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
        <>
            <IconButton onClick={handleShow} text={t('ui:help')} icon={faQuestion} />

            <Modal scrollable={true} show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('ui:help')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{}}>
                        <h2>Instrukce</h2>

                        {/*<Table>
                            <thead>
                                <tr>
                                    <th style={{ width: '35px' }}></th>
                                    <th style={{ width: '50px' }}>
                                        {t('ui:instructionsTableInstruction')}
                                    </th>
                                    <th style={{ width: '35px' }}>
                                        {t('ui:instructionsTableLevel')}
                                    </th>
                                    <th style={{ width: '35px' }}>
                                        {t('ui:instructionsTablePar')}
                                    </th>
                                    <th>{t('ui:instructionsTableExplanation')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </Table>*/}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        {t('ui:ok')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
