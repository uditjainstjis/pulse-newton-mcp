import { studentSnapshot } from "./newton-demo";
import { fetchLiveNewtonSnapshot } from "./newton-live";

const provider =
  process.env.NEWTON_PROVIDER ?? process.env.NEXT_PUBLIC_NEWTON_PROVIDER ?? "auto";

export async function getStudentSnapshot() {
  if (provider === "live") {
    return getLiveNewtonSnapshot();
  }

  if (provider === "demo") {
    return studentSnapshot;
  }

  try {
    return await getLiveNewtonSnapshot();
  } catch {
    return {
      ...studentSnapshot,
      source: {
        mode: "demo",
        provider: "demo-fallback",
        syncedAt: new Date().toISOString(),
        label: "Demo snapshot",
      },
    };
  }
}

async function getLiveNewtonSnapshot() {
  return fetchLiveNewtonSnapshot();
}
