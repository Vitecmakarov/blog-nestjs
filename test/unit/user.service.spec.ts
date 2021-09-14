class CancelablePromiseInternal<T = any> {
  #internals: any;
  #promise: any;

  constructor({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    executor = () => {},
    internals = defaultInternals(),
    promise = new Promise((resolve, reject) =>
      executor(resolve, reject, (onCancel) => {
        internals.onCancelList.push(onCancel);
      }),
    ),
  }: {
    executor?: (
      resolve: (any) => void,
      reject: (reason?: any) => void,
      onCancel: (cancelHandler: () => void) => void,
    ) => void;
    internals?: any;
    promise?: any;
  }) {
    this.cancel = this.cancel.bind(this);
    this.#internals = internals;
    this.#promise =
      promise ||
      new Promise((resolve, reject) =>
        executor(resolve, reject, (onCancel) => {
          internals.onCancelList.push(onCancel);
        }),
      );
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any): CancelablePromise {
    return makeCancelable(
      this.#promise.then(
        createCallback(onfulfilled, this.#internals),
        createCallback(onrejected, this.#internals),
      ),
      this.#internals,
    );
  }

  catch(onrejected?: (reason: any) => any): CancelablePromise {
    return makeCancelable(
      this.#promise.catch(createCallback(onrejected, this.#internals)),
      this.#internals,
    );
  }

  finally(
    onfinally?: (() => void) | undefined | null,
    runWhenCanceled?: boolean,
  ): CancelablePromise {
    if (runWhenCanceled) {
      this.#internals.onCancelList.push(onfinally);
    }
    return makeCancelable(
      this.#promise.finally(
        createCallback(() => {
          if (onfinally) {
            if (runWhenCanceled) {
              this.#internals.onCancelList = this.#internals.onCancelList.filter(
                (callback) => callback !== onfinally,
              );
            }
            return onfinally();
          }
        }, this.#internals),
      ),
      this.#internals,
    );
  }

  cancel(): void {
    this.#internals.isCanceled = true;
    const callbacks = this.#internals.onCancelList;
    this.#internals.onCancelList = [];
    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        try {
          callback();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  isCanceled(): boolean {
    return this.#internals.isCanceled === true;
  }
}

export class CancelablePromise extends CancelablePromiseInternal {
  static all = function all(iterable: any) {
    return makeAllCancelable(iterable, Promise.all(iterable));
  };

  static race = function race(iterable) {
    return makeAllCancelable(iterable, Promise.race(iterable));
  };

  static resolve = function resolve(value) {
    return cancelable(Promise.resolve(value));
  };

  static reject = function reject(reason) {
    return cancelable(Promise.reject(reason));
  };

  static isCancelable = isCancelablePromise;

  constructor(
    executor: (
      resolve: (value: any) => void,
      reject: (reason?: any) => void,
      onCancel: (cancelHandler: () => void) => void,
    ) => void,
  ) {
    super({ executor });
  }
}

export function cancelable(promise: Promise<any>): any {
  return makeCancelable(promise, defaultInternals());
}

export function isCancelablePromise(promise: any): boolean {
  return promise instanceof CancelablePromise || promise instanceof CancelablePromiseInternal;
}

function createCallback(onResult: any, internals: any) {
  if (onResult) {
    return (arg?: any) => {
      if (!internals.isCanceled) {
        const result = onResult(arg);
        if (isCancelablePromise(result)) {
          internals.onCancelList.push(result.cancel);
        }
        return result;
      }
      return arg;
    };
  }
}

function makeCancelable(promise: Promise<any>, internals: any) {
  return new CancelablePromiseInternal({
    internals,
    promise,
  }) as CancelablePromise;
}

function makeAllCancelable(iterable: any, promise: Promise<any>) {
  const internals = defaultInternals();
  internals.onCancelList.push(() => {
    for (const resolvable of iterable) {
      if (isCancelablePromise(resolvable)) {
        resolvable.cancel();
      }
    }
  });
  return new CancelablePromiseInternal({ internals, promise });
}

function defaultInternals(): any {
  return { isCanceled: false, onCancelList: [] };
}

describe('CancelablePromise test', () => {
  test('throws on wrong constructor arguments', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new CancelablePromise()).toThrowError();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new CancelablePromise('wrong')).toThrowError();
  });

  test('create cancelable promise', () => {
    let isCompleted = false;
    const promise = new CancelablePromise(() => (isCompleted = true));
    expect(promise).toBeInstanceOf(CancelablePromiseInternal);
    expect(isCompleted).toBe(true);
  });

  test('resolving', async () => {
    const unique = Symbol();
    const promise = new CancelablePromise((resolve) => setTimeout(() => resolve(unique)));
    await expect(promise).resolves.toBe(unique);
  });

  test('rejecting', async () => {
    const unique = Symbol();
    const promise = new CancelablePromise((resolve, reject) => setTimeout(() => reject(unique)));
    await expect(promise).rejects.toBe(unique);
  });

  describe('#then()', () => {
    test('throws on wrong argument', () => {
      const promise = new CancelablePromise(() => void 0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => promise.then('wrong')).toThrowError();
    });

    test('then(onFulfilled)', async () => {
      const initValue = 10;
      const multiplier = 2;
      const onFulfilled = (value) => value * multiplier;

      const cp = new CancelablePromise((resolve) => resolve(initValue));
      const cp2 = cp.then((v) => {
        return new Promise((resolve) => setTimeout(() => resolve(onFulfilled(v))));
      });

      expect(cp).not.toBe(cp2);
      expect(cp2).toBeInstanceOf(CancelablePromiseInternal);
      await getPromiseState(cp2, (state) => expect(state).toBe('pending'));
      await expect(cp).resolves.toBe(initValue);
      await expect(cp2).resolves.toBe(onFulfilled(initValue));
    });

    test('then(onFulfilled, onRejected)', async () => {
      const initValue = 10;
      const multiplier = 2;
      const func = (value) => value * multiplier;

      const cp = new CancelablePromise((resolve) => resolve(initValue));
      const cp2 = cp.then((value) => Promise.reject(value), func);

      expect(cp).not.toBe(cp2);
      expect(cp2).toBeInstanceOf(CancelablePromiseInternal);
      await expect(cp).resolves.toBe(initValue);
      await expect(cp2).resolves.toBe(func(initValue));
    });

    test('then() - empty arguments', async () => {
      const initValue = 10;
      const cp = new CancelablePromise((resolve) => resolve(initValue)).then();

      expect(cp).toBeInstanceOf(CancelablePromiseInternal);
      await expect(cp).resolves.toBe(initValue);
    });

    test('.then().then() ... .then()', async () => {
      const depth = 10;
      let promise = new CancelablePromise((resolve) => resolve(0));
      for (let idx = 0; idx < depth; ++idx) {
        promise = promise.then((val) => val + 1);
      }

      expect(promise).toBeInstanceOf(CancelablePromiseInternal);
      await expect(promise).resolves.toBe(depth);
    });
  });

  describe('#cancel()', () => {
    test('should cancel promise', async () => {
      let value = 0;
      const promise = new CancelablePromise((resolve) => setTimeout(() => resolve(1), 100)).then(
        (v) => (value = v),
      );
      const promiseState = await getPromiseState(promise, () => {
        console.log('aa');
      });

      expect(promiseState).toBe('pending');
      expect(typeof promise.cancel).toBe('function');

      setTimeout(() => promise.cancel());

      await expect(promise).rejects.toHaveProperty('isCanceled', true);
      expect(value).toBe(0);
    });
  });

  describe('#isCanceled', () => {
    test('should change state on cancel()', () => {
      const promise1 = new CancelablePromise((resolve) => resolve(1));
      const promise2 = promise1.then(() => 2);

      expect(typeof promise1.isCanceled).toBe('boolean');
      expect(typeof promise2.isCanceled).toBe('boolean');
      expect(promise1.isCanceled).toBeFalsy();
      expect(promise2.isCanceled).toBeFalsy();

      promise2.cancel();

      expect(promise1.isCanceled).toBeTruthy();
      expect(promise2.isCanceled).toBeTruthy();
    });
  });
});

