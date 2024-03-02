import { delay } from "https://deno.land/std@0.217.0/async/mod.ts";

Deno.serve(async (req: Request) => {
  switch (new URL(req.url).pathname) {
    case "/immutable":
      return new Response("a".repeat(20_000), {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
          "x-create-data-date-time": new Date().toISOString(),
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
  }
  return new Response("not found", { status: 404 });
});
