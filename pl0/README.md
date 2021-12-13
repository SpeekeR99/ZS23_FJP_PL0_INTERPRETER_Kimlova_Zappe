## Model

Model (or interpreter) in implemented in <code>core/model.ts</code>. It performs all the instructions passed to it. The main interface, which describes the model's state is <code>DataModel</code>, which contains

-   <code>pc</code> - the program counter, aka index of the instruction to execute,
-   <code>sp</code> - the stack pointer, which points to the current top of stack (initialized as <code>-1</code>),
-   <code>base</code> - the base of the current stack frame (at the start, there are 3 values in the stack and a stack frame with size 0 is created, so the base is 0),
-   <code>stack</code> - a <code>Stack</code> interface, which describes the current state of the stack,
-   <code>heap</code> - a <code>Heap</code> interface, which describes the current state of the heap,
-   <code>input</code> - a string, which contains the characters from the UI input field,
-   <code>output</code> - a string, which contains the characters the model has outputted during the execution of the program.

Note that all the operations performed on the stack or heap require passing the stack or heap to the functions.

The operation to perform and the model state is defined trough the <code>InstructionStepParameters</code> interface, which contains the <code>DataModel</code>, an array of <code>Instruction</code> interfaces, which effectively contain the code to be executed and <code>input</code> string, which is passed from the UI and contains the characters present in the input field.

Instructions are defined by the <code>Instruction</code> interface, which contains the <code>index</code>, <code>InstructionType</code> (an <code>enum</code> which contains all the valid instructions), <code>level</code> and <code>parameter</code> (also address or <code>A</code> in <code>L,A</code>). The <code>explanationParts</code> attribute is used solely by the UI and is of no importance to the model.

Then the <code>model.ts</code> contains come other interfaces, which are important for the explainer, allocator and UI but don't matter in the model. The <code>enum OperationType</code> contains all the operations that can be performed by the <code>OPR</code> instruction - note that the operations have to be numbere correctly since the model then uses the <code>parameter</code> of the <code>Instruction</code> to decide which operation to perform.

The heap is represented by the <code>Heap</code> interface but it's behaviour is described lower in the Allocator section.

The stack is represented by the <code>Stack</code> interface. It contains <code>values</code>, which is an array of <code>StackItem</code> interfaces, which right now contain only <code>value</code> (meaning that one <code>StackItem</code> represents one value on the stack), and <code>stackFrames</code> array of <code>StackFrame</code> interfaces, which are neccessary for the UI to visualise the stack properly. The <code>StackFrame</code> has <code>index</code> attribute, which says where the stack frame starts, and <code>size</code> attribute, which says how large the stack frame is. When a new stack frame is created, a new <code>StackFrame</code> has to be inserted into the <code>stackFrames</code> array. Values not included in any stack frame are still visualised. It is expected that the stack frame contains static base at relative index 0 (first value of the stack frame), dynamic base at relative index 1 and program counter at relative index 2.

There are several utility functions that can make some operations simpler:

-   <code>function GetValuesFromStack(
    stack: Stack,
    index: number,
    count: number,
    decrementCurrentFrame: boolean = true
    ): number[]</code> - This function is used to access values on the stack given <code>index</code> from where to take the values, <code>count</code> of values to take and whether or not to decrement the current stack frame size (defaults to <code>true</code>). It returns an array of values of size <code>count</code>, where the values closer to the top of the stack are on lower indices of the array. This function checks if the index is in bounds.
-   <code>function GetValueFromStack(stack: Stack, index: number): number</code>
    -   This function simply checks if the <code>index</code> is in bounds and returns the value on the stack at the specified <code>index</code> without decrementing the current stack frame - useful for instructions like <code>LOD</code>.
-   <code>function PutOntoStack(stack: Stack, index: number, value: number)</code>
    -   Given an <code>index</code> and <code>value</code>, this function first increases the size of the stack of needed so that the <code>value</code> can be stored at the <code>index</code> (adds 0s to the top of the stack). The <code>value</code> is then stored at the <code>index</code>. This function is useful for instructions such as <code>STA</code>, where you can store at an index which does not exist on the stack yet. This function makes sure the application does not fail on an exception.
-   <code>ConvertToStackItems(...values: number[]): StackItem[]</code>
    -   This function converts passed value into <code>StackItem</code>s and returns them as an array.
-   <code>PushOntoStack(stack: Stack, sp: number, values: StackItem[], increment: boolean = true): number</code>

    -   This function is used specifically to push values onto stack. The values have to be an array of <code>StackItem</code>s (see function <code>ConvertToStackItems</code>). <code>sp</code> (aka the stack pointer) has to be passed. This function automatically increases the size of current <code>StackFrame</code> (can be disabled, on by default) and returns the new stack pointer. The values are pushed onto stack in the order they are in the passed array of <code>StackItem</code>s.

-   <code>CheckStackSize(stack: Stack)</code>
    -   Check if the stack is not too large, returns <code>false</code> if the stack has exceeded the maximum size.
-   <code>CheckSPInBounds(sp: number)</code>

    -   Checks if the passed stack pointer is not negative (pointing under the stack).

-   <code>FindBase(stack: Stack, base: number, level: number): number</code>
    -   This function is used to resolve the base when needed. Given the <code>stack</code>, current <code>base</code> and desired <code>level</code>, it jumps down the static bases. If the <code>level</code> is 0, current base is returned. If the <code>level</code> is too large (bottom of stack reached before <code>level == 0</code>), throws an exception.

