import { delay } from "https://deno.land/std@0.217.0/async/mod.ts";

Deno.serve(async (req: Request) => {
  switch (new URL(req.url).pathname) {
    case "/immutable":
      console.log("immutable start");
      return new Response("ab".repeat(10_000), {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
          //   "x-create-data-date-time": new Date().toISOString(),
        },
      });
    case "/swr":
      console.log("start", req.headers);
      await delay(6000);
      console.log("end");

      return new Response(
        JSON.stringify({
          headers: Object.fromEntries(req.headers.entries()),
          date: new Date().toISOString(),
        }),
        {
          headers: {
            "content-type": "application/json",
            "cache-control":
              "public, s-maxage=10, stale-while-revalidate=86400",
          },
        }
      );
    case "/stream": {
      const body = new ReadableStream<Uint8Array>({
        start: async (controller) => {
          for (let i = 0; i < 100; i++) {
            console.log(i);
            controller.enqueue(new TextEncoder().encode(`${i}\n`));
            await delay(100);
          }
          controller.close();
        },
        cancel() {
          console.log("キャンセルは無視!");
        },
      });
      return new Response(body, {
        headers: {
          "content-type": "text/plain",
          "x-content-type-options": "nosniff",
        },
      });
    }
    case "/log": {
      const jsonBody = await req.json();
      console.log(jsonBody);
      return new Response(JSON.stringify(jsonBody), {
        headers: {
          "content-type": "application/json",
        },
      });
    }
  }
  return new Response("not found", { status: 404 });
});
