import { SWRVConfig, useSWRV } from './swrv';

export function useFetchJSON<D>(
  request: string | (() => [RequestInfo, RequestInit]),
  config?: Partial<SWRVConfig<D>>
) {
  return useSWRV<D, typeof request>(request, fetchJSON, config);
}

async function fetchJSON(request: RequestInfo, init?: RequestInit) {
  return (await fetch(request, init)).json();
}
