import type {MesEvent} from './types';
import {genHash} from '../shared';

self.addEventListener("message", (e:MesEvent) => {
    const {data} = genHash(e.data)
    data.then(r=>self.postMessage({err:void 0,data:r}))
    .catch((err)=>self.postMessage({err,data:null}));
});
