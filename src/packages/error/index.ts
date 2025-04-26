// retain it
import {callTypeof} from '@/shared';
type ErrorParams = Parameters<typeof Error>;
type TypeErrorParams = Parameters<typeof TypeError>;
import type {ErrorType} from '@/types';

export function throwError(message:ErrorParams[0],options?:ErrorParams[1]):void {
   throw new Error(message,options);
}

export function throwTypeError(...args:TypeErrorParams) {
    const message  = args[0];
    const options = args[1];
   throw new TypeError(message,options);
}

export function examineType<T>(target:T,expectType:'object'|'array'|'string'|'number'|'null'|'bigint'|'symbol'|'function') {
    const r_type = callTypeof(target);
    return r_type === expectType 
};

export class UxPlusUploderError extends Error {
    type:ErrorType;
    constructor(message: string,type:ErrorType) {
        super(message); 
        this.name = "UxPlusUploderError";
        this.type = type;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UxPlusUploderError);
        }
    }
}