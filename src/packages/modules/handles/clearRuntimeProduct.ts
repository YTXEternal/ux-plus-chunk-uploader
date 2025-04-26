import type {_SetOption} from '@/types';

export const clearRuntimeProduct = (setOption:_SetOption) => {
    setOption({
        _chunkcount:0,
        _progressGather:{}
    });
}

