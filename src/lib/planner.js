const HOUR = 36e5;
const DAY = 864e5;

const shortDateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
});

const dayLabelFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const timeLabelFormatter = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sortByDate = (items, key) =>
  [...items].sort((a, b) => new Date(a[key]) - new Date(b[key]));

const formatShort = (value) => shortDateFormatter.format(new Date(value));
const formatDay = (value) => dayLabelFormatter.format(new Date(value));
const formatTime = (value) => timeLabelFormatter.format(new Date(value));

const hoursUntil = (value) =>
  Math.max(0, Math.round((new Date(value).getTime() - Date.now()) / HOUR));

const daysUntil = (value) =>
  Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / DAY));

const getMissedLectures = (snapshot) =>
  snapshot.lectures.filter((lecture) => !lecture.watched);

const getPendingAssignments = (snapshot) =>
  sortByDate(
    snapshot.assignments.filter((assignment) => assignment.status !== "done"),
    "dueAt",
  );

const getWeakModules = (snapshot) => [...snapshot.mastery].sort((a, b) => a.score - b.score);

function pickFocus(blockMinutes, objective, context) {
  const { topAssignment, primaryMissedLecture, weakestModule, nextEvent } = context;

  const byObjective = {
    deadlines: [
      {
        title: `Ship the core of ${topAssignment.title}`,
        detail: `Push the highest-pressure assignment while the deadline is still recoverable.`,
      },
      {
        title: `Pre-read for ${nextEvent.title}`,
        detail: `Spend 10 minutes removing ambiguity from tomorrow's first class.`,
      },
      {
        title: `Close one fast rep in ${weakestModule.module}`,
        detail: `Keep momentum instead of ending the block with admin only.`,
      },
    ],
    recovery: [
      {
        title: `Repair ${primaryMissedLecture.title}`,
        detail: `Use the recording or notes to close the lecture gap before it cascades.`,
      },
      {
        title: `Reconnect with ${weakestModule.weakestTopics[0]}`,
        detail: `Translate review into one concrete exercise or summary sheet.`,
      },
      {
        title: `Stabilize ${topAssignment.module}`,
        detail: `Finish enough of the linked assignment that the lecture repair sticks.`,
      },
    ],
    momentum: [
      {
        title: `Stack one visible win in ${topAssignment.module}`,
        detail: `Choose a task you can visibly complete inside this block.`,
      },
      {
        title: `Attempt today's QOTD-style challenge`,
        detail: `Create a small streak anchor instead of waiting for a perfect day.`,
      },
      {
        title: `Do one confidence-building rep in ${weakestModule.module}`,
        detail: `End with something that feels winnable so tomorrow starts easier.`,
      },
    ],
  };

  const sequence = byObjective[objective] ?? byObjective.deadlines;

  if (blockMinutes <= 30) {
    return {
      title: sequence[0].title,
      summary: `${sequence[0].detail} This is a narrow-window move, not a full reset.`,
      steps: [
        `5 min setup: open only the tabs/files needed for ${topAssignment.title}.`,
        `20 min execution sprint on the highest-friction part.`,
        "5 min checkpoint: note the exact next step before stopping.",
      ],
      successMetric: "You leave with visible progress and a clean restart point.",
      tradeoff: "You are protecting momentum, not solving the whole backlog.",
    };
  }

  if (blockMinutes <= 60) {
    return {
      title: sequence[0].title,
      summary: `${sequence[0].detail} Then use the remainder to reduce tomorrow friction.`,
      steps: [
        `35 min on ${sequence[0].title}.`,
        `15 min on ${sequence[1].title}.`,
        "10 min wrap-up and decision log.",
      ],
      successMetric: "One urgent item moves, and one future blocker gets smaller.",
      tradeoff: "Breadth improves, but deep recovery is still deferred.",
    };
  }

  if (blockMinutes <= 120) {
    return {
      title: `${sequence[0].title} + ${sequence[1].title}`,
      summary: `This window is large enough to combine urgency with repair, which is the highest leverage configuration.`,
      steps: [
        `50 min on ${sequence[0].title}.`,
        `30 min on ${sequence[1].title}.`,
        `25 min on ${sequence[2].title}.`,
        "15 min reflection and task re-ordering for tomorrow.",
      ],
      successMetric: "You reduce deadline risk and stop one concept gap from compounding.",
      tradeoff: "This is the best balanced block, but it still assumes you return tomorrow.",
    };
  }

  return {
    title: `Run a full recovery block around ${topAssignment.module}`,
    summary: `Use this longer block to compress urgency, watch one missed lecture, and finish with a rep that rebuilds confidence.`,
    steps: [
      `60 min on ${topAssignment.title}.`,
      `40 min on ${primaryMissedLecture.title}.`,
      `35 min on ${weakestModule.module} practice.`,
      `20 min preview for ${nextEvent.title}.`,
      "15 min backlog cleanup and schedule reset.",
    ],
    successMetric: "Tomorrow starts with fewer open loops and lower anxiety.",
    tradeoff: "A long reset is powerful, but only if you protect it from distractions.",
  };
}

