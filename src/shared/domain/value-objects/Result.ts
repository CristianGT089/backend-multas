/**
 * Result monad for functional error handling
 * Permite manejar errores de forma funcional sin usar try/catch
 */
export class Result<T> {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly value?: T,
        public readonly error?: string
    ) {}

    /**
     * Crea un resultado exitoso
     */
    static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, value, undefined);
    }

    /**
     * Crea un resultado fallido
     */
    static fail<U>(error: string): Result<U> {
        return new Result<U>(false, undefined, error);
    }

    /**
     * Combina múltiples resultados
     * Si alguno falla, retorna el primero que falló
     */
    static combine(results: Result<any>[]): Result<void> {
        for (const result of results) {
            if (!result.isSuccess) {
                return Result.fail(result.error!);
            }
        }
        return Result.ok();
    }

    /**
     * Map sobre el valor si es exitoso
     */
    map<U>(fn: (value: T) => U): Result<U> {
        if (!this.isSuccess) {
            return Result.fail<U>(this.error!);
        }
        try {
            return Result.ok(fn(this.value!));
        } catch (error: any) {
            return Result.fail<U>(error.message);
        }
    }

    /**
     * FlatMap para encadenar operaciones que retornan Result
     */
    flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
        if (!this.isSuccess) {
            return Result.fail<U>(this.error!);
        }
        return fn(this.value!);
    }

    /**
     * Obtiene el valor o lanza error
     */
    getValue(): T {
        if (!this.isSuccess) {
            throw new Error(`Can't get value from failed result: ${this.error}`);
        }
        return this.value!;
    }

    /**
     * Obtiene el valor o retorna un valor por defecto
     */
    getValueOrDefault(defaultValue: T): T {
        return this.isSuccess ? this.value! : defaultValue;
    }
}
