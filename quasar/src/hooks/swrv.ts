/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@vue/shared';
import { SWRVCache } from 'swrv';
import { markRaw, reactive, Ref, toRefs, UnwrapRef, watchEffect } from 'vue';

const cache = new SWRVCache();

export type ArgsFromKey<A, K> = K extends () => any ? A : [K];

export type SWRVResult<A, K, D, E> = {
  key: Ref<ArgsFromKey<A, K>>;
  data: Ref<D>;
  error: Ref<E>;
  isValidating: Ref<boolean>;
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
  fn: (...args: ArgsFromKey<A, K>) => Promise<D> | D,
  config?: {
    refreshInterval: number;
    ttl: number | null;
  }
) {
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

    const hash = config?.ttl !== null ? cache.serializeKey(args) : undefined;
    const cachedItem = hash ? cache.get(hash) : undefined;
    const cachedResult = cachedItem
      ? (cachedItem.data as typeof result)
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
      cache.set(hash, cachedResult, config?.ttl || 0);
    }

    let handle: any;
    const tick = async () => {
      try {
        const data = await fn(...args);
        cachedResult.data = markRaw(data as unknown as object) as UnwrapRef<D>;
        cachedResult.error = undefined;
        cachedResult.isValidating = false;
        if (hash) {
          cache.set(hash, cachedResult, config?.ttl || 0);
        }
        if (config?.refreshInterval) {
          handle = setTimeout(() => {
            void tick();
          }, config.refreshInterval);
        }
      } catch (e) {
        cachedResult.error = markRaw(e as object) as UnwrapRef<E>;
        cachedResult.isValidating = false;
      }
    };
    void tick();

    onInvalidate(() => {
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
>(key: K, data: D | Promise<D>, ttl = 0) {
  const args = (isFunction(key) ? key() : [key]) as ArgsFromKey<A, K>;
  if (!args) {
    return;
  }

  const hash = cache.serializeKey(args);
  const cacheItem = hash ? cache.get(hash) : undefined;
  const cachedResult = cacheItem
    ? (cacheItem.data as {
        data?: D;
        error?: E;
      })
    : reactive({
        data: undefined as D | undefined,
        error: undefined as E | undefined,
        isValidating: true,
      });

  try {
    cachedResult.data = markRaw<D>(await data);
  } catch (e) {
    cachedResult.error = markRaw(e as object) as UnwrapRef<E>;
  }
  cache.set(hash, cachedResult, ttl);
}
