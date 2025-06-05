export interface IWorldErrorProps {
    name: string,
    message: string,
    cause?: any
}

// https://stackoverflow.com/questions/783818/how-do-i-create-a-custom-error-in-javascript
export class AppRuleError extends Error {
    public cause:any = null;

    constructor(props: IWorldErrorProps) {
        super();

        const { name, message, cause} = props;

        this.name = name;
        this.message = message;
        this.cause = cause;
    }

    [Symbol.iterator]() {
        let current = this;
        let done = false;
        const iterator = {
            next() {
                const val = current;
                if (done) {
                    return { value: val, done: true };
                }
                current = current.cause;
                if (!val.cause) {
                    done = true;
                }
                return { value: val, done: false };
            }
        };
        return iterator;
    }

    get why() {
        let _why = '';
        for (const e of this) {
            _why += `${_why.length ? ' <- ' : ''}${e.name}: ${e.message}`;
        }
        return _why;
    }
}