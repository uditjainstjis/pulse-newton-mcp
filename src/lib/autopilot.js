const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const slotFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const windowLabel = (start, end) => {
  return `${slotFormatter.format(start)} → ${slotFormatter.format(end)}`;
};

const priorityFromHours = (hoursLeft) => {
  if (hoursLeft <= 24) return "Critical";
  if (hoursLeft <= 72) return "Important";
  return "Opportunity";
};

export function buildAutonomousPlan(snapshot) {
  const now = Date.now();
  const assignments = snapshot.assignments
    .filter((assignment) => assignment.status !== "done")
    .map((assignment) => {
      const dueTs = Number.isFinite(new Date(assignment.dueAt).getTime())
        ? new Date(assignment.dueAt).getTime()
        : now + DAY * 4;
      const hoursLeft = Math.max(0, (dueTs - now) / HOUR);
      return {
        ...assignment,
        dueTs,
        hoursLeft,
        effortHours: assignment.effortHours ?? 1.5,
        priority: priorityFromHours(hoursLeft),
        dueLabel: dayFormatter.format(new Date(dueTs)),
      };
    })
    .sort((a, b) => {
      if (a.hoursLeft === b.hoursLeft) {
        return b.effortHours - a.effortHours;
      }
      return a.hoursLeft - b.hoursLeft;
    })
    .slice(0, 4);

  const schedule = assignments.map((assignment, index) => {
    const bankedStart = now + index * 3 * HOUR;
    const preferredStart = Math.min(
      assignment.dueTs - assignment.effortHours * HOUR - 2 * HOUR,
      bankedStart,
    );
    const start = new Date(Math.max(now, preferredStart));
    const durationHours = Math.min(assignment.effortHours, 3);
    const end = new Date(Math.min(assignment.dueTs, start.getTime() + durationHours * HOUR));
    const bufferHours = Math.max(0, (assignment.dueTs - end.getTime()) / HOUR);

    return {
      id: `${assignment.title}-${assignment.module}-${assignment.dueLabel}`,
      module: assignment.module,
      title: assignment.title,
      reason: assignment.impact ?? `Keep ${assignment.module} momentum ahead of the next class.`,
      priority: assignment.priority,
      intensity: bufferHours < 1 ? "Peak" : bufferHours < 5 ? "Managed" : "Comfort",
      window: `${windowLabel(start, end)}`,
      durationHours: Number((durationHours).toFixed(1)),
      bufferHours: Number(bufferHours.toFixed(1)),
      dueLabel: assignment.dueLabel,
    };
  });

  const closingHours = schedule.reduce((sum, slot) => sum + slot.durationHours, 0);
  const finalDue = schedule[schedule.length - 1];
  const readiness = clamp(
    92 - snapshot.signals.backlogHours * 1.4 - schedule.length * 4 + (finalDue?.bufferHours ?? 0) * 0.5,
    38,
    98,
  );

  const finalDueLabel = finalDue?.dueLabel ?? "the next due block";
  const summary = schedule.length
    ? `Autonomous Concierge builds ${schedule.length} high-clarity slots totalling ${closingHours.toFixed(
        1,
      )} focused hours before ${finalDueLabel}.`
    : "Zero outstanding blocks; this is a good time to protect streaks instead of chasing extra work.";

  return {
    readiness: Math.round(readiness),
    backlogHours: snapshot.signals.backlogHours,
    closingHours: Number(closingHours.toFixed(1)),
    summary,
    schedule,
  };
}
