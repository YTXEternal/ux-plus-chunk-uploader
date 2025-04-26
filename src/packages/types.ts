
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {UseNextTick} from './hooks/types';
import { useControl } from './hooks/useControl';

export type Control = ReturnType<typeof useControl>;

export type ErrorType = 'get-chunks-error' | 'upload-chunk-error' | 'merge-chunks-error' | 'create-hash-error' | 'file-error'|'terminate-upload'|'create-chunk-error';

export type ERROR_RESPOSE<T = any> = {
    type: ErrorType;
    reason: string;
    err?: T;
};


export type RawFile = File;
export type requestConfig<T> = {
    instance: T;
}

export interface OnReponse<T, U> {
    (response: AxiosResponse<T>): U;
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
    [P in keyof T]?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};




export type UploadError<T = ErrorEvent> = ERROR_RESPOSE<T>;

export type HasNull<T> = T | null;
export type Chunks = Array<{
    chunk: Blob;
    chunkname: string;
}>;



export type UploadChunkSetParams = Record<string,any> & {
    dirname:string;
    chunkname:string;
    chunk:Blob;
};
// Uploading Slices, and Merging Slices
export type RequestFunc = {
    getChunk: (url: string, hash: string) => Promise<string[]>;
    uploadChunk: (opt: { formData: FormData, url: string,taskIndex:number }) => Promise<number>;
    merge: (url: string, opt: { hash: string; chunkcount: number; filename: string } ) => Promise<number>;
}

export type UploadMergeSetParams = Parameters<RequestFunc["merge"]>[1] & Record<string,any>;

export type SetParamsAssemble = {
    uploadChunk:(chunkInfo:UploadChunkSetParams)=> Record<string,any>;
    merge:(mergeParams:UploadMergeSetParams)=>UploadMergeSetParams;
    getChunks:(hash:string)=>Record<string,any>;
}


export type RequestUploadChunk = {
    (r:AxiosResponse):number;
}
export type RequestMerge = {
    (r:AxiosResponse):number;
}
export type RequestGetChunks = {
    (r:AxiosResponse):{
        code:200,
        data:string[]
    };
}

export type OptionsRequestConfig = {
    instance?: AxiosInstance;
    uploadChunk: {
        url: string;
        onResponse?: RequestUploadChunk;
        setParams?:SetParamsAssemble['uploadChunk'];
    };
    merge: {
        url: string;
        onResponse?: RequestMerge;
        setParams?:SetParamsAssemble['merge'];
    }
    getChunks?: {
        url: string;
        onResponse?: RequestGetChunks;
        setParams?:SetParamsAssemble['getChunks'];
    }
}



export interface OnProgress {
    (v: number): void;
}


export type UploaderConfig = {
    chunkSize: number;
    limit: number;
    max: number;
    onProgress: OnProgress;
}

export type Options  = {
    requestConfig: OptionsRequestConfig;
    uploadConfig?: Partial<UploaderConfig>;
}

export interface CreateChunks {
    (options: { raw: RawFile; hash: string; suffix: string; chunkSize: number; max: number; }): {
        chunks:Chunks;
        is:boolean;
    }
}

export interface CreateHash {
    (raw: RawFile): Promise<{
        hash: string;
        suffix: string;
        filename: string;
    }>
}

type ChunkBasic = {
    chunks: Chunks;
    hash: string;
    filename:string
}

export interface UploadChunks {
    (options: ChunkBasic & { limit: number;onProgress?: OnProgress;count:number; }): Promise<any>;
}

export interface _GetChunks {
    (options: ChunkBasic): Promise<ChunkBasic & { count:number;}>;
}

export interface TriggerUpload {
    (file: RawFile, opt?: Partial<UploaderConfig>): {
        terminate: () => void;
        response: Promise<undefined>;
    };
}


export type ChunkUploaderProps = {
    options: Partial<Options> | null;
}

export type PrivateChunkUploaderProps = {
    chunkcount: number;
    progressGather: Record<string, number>;
    requestFunc: RequestFunc | null;
    control: Control;
}

export type ChunkUploaderMethods = {
    triggerUpload: TriggerUpload;
    setOptions:(options: Partial<Options>) =>void;
} 
export interface UxChunkUploaderTools {
    $nextTick:ReturnType<UseNextTick>;
}

export interface ChunkUploader extends ChunkUploaderProps,ChunkUploaderMethods,UxChunkUploaderTools {};



export type _SetOption = (options:Record<string,any>)=>void;



