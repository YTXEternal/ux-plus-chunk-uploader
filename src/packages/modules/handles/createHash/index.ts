import type { CreateHash, UploadError } from "@/types";
// @ts-ignore
import CreateHashWorker from "./worker/index?worker&inline";
import type { MesBody } from "./worker/types";
import type { Terminable } from '@/hooks/types';
import { genHash } from "./shared";
import { UPLOAD_ERROR_STATES } from '@/constant';
        

export const createHash = (
    file: Parameters<CreateHash>[0],
    addTerminable: Terminable["push"]
): Promise<{
    hash: string;
    filename: string;
    suffix: string;
}> => {
    const win = window;
    return new Promise(
        (
            resolve: (value: {
                hash: string;
                suffix: string;
                filename: string;
            }) => void,
            reject: (reason: UploadError) => void
        ) => {
            const handleWorker = () => {
                const createHashWorker = new CreateHashWorker();
                createHashWorker?.postMessage(file);
                const terminateWorker = () => {
                    createHashWorker.terminate();
                }
                addTerminable(() => {
                    terminateWorker();
                    reject({
                        type:UPLOAD_ERROR_STATES.TERMINATE_UPLOAD,
                        reason:`${UPLOAD_ERROR_STATES.CREATE_HASH_ERROR}:terminated upload`
                    })
                });
                createHashWorker.onmessage = (e: MesBody) => {
                    const { err, data } = e.data;
                    if (err) {
                        terminateWorker();
                        return reject(err);
                    }
                    resolve(data);
                };
                
                createHashWorker.onerror = (err:ErrorEvent) => {
                    terminateWorker();
                    reject({
                        type: UPLOAD_ERROR_STATES.CREATE_HASH_ERROR,
                        err,
                        reason: err.message,
                    });
                };
            };
        const handle = () => {
                const { data, abort } = genHash(file);
                addTerminable(abort);
                data
                .then((r) => resolve(r))
                .catch(reject);
            };
            win.Worker ? handleWorker() : handle();
       }
    );
};
