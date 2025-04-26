type Callback = () => void;
export interface UseNextTick {
    ():(callback: Callback) => void
}