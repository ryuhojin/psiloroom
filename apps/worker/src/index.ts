const tick = () => {
  const timestamp = new Date().toISOString();
  console.log(`[worker] heartbeat ${timestamp}`);
};

console.log("[worker] PSILO background worker booted");
tick();

setInterval(tick, 30_000);