function getPromiseState(promise, callback) {
  const unique = Symbol('unique');
  return Promise.race([promise, Promise.resolve(unique)])
    .then((value) => (value === unique ? 'pending' : 'fulfilled'))
    .catch(() => 'rejected')
    .then((state) => {
      callback && callback(state);
      return state;
    });
}

// class CancelablePromiseInternal {
//   #internals: any;
//   #promise: Promise<any>;
//
//   constructor({
//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     executor = () => {},
//     internals = defaultInternals(),
//     promise = new Promise<any>((resolve, reject) =>
//       executor(resolve, reject, (onCancel) => {
//         internals.onCancelList.push(onCancel);
//       }),
//     ),
//   }: {
//     executor?: (
//       resolve: (value: any | PromiseLike<any>) => void,
//       reject: (reason?: any) => void,
//       onCancel: (cancelHandler: () => void) => void,
//     ) => void;
//     internals?: any;
//     promise?: Promise<any>;
//   }) {
//     this.cancel = this.cancel.bind(this);
//     this.#internals = internals;
//     this.#promise =
//       promise ||
//       new Promise<any>((resolve, reject) =>
//         executor(resolve, reject, (onCancel) => {
//           internals.onCancelList.push(onCancel);
//         }),
//       );
//   }
//
//   then(onfulfilled?: any, onrejected?: any): CancelablePromise {
//     return makeCancelable(
//       this.#promise.then(
//         createCallback(onfulfilled, this.#internals),
//         createCallback(onrejected, this.#internals),
//       ),
//       this.#internals,
//     );
//   }
//
//   catch(onrejected?: any): CancelablePromise {
//     return makeCancelable(
//       this.#promise.catch(createCallback(onrejected, this.#internals)),
//       this.#internals,
//     );
//   }
//
//   finally(onfinally?: any, runWhenCanceled?: boolean): CancelablePromise {
//     if (runWhenCanceled) {
//       this.#internals.onCancelList.push(onfinally);
//     }
//     return makeCancelable(
//       this.#promise.finally(
//         createCallback(() => {
//           if (onfinally) {
//             if (runWhenCanceled) {
//               this.#internals.onCancelList = this.#internals.onCancelList.filter(
//                 (callback) => callback !== onfinally,
//               );
//             }
//             return onfinally();
//           }
//         }, this.#internals),
//       ),
//       this.#internals,
//     );
//   }
//
//   cancel(): void {
//     this.#internals.isCanceled = true;
//     const callbacks = this.#internals.onCancelList;
//     this.#internals.onCancelList = [];
//     for (const callback of callbacks) {
//       if (typeof callback === 'function') {
//         try {
//           callback();
//         } catch (err) {
//           console.error(err);
//         }
//       }
//     }
//   }
//
//   isCanceled(): boolean {
//     return this.#internals.isCanceled === true;
//   }
// }

