import type { Heap } from './model';
import type { HeapBlock } from './model';

// -------------------------------------------------------------------------
//    FUNCTIONS THAT HAVE TO BE IMPLEMENTED
// -------------------------------------------------------------------------

/**
 * Allocates continuous block of specified size on heap
 * @param heap heap
 * @param count size
 * @returns index of the first allocated cell or -1 if the allocation failed
 */
export function Allocate(heap: Heap, count: number): number {
    for (let i = 0; i < heap.blocks.length; i++) {
        if (!heap.blocks[i].empty) {
            continue;
        }

        if (heap.blocks[i].size > count) {
            let blocksAfter = heap.blocks.slice(i + 1);
            let blocksBefore = heap.blocks.slice(0, i);
            let fullBlock: HeapBlock = {
                empty: false,
                index: heap.blocks[i].index,
                size: count,
                values: CreateArray(count),
            };
            let emptyBlock: HeapBlock = {
                empty: true,
                index: heap.blocks[i].index + count,
                size: heap.blocks[i].size - count,
                values: CreateArray(heap.blocks[i].size - count),
            };
            blocksBefore.push(fullBlock);
            blocksBefore.push(emptyBlock);
            heap.blocks = blocksBefore.concat(blocksAfter);

            return fullBlock.index;
        } else if (heap.blocks[i].size == count) {
            // Trivial case - the first block is the exact size needed
            heap.blocks[i].empty = false;
            return heap.blocks[i].index;
        }
    }

    // No empty space found
    return -1;
}

/**
 * Given address, free it
 * @param heap heap
 * @param address address
 * @returns 0 on success, -1 on failure
 */
export function Free(heap: Heap, address: number): number {
    // Find the address
    for (let i = 0; i < heap.blocks.length; i++) {
        if (heap.blocks[i].index == address && !heap.blocks[i].empty) {
            // The block to deallocate
            let targetBlock = heap.blocks[i];
            targetBlock.empty = true;

            // @ts-ignore
            let leftBlocks;
            // @ts-ignore
            let rightBlocks;

            // See if the block on the left is empty - if yes, merge it
            if (i != 0) {
                if (heap.blocks[i - 1].empty) {
                    let leftBlock = heap.blocks[i - 1];
                    leftBlocks = heap.blocks.slice(0, i);
                    leftBlocks.pop();
                    targetBlock.size += leftBlock.size;
                    targetBlock.index = leftBlock.index;
                } else {
                    leftBlocks = heap.blocks.slice(0, i);
                }
            } else {
                leftBlocks = [];
            }

            if (i != heap.blocks.length - 1) {
                if (heap.blocks[i + 1].empty) {
                    let rightBlock = heap.blocks[i + 1];
                    rightBlocks = heap.blocks.slice(i + 1);
                    rightBlocks = rightBlocks.reverse();
                    rightBlocks.pop();
                    rightBlocks = rightBlocks.reverse();
                    targetBlock.size += rightBlock.size;
                } else {
                    rightBlocks = heap.blocks.slice(i + 1);
                }
            } else {
                rightBlocks = [];
            }

            let resultBlocks: HeapBlock[] = [];

            if (i != 0) {
                // @ts-ignore
                leftBlocks.push(targetBlock);
                // @ts-ignore
                resultBlocks = resultBlocks.concat(leftBlocks);
            } else {
                resultBlocks.push(targetBlock);
            }

            if (i != heap.blocks.length - 1) {
                // @ts-ignore
                resultBlocks = resultBlocks.concat(rightBlocks);
            }

            heap.blocks = resultBlocks;
            return 0;
        }
    }

    // do warning, not fatal
    return -1;
}

/**
 * Simulate allocation of block given size
 * @param heap heap
 * @param count size
 * @returns first allocated cell index on success or -1 on failure
 */
export function AllocateDummy(heap: Heap, count: number): number {
    for (let i = 0; i < heap.blocks.length; i++) {
        if (!heap.blocks[i].empty) {
            continue;
        }
        if (heap.blocks[i].size > count) {
            return heap.blocks[i].index;
        } else if (heap.blocks[i].size == count) {
            return heap.blocks[i].index;
        }
    }
    // No empty space found
    return -1;
}

/**
 * Simulate free of an address
 * @param heap heap
 * @param address address
 * @returns number of freed cells on success or -1 on failure
 */
export function FreeDummy(heap: Heap, address: number): HeapBlock {
    // Find the address
    for (let i = 0; i < heap.blocks.length; i++) {
        if (heap.blocks[i].index == address && !heap.blocks[i].empty) {
            // The block to deallocate
            return heap.blocks[i];
        }
    }

    // do warning, not fatal
    return { size: -1, index: address, empty: true, values: [] };
}

/**
 * Given heap and address, return the value stored on heap
 * @param heap heap
 * @param address address
 * @returns value stored on success, null on out-of-bounds access and NaN on unallocated memory access
 */
export function GetValueFromHeap(heap: Heap, address: number): number | null {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (heapBlock.index == -1) {
        return null;
    } else if (heapBlock.empty) {
        return NaN;
    } else {
        return heapBlock.values[address - heapBlock.index];
    }
}

/**
 * Given heap, address and value, store the value on the address
 * @param heap heap
 * @param address address
 * @param value value
 * @returns 0 on success, -1 on undefined index (larger than heap max size), -2 on unallocated memory access
 */
export function PutValueOnHeap(heap: Heap, address: number, value: number): number {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (heapBlock.index == -1) {
        return -1;
    } else if (heapBlock.empty) {
        return -2;
    } else {
        heapBlock.values[address - heapBlock.index] = value;
        return 0;
    }
}

/**
 * Given heap and address, return the value stored on heap
 * @param heap heap
 * @param address address
 * @returns value stored on success, null on out-of-bounds and NaN on unallocated memory access
 */
export function GetValueFromHeapDummy(heap: Heap, address: number): number | null {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (address > heap.size - 1) {
        return null;
    } else if (heapBlock.empty) {
        return NaN;
    } else {
        return heapBlock.values[address - heapBlock.index];
    }
}

/**
 * Given heap, address and value, simulate storing the value on the address
 * @param heap heap
 * @param address address
 * @param value value
 * @returns 0 on success, -1 on undefined index (larger than heap max size), -2 on unallocated memory access
 */
export function PutValueOnHeapDummy(heap: Heap, address: number) {
    let heapBlock = FindHeapBlockGivenAddress(heap, address);
    if (heapBlock.index == -1) {
        return -1;
    } else if (heapBlock.empty) {
        return -2;
    } else {
        return 0;
    }
}

// -------------------------------------------------------------------------
//  UTILITY
// -------------------------------------------------------------------------

function FindHeapBlockGivenAddress(heap: Heap, address: number): HeapBlock {
    for (let i = 0; i < heap.blocks.length; i++) {
        let heapBlock = heap.blocks[i];
        if (
            heapBlock.index <= address &&
            address <= heapBlock.index + heapBlock.size - 1
        ) {
            return heapBlock;
        }
    }

    return { size: 0, values: [], empty: true, index: -1 };
}

function CreateArray(size: number, value: number = 0): number[] {
    let arr: number[] = [];
    for (let i = 0; i < size; i++) {
        arr.push(value);
    }

    return arr;
}
