import  {CanceledError} from 'axios';
import {UPLOAD_ERROR_STATES} from '../constant';
import type {ErrorType} from '@/types';
export const findSuffix = (filename: string) => {
    if(typeof filename !== 'string') {
        return void 0;
    }
    const lastIndex = filename.lastIndexOf('.');
    return filename.substring(lastIndex + 1);
};

export const headers = {
    'Content-Type': 'multipart/form-data'
};


/**
 * Loop through the object
 *
 * @template T 
 * @param {T} obj 
 * @param {(v: T[keyof T], k: keyof T) => void} cb 
 * @returns {void) => void} 
 */
export const objFor = <T>(obj: T, cb: (v: T[keyof T], k: keyof T) => void) => {
    const has = Object.prototype.hasOwnProperty;
    for (const key in obj) {
        if (has.call(obj, key)) {
            cb(obj[key], key);
        }
    }
};

/**
 * Check if it is of type Object
 *
 * @template T 
 * @param {T} target 
 * @returns {boolean} 
 */
export const isObject = <T>(target: T) => Object.prototype.toString.call(target) === '[object Object]';

export const mergeOptions = <T>(target: T, source: T) => {
    if(!isObject(source)) return target as Required<T>;
    if(!target) {
        return void 0;
    }
    objFor(source,
        (v, k) => isObject(v) ? 
        (mergeOptions(target, v as T))
        : ( v === null || v === void 0 ? (null) :
         (target[k] = v as NonNullable<T>[keyof T]))
    )
    return target as Required<T>;
}

export const ToM = (n:number) => 1024*1024*n;


/**
 * Normalize error format
 *
 * @param {{ type: ErrorType, reason: string, err?: Error }} param0 
 * @param {ErrorType} param0.type 
 * @param {string} param0.reason 
 * @param {Error} param0.err 
 * @param {?()=>void} [callback] 
 * @returns {void) => any} 
 */
export const callReject = ({ type, reason, err }: { type: ErrorType, reason: string, err?: Error },callback?:()=>void) => {
    if(callback) callback();
    return Promise.reject({
        type,
        reason,
        err
    });
};



/**
 * Handle axios request cancellation errors
 *
 * @template T 
 * @param {T} err 
 * @param {()=>void} callback 
 * @returns {void) => any} 
 */
export const handleCanceledError = <T>(err: T,callback:()=>void) => {
      if (err instanceof CanceledError)
        return callReject({
          type: UPLOAD_ERROR_STATES.TERMINATE_UPLOAD,
          err,
          reason: err.message,
        });
      return callback();
};

type callTypeofResponse = 'object'|'array'|'string'|'boolean'|'function'|'null'|'regexp'|'bigint'|'symbol'|undefined;
export function callTypeof<T>(target:T):callTypeofResponse {
    const map = new Map<string, string>([
        ['[object Object]', 'object'],
        ['[object Array]', 'array'],
        ['[object String]', 'string'],
        ['[object Number]', 'number'],
        ['[object Boolean]', 'boolean'],
        ['[object Function]', 'function'],
        ['[object Null]', 'null'],
        ['[object Undefined]', 'undefined'],
        ['[object Date]', 'date'],
        ['[object RegExp]', 'regexp'],
        ['[object Bigint]', 'bigint'],
        ['[object Symbol]', 'symbol'],
    ]);
    const typeStr = Object.prototype.toString.call(target);
    return map.get(typeStr) as callTypeofResponse;
}

type AnyFunction = (...args: any[]) => any;

/**
 *
 * @template {AnyFunction} T 
 * @param {T} f 
 * @param {?T} [g] 
 * @returns {T} 
 */
export const isExistF = <T extends AnyFunction>(f:T,g?:T) =>{
    if(g) {
      return g; 
    } return f;
};


