import PulseDashboard from "../components/pulse-dashboard";
import { getStudentSnapshot } from "../lib/newton-adapter";
import { getDemoScenarios } from "../lib/newton-demo";
import {
  buildIntelligence,
  getDataSources,
  getIntegrationChecklist,
} from "../lib/planner";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const scenario = resolvedSearchParams?.scenario ?? "founder";

  const studentSnapshot = await getStudentSnapshot({ scenario });
  const intelligence = buildIntelligence(studentSnapshot);
  const checklist = getIntegrationChecklist();
  const dataSources = getDataSources();
  const demoScenarios = getDemoScenarios();

  return (
    <PulseDashboard
      snapshot={studentSnapshot}
      intelligence={intelligence}
      checklist={checklist}
      dataSources={dataSources}
      reviewOptions={{
        activeScenario: scenario,
        scenarios: demoScenarios,
      }}
    />
  );
}
