"use client";

import { startTransition, useDeferredValue, useState } from "react";

const riskTone = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

const objectiveLabels = {
  deadlines: "Protect deadlines",
  recovery: "Repair weak spots",
  momentum: "Build momentum",
};

export default function PulseDashboard({
  snapshot,
  intelligence,
  checklist,
  dataSources,
}) {
  const commands = Object.keys(intelligence.commandResponses);
  const durations = [...new Set(intelligence.focusBlueprints.map((plan) => plan.minutes))];
  const objectives = Object.keys(objectiveLabels);

  const [selectedCommand, setSelectedCommand] = useState(commands[0]);
  const [selectedSprint, setSelectedSprint] = useState(
    intelligence.sprintOptions[1].label,
  );
  const [selectedDuration, setSelectedDuration] = useState(durations[2]);
  const [selectedObjective, setSelectedObjective] = useState("recovery");

  const deferredCommand = useDeferredValue(selectedCommand);

  const sprintPlan =
    intelligence.sprintOptions.find((option) => option.label === selectedSprint) ??
    intelligence.sprintOptions[0];

  const blueprint =
    intelligence.focusBlueprints.find(
      (plan) =>
        plan.minutes === selectedDuration && plan.objective === selectedObjective,
    ) ?? intelligence.focusBlueprints[0];

  return (
    <div className="grain min-h-screen">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="surface-strong rise-in overflow-hidden rounded-[36px]">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.32fr_0.88fr] lg:px-8 lg:py-10">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow text-[var(--accent)]">Pulse / Newton MCP copilot</p>
                  <h1 className="text-balance max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-7xl">
                    A student operating system that tells you what matters next.
                  </h1>
                </div>
                <div className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 font-mono text-xs text-slate-600">
                  {snapshot.source?.label || "Built for live Newton data"}
                </div>
              </div>

              <p className="text-balance max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                Pulse turns Newton signals into a daily brief, a workload forecast, and a
                concrete intervention plan. The product is not trying to be another
                analytics dashboard. It is trying to lower student decision fatigue.
              </p>

              <div className="flex flex-wrap gap-3">
                <SignalPill label="Next move" value={intelligence.topAssignment.module} />
                <SignalPill
                  label="Main drag"
                  value={intelligence.frictionMap[0].label}
                />
                <SignalPill
                  label="Recovery window"
                  value={`${snapshot.signals.recoveryHoursAvailable}h this week`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Academic health"
                  value={`${intelligence.healthScore}`}
                  suffix="/100"
                  note="Progress exists, but reliability is being eaten by backlog."
                />
                <MetricCard
                  label="Risk pressure"
                  value={`${intelligence.riskScore}`}
                  suffix="/100"
                  note="This is the score judges should care about because it predicts slippage."
                />
                <MetricCard
                  label="Backlog runway"
                  value={`${snapshot.signals.backlogHours}`}
                  suffix="h"
                  note="Compress this under 3h and the semester feels lighter immediately."
                />
              </div>
            </div>

            <div className="ink-panel flex flex-col justify-between rounded-[30px] px-5 py-5 sm:px-6 sm:py-6">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-orange-200">Student profile</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {snapshot.student.name}
                    </h2>
                  <p className="mt-1 text-sm text-slate-300">
                      {snapshot.course.title} / {snapshot.student.targetRole}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/8 px-3 py-2 text-right">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300">
                      Next event
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {intelligence.nextEvent.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {intelligence.nextEventSummary}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniStat label="XP" value={snapshot.metrics.xp.toLocaleString()} />
                  <MiniStat label="Rank" value={`#${snapshot.metrics.rank}`} />
                  <MiniStat
                    label="Attendance"
                    value={`${snapshot.metrics.lectureAttendanceRate}%`}
                  />
                  <MiniStat label="Deep work" value={`${snapshot.metrics.deepWorkHoursLast7}h`} />
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="eyebrow text-orange-200">Daily brief</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {intelligence.momentumBrief}
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Synced {new Date(snapshot.source?.syncedAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel
            eyebrow="Why this matters"
            title="Friction radar"
            description="Students usually feel behind before they can explain why. Pulse turns that vague feeling into named pressure sources."
          >
            <div className="space-y-4">
              {intelligence.frictionMap.map((item) => (
                <article
                  key={item.label}
                  className="surface rounded-[26px] border border-white/80 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-900">
                      {item.label}
                    </h3>
                    <span className="rounded-full bg-slate-900 px-3 py-1 font-mono text-[11px] text-white">
                      {item.score}/100
                    </span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ff6b2c,#ffb479)]"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{item.note}</p>
                </article>
              ))}
            </div>

            <div className="section-divider my-6" />

            <div className="grid gap-4 sm:grid-cols-3">
              {intelligence.opportunityMap.map((item) => (
                <InsightCard
                  key={item.label}
                  label={item.label}
                  value={`${item.value}`}
                  note={`${item.unit} · ${item.note}`}
                />
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Forecast"
            title="The next five days"
            description="A useful student product should show not just what exists, but where the week will become fragile."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {intelligence.weekForecast.map((day) => (
                <ForecastCard key={day.day} day={day} />
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-dashed border-[var(--line)] bg-white/60 p-5">
              <p className="eyebrow text-slate-500">QOTD momentum move</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                {snapshot.qotd.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {snapshot.qotd.solvedBy} students solved it out of {snapshot.qotd.attemptedBy} who
                attempted. This is the kind of small, daily pressure surface that Pulse can
                convert into a visible streak system.
              </p>
            </div>
          </Panel>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <Panel
            eyebrow="Today"
            title="Daily command center"
            description="The planner ranks work by urgency, concept dependency, and recovery value."
          >
            <div className="space-y-4">
              {intelligence.dailyPlan.map((task, index) => (
                <article
                  key={task.title}
                  className="surface rounded-[28px] border border-white/80 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                        Task {index + 1}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                        {task.title}
                      </h3>
                    </div>
                    <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs text-[var(--accent)]">
                      {task.duration}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{task.reason}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{task.outcome}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Dynamic planning"
            title="What should I do right now?"
            description="This is the contest-defining interaction: choose your actual time window and Pulse gives a realistic intervention plan."
          >
            <div className="flex flex-wrap gap-3">
              {durations.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setSelectedDuration(minutes);
                    })
                  }
                  className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition ${
                    selectedDuration === minutes
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700"
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {objectives.map((objective) => (
                <button
                  key={objective}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setSelectedObjective(objective);
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedObjective === objective
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-[var(--line)] bg-white text-slate-700"
                  }`}
                >
                  {objectiveLabels[objective]}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-[30px] bg-[#101f28] p-5 text-[#edf4ef] shadow-[0_24px_48px_rgba(18,32,41,0.26)]">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-[#ffb890]">Intervention blueprint</p>
                <p className="font-mono text-xs text-slate-400">
                  {blueprint.minutes} min / {objectiveLabels[blueprint.objective]}
                </p>
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                {blueprint.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-200">{blueprint.summary}</p>
              <ul className="mt-5 space-y-3">
                {blueprint.steps.map((step) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-200">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#ffb890]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <p className="eyebrow text-slate-300">Success metric</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    {blueprint.successMetric}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <p className="eyebrow text-slate-300">Tradeoff</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{blueprint.tradeoff}</p>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8">
            <Panel
              eyebrow="Recovery"
              title="Missed-class recovery engine"
              description="Three time horizons that turn a backlog into a sequence you can actually execute."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {intelligence.recoveryPlan.map((track) => (
                  <article
                    key={track.label}
                    className="surface rounded-[28px] border border-white/80 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow text-slate-500">{track.label}</p>
                      <span className="rounded-full bg-slate-900 px-3 py-1 font-mono text-[11px] text-white">
                        {track.duration}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-slate-900">
                      {track.focus}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{track.objective}</p>
                    <ul className="mt-4 space-y-3">
                      {track.steps.map((step) => (
                        <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Time-aware fallback"
              title="Sprint presets"
              description="If you only have a narrow window, the product should still tell you what pays off most."
            >
              <div className="flex flex-wrap gap-3">
                {intelligence.sprintOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedSprint(option.label)}
                    className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition ${
                      selectedSprint === option.label
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 rounded-[28px] border border-white/80 bg-white/80 p-5">
                <p className="eyebrow text-slate-500">{sprintPlan.label}</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-slate-900">
                  {sprintPlan.plan}
                </p>
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel
              eyebrow="Weakness map"
              title="Where momentum breaks"
              description="Mastery scores should trigger action, not just reporting."
            >
              <div className="space-y-4">
                {snapshot.mastery.map((topic) => (
                  <article
                    key={topic.module}
                    className="surface rounded-[24px] border border-white/80 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                          {topic.module}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">{topic.trend}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] ${
                          riskTone[topic.risk]
                        }`}
                      >
                        {topic.risk} risk
                      </span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#66c2b5)]"
                        style={{ width: `${topic.score}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-700">
                      <span>{topic.score}% mastery</span>
                      <span>{topic.weakestTopics.join(" / ")}</span>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Practice"
              title="Adaptive practice coach"
              description="Practice recommendations tie directly to weak topics and upcoming pressure."
            >
              <div className="space-y-4">
                {intelligence.practiceQueue.map((problem) => (
                  <article
                    key={problem.title}
                    className="surface rounded-[24px] border border-white/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                          {problem.priority}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">
                          {problem.title}
                        </h3>
                      </div>
                      <div className="rounded-full bg-slate-900 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                        {problem.difficulty}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{problem.module}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{problem.fit}</p>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr]">
          <Panel
            eyebrow="Status answers"
            title="Command center"
            description="The interface should feel like an academic copilot, not a spreadsheet."
          >
            <div className="flex flex-wrap gap-3">
              {commands.map((command) => (
                <button
                  key={command}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setSelectedCommand(command);
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedCommand === command
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-[var(--line)] bg-white text-slate-700"
                  }`}
                >
                  {command}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-[30px] bg-[#101f28] p-5 text-[#edf4ef] shadow-[0_24px_48px_rgba(18,32,41,0.26)]">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-[#ffb890]">Pulse response</p>
                <p className="font-mono text-xs text-slate-400">Newton-aware reasoning</p>
              </div>
              <p className="mt-4 text-balance text-lg leading-8">
                {intelligence.commandResponses[deferredCommand]}
              </p>
            </div>
          </Panel>

          <Panel
            eyebrow="Deadline radar"
            title="Open loops worth closing"
            description="Assignments should not just be listed. They should be contextualized by pressure and learning impact."
          >
            <div className="space-y-4">
              {intelligence.pendingAssignments.map((assignment) => (
                <article
                  key={assignment.title}
                  className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                        Due in {assignment.hoursLeft}h
                      </p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">
                        {assignment.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                      {assignment.dueLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{assignment.module}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{assignment.impact}</p>
                </article>
              ))}
            </div>

            <div className="section-divider my-6" />

            <div className="space-y-3">
              {intelligence.nextSevenDays.map((event) => (
                <div
                  key={`${event.title}-${event.startAt}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/75 bg-white/70 px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                      {event.dayLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.module}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{event.timeLabel}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {event.priority} priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="surface-strong rounded-[36px] px-6 py-8 lg:px-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <p className="eyebrow text-[var(--teal)]">Newton integration path</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-4xl">
                A real MCP app, not just a themed dashboard.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                The demo runs on a realistic snapshot contract, but the architecture is
                intentionally aligned to Newton MCP surfaces so the app can graduate into
                a live assistant without redesigning the product.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {dataSources.map((item) => (
                  <SourceCard key={item.source} item={item} />
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/75 bg-white/70 p-5">
              <p className="eyebrow text-slate-500">Production checklist</p>
              <div className="mt-4 space-y-4">
                {checklist.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Panel({ eyebrow, title, description, children }) {
  return (
    <section className="surface-strong rise-in rounded-[36px] px-5 py-6 sm:px-6 sm:py-7">
      <p className="eyebrow text-slate-500">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, suffix, note }) {
  return (
    <article className="surface rounded-[28px] px-4 py-5">
      <p className="eyebrow text-slate-500">{label}</p>
      <div className="mt-4 flex items-end gap-1 text-slate-900">
        <span className="metric-value font-semibold">{value}</span>
        <span className="pb-2 font-mono text-sm text-slate-500">{suffix}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{note}</p>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function InsightCard({ label, value, note }) {
  return (
    <article className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 p-4">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
    </article>
  );
}

function SignalPill({ label, value }) {
  return (
    <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="ml-2 text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function ForecastCard({ day }) {
  return (
    <article className="surface rounded-[26px] border border-white/80 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-slate-500">{day.day}</p>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] text-[var(--accent)]">
          {day.loadLabel}
        </span>
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-slate-900">
        {day.loadScore}
      </p>
      <p className="mt-1 text-sm text-slate-500">load score</p>
      <p className="mt-4 text-sm font-semibold text-slate-900">{day.focus}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{day.advice}</p>
    </article>
  );
}

function SourceCard({ item }) {
  return (
    <article className="rounded-[24px] border border-white/75 bg-white/75 p-4">
      <p className="eyebrow text-slate-500">{item.label}</p>
      <p className="mt-2 font-mono text-xs text-[var(--teal)]">{item.source}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.impact}</p>
    </article>
  );
}
