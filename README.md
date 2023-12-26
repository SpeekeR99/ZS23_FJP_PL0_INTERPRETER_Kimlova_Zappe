# Project Overview

This project implements a virtual machine interpreter for executing a stack-based programming language.
It includes components for managing memory, providing detailed visualizations, and explaining program behavior.

## Key Components

### 1. Model

Located in `core/model.ts`.

Manages execution state via the `DataModel`, including:
- `pc`: Program counter
- `sp`: Stack pointer
- `base`: Base of the current stack frame
- `stack`: Stack state
- `heap`: Heap state
- `input / output`: For program interaction

Operations are handled through `DoStep()`, which executes instructions defined by the `Instruction` interface.

**Utilities**: Functions like `GetValueFromStack`, `PutOntoStack`, and `PerformINT` simplify stack management.

### 2. Allocator

Implemented in `core/allocator.ts`.

Manages heap memory with functions like:
- `Allocate()`
- `Free()`
- `UpdateHeapBlocks()`

Visualizes memory using the `HeapBlock` interface, ensuring compatibility with the UI.

### 3. Explainer

Implemented in `core/explainer.ts`.

Provides real-time explanations of instructions without modifying the state.

Returns detailed messages with highlights using the `Explanation` interface.

## How It Works

- The **model** executes programs step-by-step, maintaining state and generating outputs.
- The **allocator** ensures memory is managed efficiently.
- The **explainer** offers clear feedback, aiding learning and debugging.

For more detailed information, refer to the corresponding `.ts` files and comments within the code.