function buildWeekForecast(snapshot, pendingAssignments) {
  const dayMap = new Map();

  snapshot.events.forEach((event) => {
    const key = new Date(event.startAt).toDateString();
    const current = dayMap.get(key) ?? { events: [], assignments: [] };
    current.events.push(event);
    dayMap.set(key, current);
  });

  pendingAssignments.forEach((assignment) => {
    const key = new Date(assignment.dueAt).toDateString();
    const current = dayMap.get(key) ?? { events: [], assignments: [] };
    current.assignments.push(assignment);
    dayMap.set(key, current);
  });

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(0, 5)
    .map(([key, value]) => {
      const eventHours = value.events.reduce((sum, event) => {
        const start = new Date(event.startAt).getTime();
        const end = new Date(event.endAt ?? event.startAt).getTime();
        return sum + Math.max(1, Math.round((end - start) / HOUR));
      }, 0);

      const assignmentLoad = value.assignments.reduce(
        (sum, assignment) => sum + Math.ceil(assignment.effortHours ?? 1),
        0,
      );

      const highPriorityCount = value.events.filter(
        (event) => event.priority === "high",
      ).length;

      const loadScore = clamp(eventHours * 10 + assignmentLoad * 12 + highPriorityCount * 8, 18, 94);

      return {
        day: formatDay(new Date(key)),
        loadScore,
        loadLabel:
          loadScore >= 72 ? "Heavy" : loadScore >= 48 ? "Loaded" : "Stable",
        focus:
          value.assignments[0]?.title ??
          value.events[0]?.title ??
          "Maintain consistency",
        advice:
          value.assignments.length > 0
            ? `Close ${value.assignments.length} assignment item(s) before the day ends.`
            : `Use ${value.events[0]?.module ?? "your open slots"} to prepare one block ahead.`,
      };
    });
}

