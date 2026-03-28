import { getStudentSnapshot } from "../../../../lib/newton-adapter";
import { buildIntelligence, getDataSources } from "../../../../lib/planner";

export async function GET() {
  const snapshot = await getStudentSnapshot();
  const intelligence = buildIntelligence(snapshot);
  const dataSources = getDataSources();

  return Response.json({
    snapshot,
    intelligence: {
      healthScore: intelligence.healthScore,
      riskScore: intelligence.riskScore,
      nextEvent: intelligence.nextEvent,
      momentumBrief: intelligence.momentumBrief,
      dailyPlan: intelligence.dailyPlan,
      recoveryPlan: intelligence.recoveryPlan,
      practiceQueue: intelligence.practiceQueue,
      frictionMap: intelligence.frictionMap,
      weekForecast: intelligence.weekForecast,
      focusBlueprints: intelligence.focusBlueprints,
    },
    dataSources,
  });
}
