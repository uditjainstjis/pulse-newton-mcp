import "server-only";

import os from "os";
import path from "path";
import { readFile } from "fs/promises";

const BASE_URL = "https://my.newtonschool.co";
const DEFAULT_COURSE_API_LIMIT = 20;

const normalizeDate = (value) => {
  if (!value) return null;
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }
  return new Date(value).toISOString();
};

const safeName = (value, fallback = "Unknown") => value || fallback;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const titleFromCourse = (courseName = "") => {
  if (courseName.includes("Lab")) return `${courseName} session`;
  if (courseName.includes("Tut")) return `${courseName} tutorial`;
  return `${courseName} lecture`;
};

async function readTokenFromDisk() {
  try {
    const credentialsPath = path.join(os.homedir(), ".newton-mcp", "credentials.json");
    const raw = await readFile(credentialsPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

async function getAccessToken() {
  return process.env.NEWTON_ACCESS_TOKEN || (await readTokenFromDisk());
}

async function fetchNewtonJson(endpoint, token) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Newton API ${response.status} for ${endpoint}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

function resolvePrimaryCourse(courses, explicitCourseHash) {
  if (explicitCourseHash) {
    return explicitCourseHash;
  }

  const rootCourse = courses.find(
    (course) =>
      course.user_status_text === "Enrolled" &&
      course.children_courses?.is_parent_admin_unit_course,
  );

  const activeSemester = rootCourse?.children_courses?.admin_unit_courses?.find(
    (course) => course.is_active_admin_unit_course,
  );

  if (activeSemester?.hash) {
    return activeSemester.hash;
  }

  const directEnrolled = courses.find(
    (course) => course.user_status_text === "Enrolled" && course.short_display_name,
  );

  if (directEnrolled?.hash) {
    return directEnrolled.hash;
  }

  throw new Error("Unable to resolve an enrolled Newton course.");
}

function deriveMetrics(performance, xp, lectures) {
  const lectureCompletion = performance.total_lectures
    ? (performance.total_lectures_attended / performance.total_lectures) * 100
    : 0;
  const assignmentCompletion = performance.total_assignment_questions
    ? (performance.total_completed_assignment_questions /
        performance.total_assignment_questions) *
      100
    : 0;
  const contestCompletion = performance.total_contest_questions
    ? (performance.total_completed_contest_questions / performance.total_contest_questions) * 100
    : 0;
  const assessmentCompletion = performance.total_assessments
    ? (performance.total_completed_assessments / performance.total_assessments) * 100
    : 0;

  const completionRate = Math.round(
    lectureCompletion * 0.35 +
      assignmentCompletion * 0.3 +
      contestCompletion * 0.2 +
      assessmentCompletion * 0.15,
  );

  const recentLectures = lectures.filter((lecture) => {
    const lectureTime = new Date(lecture.start_timestamp).getTime();
    return Date.now() - lectureTime <= 7 * 864e5;
  });

  const activeDaysLast7 = new Set(
    recentLectures
      .filter((lecture) => lecture.attended || lecture.watched)
      .map((lecture) => new Date(lecture.start_timestamp).toDateString()),
  ).size;

  const deepWorkHoursLast7 = Number(
    (
      recentLectures.reduce((sum, lecture) => {
        if (!(lecture.attended || lecture.watched)) {
          return sum;
        }

        const start = new Date(lecture.start_timestamp).getTime();
        const end = new Date(lecture.end_timestamp).getTime();
        return sum + (end - start) / 36e5;
      }, 0) * 0.55
    ).toFixed(1),
  );

  const percentile = clamp(
    Math.round(completionRate * 0.75 + lectureCompletion * 0.25),
    12,
    96,
  );

  const rank = xp.student_count
    ? Math.max(1, Math.round(((100 - percentile) / 100) * xp.student_count))
    : 0;

  return {
    xp: xp.total_earned_points ?? 0,
    streak: 0,
    rank,
    percentile,
    completionRate,
    activeDaysLast7,
    deepWorkHoursLast7,
    lectureAttendanceRate: Math.round(lectureCompletion),
  };
}

function buildAssignments(assignmentsResponse) {
  return assignmentsResponse.results.slice(0, 12).map((assignment) => {
    const solvedCount = assignment.assignment_questions.filter(
      (question) => question.attempt_status === 2 || question.attempt_status === 3,
    ).length;
    const totalQuestions = assignment.assignment_questions.length;

    return {
      title: assignment.title,
      module: assignment.course.short_display_name || assignment.course.title,
      dueAt: normalizeDate(assignment.end_timestamp),
      status:
        solvedCount === 0
          ? "pending"
          : solvedCount >= totalQuestions
            ? "done"
            : "in_progress",
      effortHours: Math.max(1, Number((totalQuestions * 0.35).toFixed(1))),
      impact:
        totalQuestions > 4
          ? `Large assignment block with ${totalQuestions} questions. Delaying it will keep pressure high for this module.`
          : `Small but important closure item in ${assignment.course.short_display_name || assignment.course.title}.`,
      questions: assignment.assignment_questions,
    };
  });
}

function buildLectures(lecturesResponse) {
  return lecturesResponse.results.slice(0, 12).map((lecture) => ({
    title: lecture.title,
    module: lecture.course.short_display_name || lecture.course.title,
    occurredAt: normalizeDate(lecture.start_timestamp),
    watched: Boolean(lecture.watched || lecture.attended),
    attended: Boolean(lecture.attended),
    recordingAvailable: Boolean(lecture.total_recording_duration),
    concepts:
      lecture.topics?.slice(0, 4).map((topic) => topic.title.toLowerCase()) ?? [],
    lectureHash: lecture.hash,
  }));
}

function buildEvents(calendarResponse) {
  return calendarResponse.results.slice(0, 12).map((event) => ({
    title: event.lecture_title || titleFromCourse(event.course.short_display_name),
    type: event.type === "lecture_slot" ? "lecture" : event.type,
    module: event.course.short_display_name || event.course.title,
    priority:
      event.course.short_display_name?.includes("Lab") ||
      event.course.short_display_name?.includes("Tut")
        ? "medium"
        : "high",
    startAt: normalizeDate(event.start_timestamp),
    endAt: normalizeDate(event.end_timestamp),
  }));
}

function buildMastery(lectures, assignments, performance) {
  const moduleMap = new Map();

  lectures.forEach((lecture) => {
    const current = moduleMap.get(lecture.module) ?? {
      module: lecture.module,
      lectures: 0,
      misses: 0,
      weakTopics: new Set(),
      assignments: 0,
    };

    current.lectures += 1;
    if (!lecture.attended) {
      current.misses += 1;
      lecture.concepts.forEach((concept) => current.weakTopics.add(concept));
    }
    moduleMap.set(lecture.module, current);
  });

  assignments.forEach((assignment) => {
    const current = moduleMap.get(assignment.module) ?? {
      module: assignment.module,
      lectures: 0,
      misses: 0,
      weakTopics: new Set(),
      assignments: 0,
    };

    current.assignments += 1;
    assignment.questions.slice(0, 3).forEach((question) => {
      question.topics?.forEach((topic) => current.weakTopics.add(topic.toLowerCase()));
    });
    moduleMap.set(assignment.module, current);
  });

  return Array.from(moduleMap.values())
    .slice(0, 6)
    .map((moduleStat, index) => {
      const missPenalty = moduleStat.misses * 12;
      const assignmentPenalty = moduleStat.assignments * 6;
      const baseScore = clamp(
        88 - missPenalty - assignmentPenalty - index * 2,
        48,
        88,
      );

      return {
        module: moduleStat.module,
        score: baseScore,
        trend:
          moduleStat.misses > 0
            ? `-${moduleStat.misses * 2} this week`
            : `+${Math.max(1, 4 - index)} this week`,
        risk: baseScore < 66 ? "high" : baseScore < 76 ? "medium" : "low",
        weakestTopics:
          Array.from(moduleStat.weakTopics).slice(0, 2).length > 0
            ? Array.from(moduleStat.weakTopics).slice(0, 2)
            : ["continuity", "practice consistency"],
      };
    });
}

function buildPracticeBank(assignments, qotdDetail) {
  const assignmentQuestions = assignments
    .flatMap((assignment) =>
      assignment.questions.slice(0, 2).map((question) => ({
        title: question.question_title,
        module: assignment.module,
        difficulty:
          question.difficulty_type >= 4
            ? "Hard"
            : question.difficulty_type === 3
              ? "Medium"
              : "Easy",
        fit:
          question.topics?.length
            ? `Pulled from your live assignment stream around ${question.topics
                .slice(0, 2)
                .join(" and ")}.`
            : "Pulled from your live assignment stream as a relevant next rep.",
      })),
    )
    .slice(0, 3);

  const bank = [...assignmentQuestions];

  if (qotdDetail?.assignmentQuestionTitle) {
    bank.push({
      title: qotdDetail.assignmentQuestionTitle,
      module: "Question of the Day",
      difficulty: "Medium",
      fit: "Live daily challenge from your current Newton QOTD series.",
    });
  }

  return bank.slice(0, 4);
}

function buildSignals(lectures, assignments, qotdProfile) {
  const unattendedLectures = lectures.filter((lecture) => !lecture.attended);
  const openAssignments = assignments.filter((assignment) => assignment.status !== "done");

  const backlogHours = Number(
    (
      openAssignments.reduce((sum, assignment) => sum + assignment.effortHours, 0) +
      unattendedLectures.length * 1.4
    ).toFixed(1),
  );

  return {
    missedDaysLast14: unattendedLectures.length,
    backlogHours,
    qotdSolvedThisWeek: qotdProfile?.completed_count ?? 0,
    leaderboardMovement:
      qotdProfile?.current_streak > 0 ? `+${qotdProfile.current_streak} streak` : "0 streak",
    recoveryHoursAvailable: clamp(Math.round(backlogHours * 0.7), 3, 10),
    missedXp: unattendedLectures.reduce(
      (sum, lecture) => sum + (lecture.attended ? 0 : 30),
      0,
    ),
    consistencyScore: clamp(100 - unattendedLectures.length * 9 - openAssignments.length * 5, 35, 91),
  };
}

export async function fetchLiveNewtonSnapshot() {
  const token = await getAccessToken();

  if (!token) {
    throw new Error(
      "Newton credentials not found. Set NEWTON_ACCESS_TOKEN or log in with the Newton MCP CLI.",
    );
  }

  const me = await fetchNewtonJson("/api/v1/user/me/", token);
  const courses = await fetchNewtonJson(
    "/api/v2/course/all/applied/?pagination=false&completed=false",
    token,
  );

  const selectedCourseHash = resolvePrimaryCourse(courses, process.env.NEWTON_COURSE_HASH);

  const [courseDetails, performance, xp, lecturesResponse, assignmentsResponse, calendarResponse] =
    await Promise.all([
      fetchNewtonJson(`/api/v2/course/h/${selectedCourseHash}/details/`, token),
      fetchNewtonJson(`/api/v2/course/h/${selectedCourseHash}/self_performance/`, token),
      fetchNewtonJson(`/api/v2/course/h/${selectedCourseHash}/experience_points/`, token),
      fetchNewtonJson(
        `/api/v2/course/h/${selectedCourseHash}/lecture/all/?limit=${DEFAULT_COURSE_API_LIMIT}&offset=0`,
        token,
      ),
      fetchNewtonJson(
        `/api/v2/course/h/${selectedCourseHash}/assignment/all/?limit=${DEFAULT_COURSE_API_LIMIT}&offset=0`,
        token,
      ),
      fetchNewtonJson(
        `/api/v2/course/h/${selectedCourseHash}/calendar_entity/all/?limit=${DEFAULT_COURSE_API_LIMIT}&offset=0`,
        token,
      ),
    ]);

  const qotdSlug = courseDetails.question_of_the_day_series?.slug;

  const [arenaStats, qotdDetail, qotdProfile] = await Promise.all([
    fetchNewtonJson(`/api/v2/course/h/${selectedCourseHash}/arena/stats/`, token).catch(
      () => null,
    ),
    qotdSlug
      ? fetchNewtonJson(
          `/api/v1/assignment/question_of_the_day_with_series/s/${qotdSlug}/question_of_the_day_detail/`,
          token,
        ).catch(() => null)
      : null,
    qotdSlug
      ? fetchNewtonJson(
          `/api/v1/assignment/question_of_the_day_with_series/s/${qotdSlug}/user_question_of_the_day_profile/`,
          token,
        ).catch(() => null)
      : null,
  ]);

  const lectures = buildLectures(lecturesResponse);
  const assignments = buildAssignments(assignmentsResponse);
  const events = buildEvents(calendarResponse);
  const metrics = deriveMetrics(performance, xp, lecturesResponse.results);
  const mastery = buildMastery(lectures, assignments, performance);
  const practiceBank = buildPracticeBank(assignments, qotdDetail);
  const signals = buildSignals(lectures, assignments, qotdProfile);

  metrics.streak = qotdProfile?.current_streak ?? 0;

  return {
    student: {
      name: `${safeName(me.first_name)} ${safeName(me.last_name, "")}`.trim(),
      cohort: courseDetails.short_display_name || courseDetails.title,
      targetRole: "AI product engineer",
      ambition: "Build tools that turn messy learning data into momentum",
    },
    course: {
      title: courseDetails.short_display_name || courseDetails.title,
      semester: courseDetails.title,
      campus: courseDetails.college?.name || "Newton School",
      mode: "Live Newton semester",
      hash: selectedCourseHash,
    },
    source: {
      mode: "live",
      provider: "newton-api",
      syncedAt: new Date().toISOString(),
      label: "Live Newton data",
    },
    metrics,
    events,
    assignments,
    lectures,
    mastery,
    practiceBank,
    qotd: {
      title: qotdDetail?.assignmentQuestionTitle || "No QOTD available",
      difficulty: "Medium",
      streak: qotdProfile?.current_streak ?? 0,
      attemptedBy: qotdDetail?.attemptedByCount ?? 0,
      solvedBy: qotdProfile?.completed_count ?? 0,
    },
    arena: {
      solvedCount: arenaStats?.solved_questions_count ?? 0,
      todaySolvedCount: arenaStats?.current_day_solved_questions_count ?? 0,
      totalQuestions: arenaStats?.total_questions ?? 0,
    },
    signals,
  };
}
