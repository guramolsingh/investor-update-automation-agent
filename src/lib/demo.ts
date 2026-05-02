import fs from "node:fs/promises";
import path from "node:path";
import { runPipeline } from "@/lib/pipeline";
import type { RawInput } from "@/lib/schemas";

async function main() {
  const examplePath = path.join(process.cwd(), "examples", "growth-quarter.json");
  const rawInput = JSON.parse(await fs.readFile(examplePath, "utf8")) as RawInput;
  const result = await runPipeline({ rawInput, llmMode: "mock" });

  console.log("Investor Update Automation Agent demo");
  console.log(`Stages executed: ${result.traces.map((trace) => trace.stage).join(" -> ")}`);
  console.log("");
  console.log(result.formatted?.markdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
