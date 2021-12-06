import React, { useState } from 'react';
import { dark, light, primary } from '../../constants/Colors';

export function Footer() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: primary,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '2px 2px 5px 2px rgba(0,0,0,0.1)',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '0px',
            }}
            className="panel"
        >
            <div
                style={{
                    marginRight: '30px',
                    color: light,
                }}
            >
                Vytvořili Lukáš Vlček a Vojtěch Bartička
            </div>
            <div
                style={{
                    marginRight: '30px',
                    color: light,
                }}
            >
                Semestrální práce z KIV/FJP, FAV ZČU 2021/2022
            </div>
        </div>
    );
}
