import type {
    RawFile,
    ERROR_RESPOSE
} from '@/types';
export type MesEvent =  MessageEvent<RawFile>;
export type R = { hash: string; suffix: string; filename: string };
export type MesBody = MessageEvent<{
    err:ERROR_RESPOSE;
    data:R;
}>