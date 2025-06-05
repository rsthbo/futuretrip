import { useEffect, useState } from "react";
import { isFunction } from "./basics";

export const useOnce = callback => {
    const [ firstime, setFirsttime ] = useState(true);

    if (firstime) {
        callback();
        setFirsttime(false);
    }
}

export const useWhenChanged = (observedValue, callback) => {
    if (isFunction(observedValue)) {
        const [value, setValue] = useState(observedValue());

        if (value !== observedValue()) {
            callback(value);
            setValue(observedValue());
        }
    } else {
        const [value, setValue] = useState(observedValue);

        if (value !== observedValue) {
            callback(value);
            setValue(observedValue);
        }
    }
}


export const useOnceWhen = (condition, callback, dependencies = []) => {
    const [ firstime, setFirsttime ] = useState(true);
    const [ mounted, setMounted ] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (dependencies.length > 0) {
            setFirsttime(true);
        }
    }, dependencies);

    if (mounted && condition()) {
        if (firstime) {
            callback();
            setFirsttime(false);
        }
    }
}