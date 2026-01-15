import { TimeValue } from "./time";

export type WorkTypeKey = "basic" | "early" | "overtime" | "night" | "holiday";

export type Rule = {
  id: string;
  name: string;
  desc: string;
  useYn: "사용" | "미사용";
  tags: WorkTypeKey[]; // 표시용
  // 공통
  timeUnit: "1분" | "10분" | "15분" | "30분";
  rounding: "버림" | "반올림" | "올림";
  dayRange: { start: TimeValue; end: TimeValue };

  // 기본근무
  excludeEnabled: boolean;
  excludeOutside: boolean;
  excludeBreak: boolean;

  // 조기근무(선택)
  earlyEnabled: boolean;
  earlyMode: "기본근무 시작 시간 이전" | "특정 시간 구간";
  earlyStart: TimeValue;
  earlyEnd: TimeValue;
  earlyMin: "1분" | "5분" | "10분" | "15분" | "30분";
  earlyMax: "30분" | "60분" | "120분" | "180분" | "240분";
  earlyExcludeFromBasic: boolean;

  // 연장근무(선택)
  overtimeEnabled: boolean;
  overtimeMode: "기본근무 초과" | "동일시간 초과";
  overtimeMin: "1분" | "5분" | "10분" | "15분" | "30분";
  overtimeMax: "30분" | "60분" | "120분" | "180분" | "240분";
  overlapPolicy: "근무 유형별 분리 인정" | "최대 1개만 인정";
  overlapEarly: boolean;
  overlapNight: boolean;
  overlapHoliday: boolean;

  // 야간근무(선택)
  nightEnabled: boolean;
  nightStart: TimeValue;
  nightEnd: TimeValue;
  nightCrossDay: boolean;
  nightMin: "1분" | "5분" | "10분" | "15분" | "30분";
  nightMax: "30분" | "60분" | "120분" | "180분" | "240분";
  nightExcludeFromBasic: boolean;

  // 휴일근무(선택)
  holidayEnabled: boolean;
  holidayBasis: "공휴일 캘린더" | "사용자 지정";
  holidayAbsenceIgnore: boolean; // 휴일 결근 처리(무시)
  holidayMin: "1분" | "5분" | "10분" | "15분" | "30분";
  holidayMax: "30분" | "60분" | "120분" | "180분" | "240분";
  holidayExcludeFromBasic: boolean;
};

export const WORKTYPE_LABEL: Record<WorkTypeKey, string> = {
  basic: "기본",
  early: "조기",
  overtime: "연장",
  night: "야간",
  holiday: "휴일",
};

export const WORKTYPE_TONE: Record<WorkTypeKey, "slate" | "blue" | "purple" | "orange" | "green"> = {
  basic: "slate",
  early: "green",
  overtime: "orange",
  night: "blue",
  holiday: "purple",
};

export function tagList(rule: Rule) {
  const out: WorkTypeKey[] = ["basic"];
  if (rule.earlyEnabled) out.push("early");
  if (rule.overtimeEnabled) out.push("overtime");
  if (rule.nightEnabled) out.push("night");
  if (rule.holidayEnabled) out.push("holiday");
  return out;
}

export function cloneRule(r: Rule): Rule {
  return JSON.parse(JSON.stringify(r));
}
