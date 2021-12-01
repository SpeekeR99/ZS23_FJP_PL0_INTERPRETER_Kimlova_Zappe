import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/layout.module.css';
import * as core from '../core/index';
import { useState } from 'react';
import {
    DataModel,
    Instruction,
    InstructionStepParameters,
    InstructionType,
} from '../core/model';
import { InitModel } from '../core/operations';

const Home: NextPage = () => {
    const [model, setModel] = useState<DataModel | null>(null);
    const [models, setModels] = useState<DataModel[]>([]);

    const [version, setVersion] = useState<number>(0);
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [inputTxt, setInputTxt] = useState<string>('');

    function start() {
        const m = InitModel(1024 * 512, 5000);
        models.push(JSON.parse(JSON.stringify(m)));
        setModel({ ...m });
    }
    function nextStep() {
        models.push(JSON.parse(JSON.stringify(model)));
        try {
            if (!model) {
                return;
            }

            model.input = inputTxt;

            const pars: InstructionStepParameters = {
                model,
                instructions: [
                    {
                        index: 0,
                        instruction: InstructionType.LIT,
                        level: 0,
                        parameter: 9,
                    },
                ],
                input: '',
            };

            const result = core.Operations.NextStep(pars);

            setInputTxt(result.inputNextStep);
        } catch (e) {
            alert((e as Error).message);
        }

        //setModel({ ...model });
        setVersion(version + 1);
    }
    function previous() {
        setModel(models[models.length - 1]);
        models.pop();
    }

    return (
        <main className={styles.layoutwrapper}>
            <Head>
                <title>PL/0 interpret</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.header}>header</div>
            <div className={styles.instructions}>instructions</div>
            <div className={styles.stack}>stack</div>
            <div className={styles.heap}>heap</div>
            <div className={styles.io}>io</div>
            <div className={styles.footer}>footer</div>
        </main>
    );
};

export default Home;
