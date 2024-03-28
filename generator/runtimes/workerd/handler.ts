import type { Request as WorkerRequest } from "@cloudflare/workers-types/experimental";
import { runTests, formatResults } from "../../shared/test.js";
import tests from "../../../vendor/tests.json" assert { type: "json" };
import packageJson from "./package.json" assert { type: "json" };

interface Env {
  unsafe: {
    eval: typeof eval;
  };
}

const rawVersion = packageJson.devDependencies["workerd"].split(".")[1];
const formattedVersion = `${rawVersion.substr(0, 4)}-${rawVersion.substr(4, 2)}-${rawVersion.substr(6, 2)}`;

export default {
  async fetch(req: WorkerRequest, env: Env) {
    if (req.method === "HEAD") {
      return new Response(undefined, { status: 200 });
    }
    globalThis.eval = env.unsafe.eval.bind(env.unsafe);
    const results = await runTests(tests);
    const data = formatResults(
      results,
      { name: "workerd", version: formattedVersion },
      tests.__version,
    );
    return new Response(JSON.stringify(data, undefined, 2));
  },
};
