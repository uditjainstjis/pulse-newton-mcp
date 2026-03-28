const now = new Date();

const addDays = (days, hours = 10, minutes = 0, durationHours = 1.5) => {
  const start = new Date(now);
  start.setDate(start.getDate() + days);
  start.setHours(hours, minutes, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationHours * 60);

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
};

const subtractDays = (days, hours = 18) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

const baseSnapshot = {
  student: {
    name: "Udit Jain",
    cohort: "NST'24 CS+AI RU",
    targetRole: "AI product engineer",
    ambition: "Build tools that turn messy learning data into momentum",
  },
  course: {
    title: "S4'24 CS+AI RU",
    semester: "Semester 4",
    campus: "Rishihood University",
    mode: "Primary Newton semester",
  },
  metrics: {
    xp: 5472,
    streak: 0,
    rank: 32,
    percentile: 73,
    completionRate: 59,
    activeDaysLast7: 4,
    deepWorkHoursLast7: 9.5,
    lectureAttendanceRate: 59,
  },
  events: [
    {
      title: "DVA lecture",
      type: "lecture",
      module: "Data Visualization and Analysis",
      priority: "high",
      ...addDays(1, 9, 0),
    },
    {
      title: "DM Lab",
      type: "lab",
      module: "Discrete Mathematics",
      priority: "medium",
      ...addDays(1, 10, 30),
    },
    {
      title: "GenAI lecture",
      type: "lecture",
      module: "Generative AI",
      priority: "high",
      ...addDays(1, 14, 0),
    },
    {
      title: "DVA Tutorial",
      type: "tutorial",
      module: "Data Visualization and Analysis",
      priority: "medium",
      ...addDays(2, 9, 0),
    },
    {
      title: "System Design lecture",
      type: "lecture",
      module: "System Design",
      priority: "high",
      ...addDays(2, 10, 30),
    },
    {
      title: "GenAI Lab",
      type: "lab",
      module: "Generative AI",
      priority: "medium",
      ...addDays(2, 14, 0),
    },
    {
      title: "System Design Lab",
      type: "lab",
      module: "System Design",
      priority: "medium",
      ...addDays(2, 15, 30),
    },
    {
      title: "DVA practice block",
      type: "self_study",
      module: "Data Visualization and Analysis",
      priority: "medium",
      ...addDays(3, 19, 0, 2),
    },
  ],
  assignments: [
    {
      title: "Univariate Analysis, Advanced Visualization, Bivariate Analysis - Post Class",
      module: "Data Visualization and Analysis",
      dueAt: addDays(0, 23, 0, 1).startAt,
      status: "pending",
      effortHours: 2.5,
      impact: "Directly attached to the next DVA theory block and easy to procrastinate.",
    },
    {
      title: "Strategy, pluggable behaviors, Template Method - Post Class",
      module: "System Design",
      dueAt: addDays(1, 22, 0, 1).startAt,
      status: "pending",
      effortHours: 1.5,
      impact: "The concepts compound in your next design lecture, so delay hurts comprehension.",
    },
    {
      title: "Univariate Analysis, Advanced Visualization - In Class",
      module: "DVA Tutorial",
      dueAt: addDays(1, 20, 0, 1).startAt,
      status: "pending",
      effortHours: 1,
      impact: "Fast XP and quick closure before tutorial drift becomes a backlog item.",
    },
    {
      title: "Behavioral, Observer, decoupled events - Post Class",
      module: "System Design",
      dueAt: addDays(3, 21, 0, 1).startAt,
      status: "in_progress",
      effortHours: 2,
      impact: "Useful revision for moving from patterns vocabulary to implementation fluency.",
    },
  ],
  lectures: [
    {
      title: "Bivariate Analysis",
      module: "DVA Tutorial",
      occurredAt: subtractDays(3, 10),
      watched: false,
      attended: false,
      recordingAvailable: false,
      concepts: ["scatter plots", "covariance", "visual comparison"],
    },
    {
      title: "Strategy, pluggable behaviors, Template Method",
      module: "System Design",
      occurredAt: subtractDays(5, 11),
      watched: false,
      attended: false,
      recordingAvailable: true,
      concepts: ["strategy pattern", "template method", "behavior injection"],
    },
    {
      title: "RAG Introduction and Grounding LLMs",
      module: "Generative AI",
      occurredAt: subtractDays(4, 14),
      watched: false,
      attended: true,
      recordingAvailable: true,
      concepts: ["retrieval", "grounding", "context windows"],
    },
    {
      title: "Ring Theory 2",
      module: "Discrete Mathematics",
      occurredAt: subtractDays(4, 16),
      watched: false,
      attended: true,
      recordingAvailable: true,
      concepts: ["rings", "subrings", "algebraic structure"],
    },
  ],
  mastery: [
    {
      module: "Data Visualization and Analysis",
      score: 62,
      trend: "+3 this week",
      risk: "high",
      weakestTopics: ["bivariate analysis", "distribution reading"],
    },
    {
      module: "System Design",
      score: 66,
      trend: "-1 this week",
      risk: "high",
      weakestTopics: ["behavioral patterns", "observer flows"],
    },
    {
      module: "Generative AI",
      score: 74,
      trend: "+5 this week",
      risk: "medium",
      weakestTopics: ["RAG evaluation", "grounding strategy"],
    },
    {
      module: "Discrete Mathematics",
      score: 71,
      trend: "flat",
      risk: "medium",
      weakestTopics: ["ring properties", "proof structure"],
    },
  ],
  practiceBank: [
    {
      title: "EDA pattern selection under time pressure",
      module: "Data Visualization and Analysis",
      difficulty: "Medium",
      fit: "Best next rep for choosing the right chart and spotting noisy conclusions.",
    },
    {
      title: "Template Method refactor kata",
      module: "System Design",
      difficulty: "Medium",
      fit: "Turns abstract patterns into code you can explain in an interview or viva.",
    },
    {
      title: "RAG chunking and retrieval tradeoffs",
      module: "Generative AI",
      difficulty: "Hard",
      fit: "Matches the lecture you attended but still have not consolidated.",
    },
    {
      title: "Ring vs field counterexample drill",
      module: "Discrete Mathematics",
      difficulty: "Medium",
      fit: "Sharpens proof instincts before the next theory-heavy session.",
    },
  ],
  qotd: {
    title: "Search in Peak Sequence",
    difficulty: "Medium",
    streak: 0,
    attemptedBy: 21,
    solvedBy: 4,
  },
  arena: {
    solvedCount: 0,
    todaySolvedCount: 0,
    totalQuestions: 0,
  },
  signals: {
    missedDaysLast14: 4,
    backlogHours: 7.5,
    qotdSolvedThisWeek: 0,
    leaderboardMovement: "-3 places",
    recoveryHoursAvailable: 6,
    missedXp: 60,
    consistencyScore: 58,
  },
};

