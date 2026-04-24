import { spawn } from "node:child_process";

const child = spawn("npx", ["drizzle-kit", "push", "--force"], {
  stdio: ["pipe", "inherit", "inherit"],
  env: process.env,
});

let intervalId;
const start = Date.now();

child.on("spawn", () => {
  intervalId = setInterval(() => {
    if (!child.killed && child.stdin.writable) {
      child.stdin.write("\n");
      child.stdin.write("\r");
    }
  }, 800);
});

child.on("exit", (code) => {
  clearInterval(intervalId);
  const dur = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[push-auto] exited code=${code} in ${dur}s`);
  process.exit(code ?? 0);
});

setTimeout(() => {
  console.log("[push-auto] timeout 180s, killing");
  child.kill("SIGTERM");
}, 180000);
