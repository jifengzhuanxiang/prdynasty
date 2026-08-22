import assert from "node:assert/strict";
import test from "node:test";

async function renderHome() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  return response.text();
}

test("renders the recruitment content contract", async () => {
  const html = await renderHome();

  assert.match(html, /把你的灵感[，,]做成校园里真正发生的作品/);
  for (const id of ["groups", "benefits", "stories", "faq", "join"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const group of ["摄影组", "平面设计组", "公众号组"]) {
    assert.match(html, new RegExp(group));
  }
  assert.match(html, /26 志联宣传部招新群/);
  assert.match(html, /8 月 28 日前有效/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /replace-with-your-email/);
});
