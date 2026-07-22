/**
 * Run `worker` over every item while keeping at most `concurrency` of them in
 * flight at once — a sliding window rather than fixed batches.
 *
 * A fixed-batch approach (chunk into groups of N, `Promise.all` each group)
 * pays the slowest request's latency on every batch boundary: fast requests sit
 * idle waiting for their group's straggler before the next group starts. This
 * keeps the window continuously topped up — the instant one item resolves, the
 * next is started — so all `concurrency` slots stay busy until the work is done.
 *
 * Note: over HTTP/1.1 the browser still caps connections per host (~6), so the
 * effective ceiling is min(concurrency, browser cap). Serving the backend over
 * HTTP/2 removes that cap and lets `concurrency` take full effect.
 *
 * Errors from `worker` are the caller's responsibility to catch — an unhandled
 * rejection here aborts the whole run.
 */
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  const limit = Math.max(1, Math.min(concurrency || 1, items.length));
  let next = 0;

  const runner = async (): Promise<void> => {
    while (next < items.length) {
      const index = next++;
      await worker(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: limit }, () => runner()));
}