For the model to perform a step, the <code>DoStep(params: InstructionStepParameters)</code> function is called. This function returns interface <code>InstructionStepResult</code>, which contains

-   <code>isEnd</code> - specifies whether or not the execution should end,
-   <code>output</code> - contains the whole output from the whole execution, which means that the <code>WRI</code> instruction should append to the <code>input</code> string from <code>InstructionStepParameters</code> and return this string in <code>InstructionStepResult.output</code>,
-   <code>warnings</code> - array of strings which can contain messages that will be displayed in the UI,
-   <code>inputNextStep</code> - the modified input string, which means that the <code>REA</code> instruction takes one character from the input and the modified input is returned in this.

In the <code>DoStep</code> function is a large <code>switch</code> statement, where all the instructions are. At the end of the function a check if the program counter is out-of-bounds (pointing to a non-existent instruction) is performed and <code>UpdateHeapBlocks</code> is called (see down in the Allocator).

Then there is the <code>PerformINT</code> function, which takes care of the <code>INT</code> instruction including negative parameter, stack frame incrementing and decrementing. It does not allow to decrease the stack pointer under the current stack frame or the stakc pointer to go under -1. Last but no least the <code>PerformOPR</code> function, which takes care of the <code>OPR</code> instruction and returns the new stack pointer.

## Allocator

Allocator takes care of allocating and freeing memory in addition to all interactions from the model and explainer. Allocator is implemented in <code>core/allocator.ts</code>, which contains several functions:

-   <code>Allocate(heap: Heap, count: number) : number</code>
    -   This function performs the allocation given <code>count</code> of cells to allocate. The function is expected to return the address of the first allocated cell on success or <code>-1</code> on failure of any kind - out-of-bounds access, unallocated memory access (if desired) etc.
-   <code>AllocateDummy(heap: Heap, count: number) : number</code>
    -   This function has the exact same behaviour as the <code>Allocate</code> function but does not make any changes to the heap. It should exactly emulate it's behaviour on the outside and is used by the explainer to visualise what will happen when the next instruction is performed.
-   <code>Free(heap: Heap, address: number): number</code>
    -   This function deallocates memory on heap given an address and returns <code>0</code> on success or <code>-1</code> on failure.
-   <code>FreeDummy(heap: Heap, address: number): number</code>
    -   Same as with <code>AllocateDummy</code> in that it should not make any changes to the heap, but should return number of deallocated cells if the deallocation would be successful or <code>-1</code> if it would fail. Used by the explainer.
-   <code>GetValueFromHeap(heap: Heap, address: number): number | null</code>
    -   This function is used to get a value from heap by the model. It should return value stored on the address if successful, <code>null</code> on out-of-bounds access and <code>NaN</code> on unallocated memory access (if desired).
-   <code>GetValueFromHeapDummy(heap: Heap, address: number): number | null</code>
    -   Does exactly the same thing as <code>GetValueFromHeapDummy</code> but is used by the explainer. If needed, the function can just call <code>GetValueFromHeap</code> and pass the return value.
-   <code>PutValueOnHeap(heap: Heap, address: number, value: number): number</code>
    -   This function places a passed <code>value</code> into heap on a specified <code>address</code>. It returns <code>0</code> on success, <code>-1</code> on out-of-bounds access and <code>-2</code> on unallocated memory access (if desired)
-   <code>function PutValueOnHeapDummy(heap: Heap, address: number)</code>
    -   Again, this function outwardly does the same as <code>PutValueOnHeap</code> but does not actually put the value on the heap (notice the missing <code>value</code> parameter). It should return <code>0</code> if the operation would be successful, <code>-1</code> if it would be out-of-bounds and <code>-2</code> if it would result in unallocated memory access (again, if desired).
-   <code>function UpdateHeapBlocks(heap: Heap)</code>
    -   This function is more complex. It is a neccessity for the visualisation to work, and is called by the model at the end of each step. It converts the heap into blocks, which are interpretable by the UI. This is needed so that the UI is allocator-agnostic, aka it works no matter the allocator if it follows the basic rules. The premise is, that the memory is allocated in blocks. The <code>Heap</code> interface has the <code>heapBlocks</code> attribute, which is an array of <code>HeapBlock</code> interfaces. This interface should contain the neccessary information for the UI to be able to visualize the heap. The attributes of this interface are:
        -   <code>blockAddress</code>, which is the index in heap where the block starts including all the allocator-only information (free/empty, block size, etc.).
        -   <code>blockSize</code>, which is the size of the block (number of heap cells it takes up) including the allocator-only information.
        -   <code>dataAddress</code>, which is the index in heap where the user should store the data, aka the address the <code>Allocate</code> function returns.
        -   <code>dataSize</code>, which is the size of the data block, which would correspond to the number of cells the user allocated trough <code>NEW</code> instruction, aka the <code>count</code> parameter if the <code>Allocate</code> function.
        -   <code>free</code>, which is whether the block is free (<code>true</code>) or not (<code>false</code>).
        -   <code>allocatorInfoIndices</code>, which is an array of indices in the heap, which contain allocator-only information. The indices should be passed relative to the start of the heap (index 0), not relative to the block start.
    -   In short, the function looks at the <code>Heap.values</code> array and converts it into these blocks - creates the array of <code>HeapBlock</code>s and sets it as the <code>Heap.heapBlocks</code>. If the function is not implemented correctly, the UI won't show the heap state correctly.

## Explainer

### Calling the explainer

## Scenarios

### Adding a new instruction

### Changing the allocator
