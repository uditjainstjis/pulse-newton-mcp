import { getDemoScenarioSnapshot } from "./newton-demo";
import { fetchLiveNewtonSnapshot } from "./newton-live";

const provider =
  process.env.NEWTON_PROVIDER ?? process.env.NEXT_PUBLIC_NEWTON_PROVIDER ?? "auto";

export async function getStudentSnapshot(options = {}) {
  const scenario = options.scenario ?? "founder";

  if (provider === "live") {
    return getLiveNewtonSnapshot();
  }

  if (provider === "demo") {
    return getDemoScenarioSnapshot(scenario);
  }

  try {
    return await getLiveNewtonSnapshot();
  } catch {
    return {
      ...getDemoScenarioSnapshot(scenario),
      source: {
        mode: "demo",
        provider: "demo-fallback",
        syncedAt: new Date().toISOString(),
        label: "Demo fallback",
      },
    };
  }
}

async function getLiveNewtonSnapshot() {
  return fetchLiveNewtonSnapshot();
}
