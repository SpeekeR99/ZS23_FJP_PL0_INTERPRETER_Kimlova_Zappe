import type { Heap } from './model';
import type { HeapBlock } from './model';

// ----------------------------------------------------------------------------------------------------------------
//  Allocate(heap, count) - allocate count memory cells on heap, return -1 if impossible to allocate or first cell index
//  AllocateDummy(heap, count) - same as above but dont actually allocate it, just return the result (for visualisaiton)
//  Free(heap, address) - free the memory given address and heap
//  FreeDummy(heap, address) - same as above but just a simulation
// ----------------------------------------------------------------------------------------------------------------

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

export function Free(heap: Heap, address: number) {
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
            return;
        }
    }

    // do warning, not fatal
    throw new Error('Na adrese ' + address + ' nezačíná žádný alokovaný blok paměti');
}

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

function CreateArray(size: number, value: number = 0): number[] {
    let arr: number[] = [];
    for (let i = 0; i < size; i++) {
        arr.push(value);
    }

    return arr;
}
