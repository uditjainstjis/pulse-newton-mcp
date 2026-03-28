import Link from "next/link";

import { buildAutonomousPlan } from "@/lib/autopilot";
import { getStudentSnapshot } from "@/lib/newton-adapter";
import { buildIntelligence, getDataSources } from "@/lib/planner";

export const dynamic = "force-dynamic";

export default async function AutopilotPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const scenario = resolvedSearchParams?.scenario ?? "founder";
  const snapshot = await getStudentSnapshot({ scenario });
  const intelligence = buildIntelligence(snapshot);
  const dataSources = getDataSources();
  const concierge = buildAutonomousPlan(snapshot);

  return (
    <div className="grain min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="surface rounded-[36px] border border-white/80 px-5 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="eyebrow text-[var(--teal)]">Autonomous assignment concierge</p>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl">
                Order Newton work for you and highlight the exact windows that must move.
              </h1>
              <p className="text-base leading-7 text-slate-700">
                Pulse now pairs Newton MCP signals with an AI-style scheduler: the concierge ranks
                assignments, opens focus windows in your calendar, and shows a confidence meter
                so you know when to defend slack.
              </p>
            </div>

            <div className="flex flex-col gap-3 self-start">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                Scenario
              </p>
              <p className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm text-slate-800">
                {snapshot.source?.label || "Demo data"}
              </p>
              <Link
                href="/"
                className="text-xs font-mono uppercase tracking-[0.6em] text-[var(--accent)]"
              >
                back to dashboard
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <KeyStatCard
              label="Readiness"
              value={`${concierge.readiness}%`}
              note="Confidence that the current plan hurts risk and not momentum."
            />
            <KeyStatCard
              label="Backlog load"
              value={`${concierge.backlogHours}h`}
              note="Signal from Newton MCP backlog hours."
            />
            <KeyStatCard
              label="Focus hours"
              value={`${concierge.closingHours}h`}
              note="Autonomous windows planned this round."
            />
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-700">{concierge.summary}</p>
        </section>

        <section className="surface rounded-[36px] border border-white/80 px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-slate-500">Scheduled windows</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                Exact start + stop times for the next priority blocks
              </h2>
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Powered by Newton MCP timing
            </p>
          </div>

          {concierge.schedule.length === 0 ? (
            <div className="mt-6 rounded-[30px] bg-slate-900/90 px-5 py-6 text-center text-lg font-semibold text-white">
              You already cleared the queue. Protect this cadence by keeping momentum rituals intact.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {concierge.schedule.map((slot) => (
                <FocusWindowCard key={slot.id} slot={slot} />
              ))}
            </div>
          )}
        </section>

        <section className="surface rounded-[36px] border border-white/80 px-5 py-6">
          <div className="space-y-3">
            <p className="eyebrow text-slate-500">Signal alignment</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
              Why this autopilot sticks to Newton MCP
            </h2>
            <p className="text-sm leading-6 text-slate-700">
              Every window and priority reminder pulls from live MCP sources so reviewers can trace
              the decision back to assignments, lectures, and arena momentum.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataSources.map((source) => (
              <DataSourceCard key={source.source} item={source} />
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/60 bg-white/70 p-5">
            <p className="eyebrow text-slate-500">Momentum brief</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{intelligence.momentumBrief}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function KeyStatCard({ label, value, note }) {
  return (
    <article className="rounded-[30px] border border-white/60 bg-white/75 px-4 py-5 shadow-[0_12px_40px_rgba(18,32,41,0.06)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </article>
  );
}

function FocusWindowCard({ slot }) {
  return (
    <article className="rounded-[28px] border border-white/80 bg-slate-950/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500">
          {slot.priority}
        </span>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {slot.intensity}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-900">{slot.title}</h3>
      <p className="text-sm text-slate-600">{slot.module}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{slot.reason}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Window</p>
          <p className="font-semibold text-slate-900">{slot.window}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Due</p>
          <p className="font-semibold text-slate-900">{slot.dueLabel}</p>
        </div>
      </div>
    </article>
  );
}

function DataSourceCard({ item }) {
  return (
    <article className="rounded-[24px] border border-white/60 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
      <p className="mt-2 text-sm font-mono text-[var(--teal)]">{item.source}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.impact}</p>
    </article>
  );
}
