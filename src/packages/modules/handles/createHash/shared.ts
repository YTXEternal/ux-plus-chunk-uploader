import SparkMD5 from 'spark-md5';
import { findSuffix } from '@/shared/index';
import type {
    RawFile,
    ERROR_RESPOSE
} from '@/types';
import type {TerminableTaskItem} from '@/hooks/types';
import { UPLOAD_ERROR_STATES } from '@/constant';


export const genHash = (file:RawFile) => {
    let abort:TerminableTaskItem|null = null;
    const p = new Promise((resolve:(value:{hash:string,suffix:string,filename:string})=>void,reject:(err: ERROR_RESPOSE)=>void)=>{
        const spark:SparkMD5.ArrayBuffer|null = new SparkMD5.ArrayBuffer();
        const filereander = new FileReader();
        filereander.readAsArrayBuffer(file);
        const handleResove = (hash:string) => {
            const suffix = findSuffix(file.name)!;
            return {
                hash,
                suffix,
                filename: `${hash}.${suffix}`
            };
        };
        filereander.onload = function (this: InstanceType<typeof FileReader>,e) {
            const result = e.target!.result as ArrayBuffer;
            spark!.append(result);
            const hash = spark!.end();
            const value = handleResove(hash);
            resolve(value);
        };
        filereander.onerror = (err) => {
            reject({
                type:UPLOAD_ERROR_STATES.CREATE_HASH_ERROR,
                reason:'filereander.onerror',
                err,
            });
        };
        abort = () => {
            reject({
                type:UPLOAD_ERROR_STATES.TERMINATE_UPLOAD,
                reason:`${UPLOAD_ERROR_STATES.CREATE_HASH_ERROR}:terminated upload`
            });
            filereander.abort();
        }
    });

    return {
        data:p,
        abort:abort!
    }
}
    