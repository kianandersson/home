export type DelayOptions = {
  signal?: AbortSignal;
};

export function delay(
  milliseconds: number,
  { signal }: DelayOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Aborted", "AbortError"));

    const timeout = setTimeout(resolve, milliseconds);

    if (signal)
      signal.addEventListener(
        "abort",
        function () {
          clearTimeout(timeout);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
  });
}
