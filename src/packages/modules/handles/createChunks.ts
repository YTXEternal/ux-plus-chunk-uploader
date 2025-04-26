import type {
    CreateChunks,
    Chunks,
    _SetOption
} from '@/types';
import {callReject,ToM} from '@/shared';
import {UPLOAD_ERROR_STATES} from '@/constant';

export const createChunks = function({ raw, hash, suffix, chunkSize, max }: Parameters<CreateChunks>[0],isTerminate:()=>boolean,setOption:_SetOption) {
        const chunks: Chunks = [];
        let localChunkSize = ToM(chunkSize);
        let start = 0;
        let count = Math.ceil(raw.size / localChunkSize);
        count > max && (() => {
            count = max;
            localChunkSize = raw.size / count;
        })();
        setOption({
            _chunkcount:count,
        });
        while (start < count) {
            if(isTerminate()) {
                const err = callReject({
                    type:UPLOAD_ERROR_STATES.TERMINATE_UPLOAD,
                    reason:`${UPLOAD_ERROR_STATES.CREATE_CHUNK_ERROR}:terminated upload`,
                });
                return {
                    err,
                    chunks:[] as Chunks
                }
            }
            const end = Math.min(raw.size, (start + 1) * localChunkSize);
            const chunkname = `${hash}_${start}.${suffix}`;
            setOption({
                _progressGather:{
                    [chunkname]:0
                }
            })
            chunks.push({
                chunk: raw.slice(start * localChunkSize, end),
                chunkname,
            });
            start++;
        };
        return {
            err:void 0,
            chunks
        }
    };