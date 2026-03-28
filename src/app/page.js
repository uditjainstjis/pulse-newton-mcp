import PulseDashboard from "../components/pulse-dashboard";
import { getStudentSnapshot } from "../lib/newton-adapter";
import {
  buildIntelligence,
  getDataSources,
  getIntegrationChecklist,
} from "../lib/planner";

export const dynamic = "force-dynamic";

export default async function Home() {
  const studentSnapshot = await getStudentSnapshot();
  const intelligence = buildIntelligence(studentSnapshot);
  const checklist = getIntegrationChecklist();
  const dataSources = getDataSources();

  return (
    <PulseDashboard
      snapshot={studentSnapshot}
      intelligence={intelligence}
      checklist={checklist}
      dataSources={dataSources}
    />
  );
}