// class CancelablePromise extends CancelablePromiseInternal {
//   static race = function race(iterable) {
//     return makeAllCancelable(iterable, Promise.race(iterable));
//   };
//
//   static resolve = function resolve(value) {
//     return cancelable(Promise.resolve(value));
//   };
//
//   static reject = function reject(reason) {
//     return cancelable(Promise.reject(reason));
//   };
//
//   static isCancelable = isCancelablePromise;
//
//   constructor(
//     executor: (
//       resolve: (value: any) => void,
//       reject: (reason?: any) => void,
//       onCancel: (cancelHandler: () => void) => void,
//     ) => void,
//   ) {
//     super({ executor });
//   }
// }
//
// function cancelable<T = any>(promise: Promise<T>): CancelablePromise {
//   return makeCancelable(promise, defaultInternals());
// }
//
// function isCancelablePromise(promise: any): boolean {
//   return promise instanceof CancelablePromise || promise instanceof CancelablePromiseInternal;
// }
//
// function createCallback(onResult: any, internals: any) {
//   if (onResult) {
//     return (arg?: any) => {
//       if (!internals.isCanceled) {
//         const result = onResult(arg);
//         if (isCancelablePromise(result)) {
//           internals.onCancelList.push(result.cancel);
//         }
//         return result;
//       }
//       return arg;
//     };
//   }
// }
//
// function makeCancelable(promise: Promise<any>, internals: any) {
//   return new CancelablePromiseInternal({
//     internals,
//     promise,
//   }) as CancelablePromise;
// }
//
// function makeAllCancelable(iterable: any, promise: Promise<any>) {
//   const internals = defaultInternals();
//   internals.onCancelList.push(() => {
//     for (const resolvable of iterable) {
//       if (isCancelablePromise(resolvable)) {
//         resolvable.cancel();
//       }
//     }
//   });
//   return new CancelablePromiseInternal({ internals, promise });
// }
//
// function defaultInternals(): any {
//   return { isCanceled: false, onCancelList: [] };
// }
