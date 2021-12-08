import React, { useEffect, useState } from 'react';
import { Explanation, Placeholder } from '../../core/explainer';
import { Instruction, InstructionType } from '../../core/model';

type InstructionExplanationProps = {
    explanation: Explanation | null;
};

interface ExplanationMessagePart {
    content: string;
    placeholder: Placeholder | null;
}
function ExplanationPart({ part }: { part: ExplanationMessagePart }): JSX.Element | null {
    if (part.placeholder) {
        return (
            <span style={{ backgroundColor: 'lightgreen' }}>
                {part.content.replace(
                    part.placeholder.placeholder,
                    part.placeholder.value.toString()
                )}
            </span>
        );
    }
    return <span>{part.content}</span>;
}
export function InstructionExplanation(props: InstructionExplanationProps) {
    function splitParts(): ExplanationMessagePart[] {
        const parts: ExplanationMessagePart[] = [];
        const splParts = props.explanation?.message.split('%') ?? [];
        let first = true;
        for (const p of splParts) {
            const trimmed = p.trim();

            if (first) {
                // first do not start with placeholde
                first = false;

                if (trimmed.length > 0) {
                    const part: ExplanationMessagePart = {
                        content: p,
                        placeholder: null,
                    };

                    parts.push(part);
                }
            } else {
                if (trimmed.length == 0) {
                    continue;
                }

                const first = p.substring(0, 1);
                const rest = p.substring(1);

                if (first.length > 0) {
                    const placeholdersValid =
                        props.explanation?.placeholders.filter(
                            (e) => e.placeholder == first
                        ) ?? [];

                    parts.push({
                        content: first,
                        placeholder: placeholdersValid[0] ?? null,
                    });
                }
                if (rest.length > 0) {
                    parts.push({ content: rest, placeholder: null });
                }
            }
        }

        return parts ?? [];
    }

    if (!props.explanation || !props.explanation.message) {
        return <span></span>;
    }
    return (
        <div>
            {splitParts().map((part, index) => (
                <ExplanationPart part={part} key={index} />
            ))}
        </div>
    );
}
