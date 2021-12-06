import React, { useState } from 'react';
import styles from '../../styles/stack.module.css';

export function StackSplitter() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '60px',
            }}
            title={'Ukazatel stack pointeru'}
        >
            <div className={styles.stackSplitter} />
        </div>
    );
}