const demoScenarioConfigs = {
  founder: {
    key: "founder",
    label: "Founder mode",
    summary: "Ambitious builder with decent output but unstable recovery habits.",
    patch: {},
  },
  deadline: {
    key: "deadline",
    label: "Deadline spiral",
    summary: "A student with stacked due dates, collapsing reliability, and almost no buffer.",
    patch: {
      student: {
        name: "Deadline Spiral Persona",
        targetRole: "Software engineer",
      },
      source: {
        label: "Review scenario: Deadline spiral",
      },
      metrics: {
        xp: 3910,
        rank: 58,
        percentile: 49,
        completionRate: 42,
        activeDaysLast7: 2,
        deepWorkHoursLast7: 4.5,
        lectureAttendanceRate: 46,
      },
      assignments: [
        {
          title: "DVA post-class backlog bundle",
          module: "Data Visualization and Analysis",
          dueAt: addDays(0, 20, 0, 1).startAt,
          status: "pending",
          effortHours: 4,
          impact: "This one missed deadline will contaminate the next two theory sessions.",
        },
        {
          title: "System Design pattern implementation set",
          module: "System Design",
          dueAt: addDays(0, 23, 0, 1).startAt,
          status: "pending",
          effortHours: 3.5,
          impact: "High-pressure coding block with no slack left.",
        },
        ...baseSnapshot.assignments.slice(2),
      ],
      lectures: baseSnapshot.lectures.map((lecture, index) => ({
        ...lecture,
        watched: false,
        attended: index > 2,
      })),
      mastery: [
        {
          module: "Data Visualization and Analysis",
          score: 51,
          trend: "-8 this week",
          risk: "high",
          weakestTopics: ["bivariate analysis", "outlier handling"],
        },
        {
          module: "System Design",
          score: 55,
          trend: "-6 this week",
          risk: "high",
          weakestTopics: ["strategy pattern", "observer flows"],
        },
        {
          module: "Generative AI",
          score: 63,
          trend: "-3 this week",
          risk: "medium",
          weakestTopics: ["RAG evaluation", "chunking"],
        },
        {
          module: "Discrete Mathematics",
          score: 58,
          trend: "-4 this week",
          risk: "high",
          weakestTopics: ["proof structure", "ring properties"],
        },
      ],
      signals: {
        missedDaysLast14: 7,
        backlogHours: 13.5,
        qotdSolvedThisWeek: 0,
        leaderboardMovement: "-17 places",
        recoveryHoursAvailable: 4,
        missedXp: 140,
        consistencyScore: 37,
      },
    },
  },
  comeback: {
    key: "comeback",
    label: "Comeback week",
    summary: "A student starting to recover, with a real chance to rebuild momentum.",
    patch: {
      student: {
        name: "Comeback Week Persona",
        targetRole: "Founding engineer",
      },
      source: {
        label: "Review scenario: Comeback week",
      },
      metrics: {
        xp: 6120,
        rank: 21,
        percentile: 81,
        completionRate: 68,
        activeDaysLast7: 6,
        deepWorkHoursLast7: 13.5,
        lectureAttendanceRate: 74,
      },
      assignments: [
        {
          title: "Template Method polish set",
          module: "System Design",
          dueAt: addDays(1, 22, 0, 1).startAt,
          status: "in_progress",
          effortHours: 1.5,
          impact: "Small remaining closeout with high confidence return.",
        },
        ...baseSnapshot.assignments.slice(1),
      ],
      lectures: baseSnapshot.lectures.map((lecture, index) => ({
        ...lecture,
        watched: index > 0,
        attended: true,
      })),
      mastery: [
        {
          module: "Data Visualization and Analysis",
          score: 71,
          trend: "+9 this week",
          risk: "medium",
          weakestTopics: ["distribution reading", "chart selection"],
        },
        {
          module: "System Design",
          score: 76,
          trend: "+7 this week",
          risk: "medium",
          weakestTopics: ["template method", "observer events"],
        },
        {
          module: "Generative AI",
          score: 82,
          trend: "+5 this week",
          risk: "low",
          weakestTopics: ["RAG evaluation", "prompt grounding"],
        },
        {
          module: "Discrete Mathematics",
          score: 78,
          trend: "+3 this week",
          risk: "low",
          weakestTopics: ["proof writing", "rings"],
        },
      ],
      signals: {
        missedDaysLast14: 1,
        backlogHours: 3.5,
        qotdSolvedThisWeek: 2,
        leaderboardMovement: "+9 places",
        recoveryHoursAvailable: 8,
        missedXp: 20,
        consistencyScore: 77,
      },
      qotd: {
        title: "Search in Peak Sequence",
        difficulty: "Medium",
        streak: 2,
        attemptedBy: 21,
        solvedBy: 8,
      },
    },
  },
};

