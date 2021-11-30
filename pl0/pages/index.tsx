import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
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

    return (
        <div className={styles.container}>
            <Head>
                <title>PL/0 interpret</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}></h1>

                {model == null && (
                    <>
                        <p>Simulace PL/0 nebyla zahájena</p>{' '}
                        <button
                            onClick={() => {
                                const m = InitModel(1024 * 512, 5000);
                                models.push(JSON.parse(JSON.stringify(m)));
                                setModel({ ...m });
                            }}
                        >
                            Zahájit
                        </button>
                    </>
                )}
                {model && (
                    <>
                        <p className={styles.description}>
                            PC: {model.pc} <br />
                            SP: {model.sp} <br />
                            Base: {model.base} <br />
                        </p>

                        <button
                            onClick={() => {
                                models.push(JSON.parse(JSON.stringify(model)));
                                try {
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
                            }}
                        >
                            next step -&gt;
                        </button>
                        <button
                            disabled={models.length < 1}
                            onClick={() => {
                                setModel(models[models.length - 1]);
                                models.pop();
                            }}
                        >
                            back -&lt;
                        </button>
                    </>
                )}
            </main>

            <footer
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    //backgroundColor: 'whitesmoke',
                    margin: 0,
                    width: '100%',
                    padding: 10,
                }}
            >
                Powered by
                <a href="https://net-inout.cz" target="_blank" rel="noopener noreferrer">
                    <span className={styles.logo}>
                        <Image
                            src="/logo-blue.svg"
                            alt="Logo net-inout s.r.o."
                            width={189}
                            height={37}
                        />
                    </span>
                </a>
            </footer>
        </div>
    );
};

export default Home;
