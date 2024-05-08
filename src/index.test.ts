import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";

describe("Worker", () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it("should return only POST supported", async () => {
    const resp = await worker.fetch();
    if (resp) {
      const text = await resp.text();
      expect(text).toEqual(
        JSON.stringify({ message: "Only POST requests are supported" })
      );
    }
  });
});