export function buildIntelligence(snapshot) {
  const pendingAssignments = getPendingAssignments(snapshot);
  const missedLectures = getMissedLectures(snapshot);
  const weakModules = getWeakModules(snapshot);
  const futureEvents = sortByDate(
    snapshot.events.filter((event) => new Date(event.startAt).getTime() >= Date.now() - HOUR),
    "startAt",
  );

  const nextEvent =
    futureEvents[0] ??
    snapshot.events[0] ?? {
      title: "Next learning block",
      module: "Coursework",
      startAt: new Date().toISOString(),
      priority: "medium",
    };

  const topAssignment =
    pendingAssignments[0] ?? {
      title: "Close one open assignment",
      module: "Coursework",
      dueAt: new Date(Date.now() + DAY).toISOString(),
      impact: "Removing open loops creates working memory for deeper study.",
    };

  const primaryMissedLecture =
    missedLectures[0] ?? {
      title: "Review the most recent class",
      module: topAssignment.module,
      concepts: ["core ideas", "notes cleanup"],
    };

  const weakestModule =
    weakModules[0] ?? {
      module: topAssignment.module,
      score: 68,
      weakestTopics: ["core concepts"],
      risk: "medium",
    };

  const dueSoonPenalty = pendingAssignments
    .slice(0, 3)
    .reduce((sum, assignment) => sum + Math.max(0, 20 - hoursUntil(assignment.dueAt)), 0);

  const healthScore = clamp(
    Math.round(
      snapshot.metrics.completionRate * 0.45 +
        snapshot.metrics.activeDaysLast7 * 4 +
        snapshot.metrics.percentile * 0.22 +
        snapshot.metrics.deepWorkHoursLast7 * 1.6 -
        snapshot.signals.backlogHours * 1.7,
    ),
    41,
    94,
  );

  const riskScore = clamp(
    Math.round(
      missedLectures.length * 10 +
        snapshot.signals.backlogHours * 4 +
        Math.max(0, 78 - weakestModule.score) +
        dueSoonPenalty +
        Math.max(0, 65 - snapshot.signals.consistencyScore) * 0.5,
    ),
    24,
    94,
  );

  const frictionMap = [
    {
      label: "Deadline compression",
      score: clamp(pendingAssignments.length * 18 + dueSoonPenalty, 16, 96),
      note: `${pendingAssignments.length} open assignment(s), with ${topAssignment.title} leading the queue.`,
    },
    {
      label: "Lecture drift",
      score: clamp(missedLectures.length * 21 + snapshot.signals.missedXp / 3, 12, 92),
      note: `${missedLectures.length} lecture gap(s) and ${snapshot.signals.missedXp} XP still on the table.`,
    },
    {
      label: "Weak-topic drag",
      score: clamp(100 - weakestModule.score + 22, 14, 91),
      note: `${weakestModule.module} is weakest at ${weakestModule.score}% mastery.`,
    },
  ];

  const dailyPlan = [
    {
      title: `Finish the core of ${topAssignment.title}`,
      duration: "50 min",
      reason: `Due in ${hoursUntil(topAssignment.dueAt)}h and still the cleanest way to reduce pressure fast.`,
      outcome: "You lower deadline anxiety before tomorrow's class stack starts.",
    },
    {
      title: `Repair ${primaryMissedLecture.title}`,
      duration: "35 min",
      reason: `The gap in ${primaryMissedLecture.module} is now touching your weak-topic list.`,
      outcome: "Tomorrow's lecture becomes understandable instead of cumulative damage.",
    },
    {
      title: `Do 1 rep in ${weakestModule.module}`,
      duration: "30 min",
      reason: `${weakestModule.module} is your weakest surface at ${weakestModule.score}%.`,
      outcome: "You convert review into retained problem-solving confidence.",
    },
  ];

  const recoveryPlan = [
    {
      label: "Tonight",
      focus: topAssignment.title,
      duration: "90 minutes",
      objective: "Remove urgency first, then repair one concept gap.",
      steps: [
        `45 min on ${topAssignment.title}`,
        `25 min on ${primaryMissedLecture.title}`,
        `20 min on ${weakestModule.weakestTopics[0]}`,
      ],
    },
    {
      label: "Tomorrow",
      focus: `Protect ${nextEvent.module}`,
      duration: "2 hours",
      objective: "Start the day with less carry-over and cleaner context.",
      steps: [
        `Finish the remaining core of ${topAssignment.module}`,
        `Preview ${nextEvent.title} for 10 minutes`,
        `Solve one short practice rep in ${weakestModule.module}`,
      ],
    },
    {
      label: "This week",
      focus: "Backlog compression",
      duration: `${snapshot.signals.recoveryHoursAvailable} hours`,
      objective: `Cut backlog from ${snapshot.signals.backlogHours}h to under 3h.`,
      steps: [
        `Close both high-pressure items in ${topAssignment.module} and ${nextEvent.module}`,
        `Watch or reconstruct two missed lectures with notes`,
        "Turn one weak topic into a reusable summary sheet",
      ],
    },
  ];

  const sprintOptions = [
    {
      label: "45 min window",
      plan: `Do the highest-friction slice of ${topAssignment.title} and stop only after you define the next step.`,
    },
    {
      label: "90 min recovery",
      plan: `Urgency first, then ${primaryMissedLecture.title}, then one short rep in ${weakestModule.module}.`,
    },
    {
      label: "3 hour reset",
      plan: `Assignment closure, lecture repair, one practice rep, and a preview for ${nextEvent.title}.`,
    },
  ];

  const focusBlueprints = [30, 60, 120, 180].flatMap((minutes) =>
    ["deadlines", "recovery", "momentum"].map((objective) => ({
      minutes,
      objective,
      ...pickFocus(minutes, objective, {
        topAssignment,
        primaryMissedLecture,
        weakestModule,
        nextEvent,
      }),
    })),
  );

  const practiceQueue = snapshot.practiceBank.map((problem, index) => ({
    ...problem,
    priority:
      index === 0
        ? "Now"
        : index === 1
          ? "Next"
          : index === 2
            ? "Stretch"
            : "Later",
  }));

  const pendingAssignmentSummaries = pendingAssignments.map((assignment) => ({
    ...assignment,
    dueInDays: daysUntil(assignment.dueAt),
    dueLabel: formatShort(assignment.dueAt),
    hoursLeft: hoursUntil(assignment.dueAt),
  }));

  const opportunityMap = [
    {
      label: "QOTD streak",
      value: snapshot.qotd.streak,
      unit: "days",
      note: snapshot.qotd.streak
        ? "Keep the streak alive with one focused solve."
        : "A zero streak means today's solve creates immediate visible momentum.",
    },
    {
      label: "Missed XP",
      value: snapshot.signals.missedXp,
      unit: "xp",
      note: "Recovered lectures and on-time attendance turn directly into low-friction gains.",
    },
    {
      label: "Arena usage",
      value: snapshot.arena.solvedCount,
      unit: "solves",
      note: "There is a large unused practice surface available for targeted reps.",
    },
  ];

  const momentumBrief = `You are not in crisis, but your system is currently fragile. ${pendingAssignments.length} open assignment(s), ${missedLectures.length} unwatched lecture gap(s), and a ${snapshot.signals.backlogHours}h backlog mean the next two days decide whether this stays manageable or starts compounding.`;

  const commandResponses = {
    "What should I do today?": `Start with ${topAssignment.title}, then repair ${primaryMissedLecture.title}, then do one rep in ${weakestModule.module}. That order cuts both urgency and concept drift.`,
    "What hurts me this week?": `The main failure mode is stacked class load meeting unfinished DVA/System Design work. ${frictionMap[0].label} and ${frictionMap[1].label.toLowerCase()} are the two drivers to neutralize first.`,
    "How do I recover fast?": `Use a 90-minute block: 45 minutes on ${topAssignment.title}, 25 minutes on ${primaryMissedLecture.title}, and 20 minutes on ${weakestModule.weakestTopics[0]}.`,
    "What did I miss?": `The biggest gap is ${primaryMissedLecture.title} in ${primaryMissedLecture.module}. Important concepts include ${primaryMissedLecture.concepts.join(", ")}.`,
    "What should I practice next?": `Start with "${practiceQueue[0]?.title}" and "${practiceQueue[1]?.title}". They map directly to your weakest current modules.`,
    "Should I do QOTD today?": `Yes. ${snapshot.qotd.title} is a clean momentum play because your streak is ${snapshot.qotd.streak} and even one solve changes the feel of the day.`,
  };

  return {
    healthScore,
    riskScore,
    nextEvent,
    nextEventSummary: `${formatShort(nextEvent.startAt)} · ${nextEvent.module}`,
    pendingAssignments: pendingAssignmentSummaries,
    missedLectures,
    weakModules,
    dailyPlan,
    recoveryPlan,
    sprintOptions,
    practiceQueue,
    commandResponses,
    topAssignment,
    primaryMissedLecture,
    weakestModule,
    frictionMap,
    momentumBrief,
    weekForecast: buildWeekForecast(snapshot, pendingAssignments),
    focusBlueprints,
    opportunityMap,
    nextSevenDays: futureEvents.slice(0, 6).map((event) => ({
      ...event,
      dayLabel: formatDay(event.startAt),
      timeLabel: `${formatTime(event.startAt)} - ${formatTime(event.endAt ?? event.startAt)}`,
    })),
  };
}

