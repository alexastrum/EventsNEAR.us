/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@vue/shared';
import { SWRVCache } from 'swrv';
import { markRaw, reactive, Ref, toRefs, UnwrapRef, watchEffect } from 'vue';

const defaultCache = new SWRVCache<CacheItem<unknown, unknown>>();

export type ArgsFromKey<A, K> = K extends () => any ? A : [K];

export type CacheItem<D, E> = {
  data: UnwrapRef<D>;
  error: UnwrapRef<E>;
  isValidating: UnwrapRef<boolean>;
};

export type SWRVResult<A, K, D, E> = {
  key: Ref<ArgsFromKey<A, K>>;
  data: Ref<D>;
  error: Ref<E>;
  isValidating: Ref<boolean>;
};

export type ObservableFn<D, E> = (subscriber: {
  next: (data: D) => void;
  error: (error: E) => void;
  complete: () => void;
}) => void | /* unsubscribe */ (() => void);

export interface SWRVConfig<D, E> {
  refreshInterval: number;
  cache?: SWRVCache<CacheItem<D, E>>;
  // dedupingInterval?: number
  ttl: number;
  // serverTTL?: number
  // revalidateOnFocus?: boolean
  // revalidateDebounce?: number
  shouldRetryOnError: boolean;
  errorRetryInterval: number;
  errorRetryCount: number;
  // fetcher?: Fn,
  // isOnline?: () => boolean
  // isDocumentVisible?: () => boolean
}

const defaultConfig: SWRVConfig<unknown, unknown> = {
  refreshInterval: 0,
  cache: defaultCache,
  ttl: 0,
  shouldRetryOnError: true,
  errorRetryInterval: 5000,
  errorRetryCount: 5,
};

export function useSWRV<
  A extends
    | [any]
    | [any, any]
    | [any, any, any]
    | [any, any, any, any]
    | [any, any, any, any, any],
  K extends string | (() => A | null | undefined),
  D extends object,
  E = Error
>(
  key: K,
  fn: (...args: ArgsFromKey<A, K>) => ObservableFn<D, E> | Promise<D> | D,
  config: Partial<SWRVConfig<D, E>> = {}
) {
  const conf = { ...(defaultConfig as SWRVConfig<D, E>), ...config };

  const result = reactive({
    key: undefined as ArgsFromKey<A, K> | undefined,
    data: undefined as D | undefined,
    error: undefined as E | undefined,
    isValidating: true,
    mutate: (data: Promise<D> | D) => mutate(key, data),
  });

  watchEffect((onInvalidate) => {
    const args = (isFunction(key) ? key() : [key]) as ArgsFromKey<A, K>;
    result.key = args as UnwrapRef<typeof args>;
    if (!args) {
      result.data = result.error = undefined;
      result.isValidating = false;
      return;
    }

    const hash = conf?.ttl ? conf.cache?.serializeKey(args) : undefined;
    const cachedItem = hash ? conf.cache?.get(hash) : undefined;
    const cachedResult = cachedItem
      ? cachedItem.data
      : reactive({
          data: undefined as D | undefined,
          error: undefined as E | undefined,
          isValidating: true,
        });

    // Reactively bind current result to the cached proxy
    result.data = cachedResult.data;
    result.error = cachedResult.error;
    result.isValidating = cachedResult.isValidating;

    if (hash) {
      if (cachedItem) {
        // No need to repeatedly revalidate already cached items.
        return;
      }
      // Add new items to the cache.
      conf.cache?.set(hash, cachedResult, conf.ttl || 0);
    }

    let handle: any;
    let unsubscribe: (() => void) | void;
    const tick = async () => {
      try {
        const data = await fn(...args);
        const observable = isFunction(data)
          ? data
          : ({
              next,
              complete,
            }: {
              next: (data: D) => void;
              complete: () => void;
            }) => {
              next(data);
              complete();
            };

        let errorRetryCount = -1;
        unsubscribe = observable({
          next: (next) => {
            cachedResult.data = markRaw(
              next as unknown as object
            ) as UnwrapRef<D>;
            cachedResult.error = undefined;
            if (hash) {
              conf.cache?.set(hash, cachedResult, conf?.ttl || 0);
            }
            errorRetryCount = -1;
          },
          error: (error) => {
            cachedResult.error = markRaw(
              error as unknown as object
            ) as UnwrapRef<E>;
            cachedResult.isValidating = false;
            errorRetryCount = 0;
          },
          complete: () => {
            if (errorRetryCount >= 0) {
              // Last event was `error`
              const interval = conf?.errorRetryInterval;
              if (
                interval &&
                conf.shouldRetryOnError &&
                errorRetryCount < conf.errorRetryCount
              ) {
                conf.errorRetryCount++;
                handle = setTimeout(() => void tick(), interval);
              }
            } else {
              // Last event was `next`
              const interval = conf.refreshInterval;
              if (interval) {
                handle = setTimeout(() => void tick(), interval);
              }
            }
          },
        });
      } catch (error) {
        cachedResult.error = markRaw(error as object) as UnwrapRef<E>;
        cachedResult.isValidating = false;
      }
    };
    void tick();

    onInvalidate(() => {
      if (unsubscribe) {
        unsubscribe();
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      clearTimeout(handle);
    });
  });

  return toRefs(result) as SWRVResult<A, K, D, E>;
}

export async function mutate<
  A extends
    | [any]
    | [any, any]
    | [any, any, any]
    | [any, any, any, any]
    | [any, any, any, any, any],
  K extends string | (() => A | null | undefined),
  D extends object,
  E = Error
>(
  key: K,
  data: D | Promise<D>,
  cache = defaultConfig.cache,
  ttl = defaultConfig.ttl
) {
  if (!cache) {
    return;
  }
  const args = (isFunction(key) ? key() : [key]) as ArgsFromKey<A, K>;
  if (!args) {
    return;
  }

  const hash = cache.serializeKey(args);
  const cacheItem = hash ? cache.get(hash) : undefined;
  const cachedResult = cacheItem
    ? cacheItem.data
    : reactive({
        data: undefined as D | undefined,
        error: undefined as E | undefined,
        isValidating: true,
      });

  try {
    cachedResult.data = markRaw<D>(await data);
  } catch (e) {
    cachedResult.error = markRaw(e as object);
  }
  cache.set(hash, cachedResult, ttl);
}
