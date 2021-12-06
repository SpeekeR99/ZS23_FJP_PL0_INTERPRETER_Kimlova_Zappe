import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/layout.module.css';
import * as core from '../core/index';
import React, { useState } from 'react';
import {
    DataModel,
    Instruction,
    InstructionStepParameters,
    InstructionStepResult,
    InstructionType,
} from '../core/model';
import { InitModel } from '../core/operations';
import { Instructions } from '../components/instructions';
import { PreprocessingError } from '../core/validator';
import { Stack } from '../components/stack';
import { Button } from 'react-bootstrap';
import { Heap } from '../components/heap';
import { Footer } from '../components/footer';

const Home: NextPage = () => {
    const [model, setModel] = useState<DataModel | null>(null);
    const [models, setModels] = useState<DataModel[]>([]);

    const [version, setVersion] = useState<number>(0);
    const [inputTxt, setInputTxt] = useState<string>('');

    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [validationOK, setValidationOK] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<PreprocessingError[]>([]);

    const [isEnd, setIsEnd] = useState(false);

    function instructionsLoaded(
        instructions: Instruction[],
        validationOK: boolean,
        validationErrors: PreprocessingError[]
    ) {
        setValidationOK(validationOK);
        setValidationErrors(validationErrors);

        setInstructions(instructions);

        start();
    }

    function start() {
        const m = InitModel(1024, 250);

        // empty models (todo better?)
        models.splice(0, models.length);

        models.push(JSON.parse(JSON.stringify(m)));
        setModel({ ...m });
    }
    function play() {
        let result = nextStep();

        while (result && !result.isEnd) {
            result = nextStep();
        }
    }
    function nextStep() {
        models.push(JSON.parse(JSON.stringify(model)));
        let result: InstructionStepResult | null = null;

        try {
            if (!model) {
                return;
            }

            model.input = inputTxt;

            const pars: InstructionStepParameters = {
                model,
                instructions,
                input: '',
            };

            result = core.Operations.NextStep(pars);

            setIsEnd(result.isEnd);

            setInputTxt(result.inputNextStep);
        } catch (e) {
            alert((e as Error).message);
        }

        //setModel({ ...model });
        setVersion(version + 1);

        return result;
    }
    function previous() {
        setModel(models[models.length - 1]);
        setIsEnd(false);
        models.pop();
    }

    return (
        <main className={styles.layoutwrapper}>
            <Head>
                <title>PL/0 interpret</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.header}>
                <Button onClick={previous} disabled={!models || !models.length}>
                    Step back
                </Button>
                <Button onClick={nextStep} disabled={!model || isEnd}>
                    Next step
                </Button>

                <Button onClick={play} disabled={!model}>
                    Play
                </Button>

                <Button onClick={start} disabled={!model}>
                    Reset
                </Button>
            </div>
            <div className={styles.instructions}>
                <Instructions
                    instructions={instructions}
                    validationErrors={[]}
                    validationOK={true}
                    instructionsLoaded={instructionsLoaded}
                    pc={model?.pc ?? 0}
                />
            </div>
            <div className={styles.stack}>
                <Stack sp={model?.sp} stack={model?.stack} />
            </div>
            <div className={styles.heap}>
                <Heap heap={model?.heap} />
            </div>
            <div className={styles.io}>io</div>
            <div className={styles.footer}>
                <Footer />
            </div>
        </main>
    );
};

export default Home;
