import type {
    Terminable,
} from './types';
import { useNextTick } from '../useNextTick/index';

const $nextTick = useNextTick();

export const useStoreTerminable = () => {
    const obj:Terminable =  {
        task:[],
        state:false,
        execute() {
            this.state = true;
            this.task.forEach(t=>t());
        },
        push(t) {
            this.task.push(t);
        },
        clear() {
            this.task.length = 0;
            $nextTick(()=>{
                this.state = false;
            })
        }
    }
    return obj;
}