export function getIntegrationChecklist() {
  return [
    "Authenticate Newton MCP once with `npx -y @newtonschool/newton-mcp@latest login`.",
    "Fetch `list_courses`, `get_course_overview`, `get_upcoming_schedule`, `get_assignments`, `get_recent_lectures`, `get_question_of_the_day`, and `get_arena_stats` server-side.",
    "Normalize those responses into the shared Pulse snapshot contract consumed by the UI.",
    "Persist daily briefs and intervention outcomes so recommendations improve over time.",
  ];
}

export function getDataSources() {
  return [
    {
      label: "Schedule",
      source: "get_upcoming_schedule",
      impact: "Builds the week forecast and next-event preparation layer.",
    },
    {
      label: "Assignments",
      source: "get_assignments",
      impact: "Powers deadline compression, risk scoring, and narrow-window plans.",
    },
    {
      label: "Lectures",
      source: "get_recent_lectures",
      impact: "Detects missed-class drift, recording recovery, and XP leakage.",
    },
    {
      label: "Course health",
      source: "get_course_overview",
      impact: "Anchors XP, completion, attendance, and long-range health scoring.",
    },
    {
      label: "Practice signals",
      source: "get_arena_stats + get_question_of_the_day",
      impact: "Turns practice and streak surfaces into small daily momentum moves.",
    },
  ];
}