function mergeSnapshot(base, patch) {
  return {
    ...base,
    ...patch,
    student: { ...base.student, ...patch.student },
    course: { ...base.course, ...patch.course },
    source: { ...base.source, ...patch.source },
    metrics: { ...base.metrics, ...patch.metrics },
    signals: { ...base.signals, ...patch.signals },
    qotd: { ...base.qotd, ...patch.qotd },
    arena: { ...base.arena, ...patch.arena },
    events: patch.events ?? base.events,
    assignments: patch.assignments ?? base.assignments,
    lectures: patch.lectures ?? base.lectures,
    mastery: patch.mastery ?? base.mastery,
    practiceBank: patch.practiceBank ?? base.practiceBank,
  };
}

export function getDemoScenarioSnapshot(scenario = "founder") {
  const activeScenario = demoScenarioConfigs[scenario] ?? demoScenarioConfigs.founder;

  return mergeSnapshot(
    {
      ...baseSnapshot,
      source: {
        mode: "demo",
        provider: "demo",
        syncedAt: new Date().toISOString(),
        label: "Demo snapshot",
      },
    },
    activeScenario.patch,
  );
}

export function getDemoScenarios() {
  return Object.values(demoScenarioConfigs).map((scenario) => ({
    key: scenario.key,
    label: scenario.label,
    summary: scenario.summary,
  }));
}

export const studentSnapshot = getDemoScenarioSnapshot();
