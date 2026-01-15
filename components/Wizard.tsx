"use client";

import React, { useMemo, useState } from "react";
import { Button, Chip, Divider, Field, SectionTitle, Toggle } from "./ui";
import { InlineHint, TimePicker, Toast, TimeValue, toStr } from "./time";
import { Rule, WORKTYPE_LABEL, WORKTYPE_TONE, WorkTypeKey, cloneRule, tagList } from "./types";

const TIME_UNITS: Rule["timeUnit"][] = ["1분", "10분", "15분", "30분"];
const ROUNDINGS: Rule["rounding"][] = ["버림", "반올림", "올림"];
const MIN_OPTS: any[] = ["1분", "5분", "10분", "15분", "30분"];
const MAX_OPTS: any[] = ["30분", "60분", "120분", "180분", "240분"];

function makeDraft(nextId: string): Rule {
  return {
    id: nextId,
    name: "",
    desc: "",
    useYn: "사용",
    tags: ["basic"],
    timeUnit: "1분",
    rounding: "버림",
    dayRange: { start: { hh: "00", mm: "00" }, end: { hh: "23", mm: "59" } },

    excludeEnabled: true,
    excludeOutside: true,
    excludeBreak: true,

    earlyEnabled: false,
    earlyMode: "기본근무 시작 시간 이전",
    earlyStart: { hh: "00", mm: "00" },
    earlyEnd: { hh: "00", mm: "00" },
    earlyMin: "1분",
    earlyMax: "60분",
    earlyExcludeFromBasic: false,

    overtimeEnabled: false,
    overtimeMode: "기본근무 초과",
    overtimeMin: "1분",
    overtimeMax: "120분",
    overlapPolicy: "근무 유형별 분리 인정",
    overlapEarly: false,
    overlapNight: true,
    overlapHoliday: true,

    nightEnabled: false,
    nightStart: { hh: "22", mm: "00" },
    nightEnd: { hh: "06", mm: "00" },
    nightCrossDay: true,
    nightMin: "1분",
    nightMax: "120분",
    nightExcludeFromBasic: false,

    holidayEnabled: false,
    holidayBasis: "공휴일 캘린더",
    holidayAbsenceIgnore: true,
    holidayMin: "1분",
    holidayMax: "120분",
    holidayExcludeFromBasic: false,
  };
}

export function WizardModal({
  open,
  onClose,
  onCreate,
  nextId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (rule: Rule) => void;
  nextId: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [draft, setDraft] = useState<Rule>(() => makeDraft(nextId));
  const [toast, setToast] = useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    setStep(1);
    setDraft(makeDraft(nextId));
  }, [open, nextId]);

  const steps = [
    { n: 1, label: "기본 정보" },
    { n: 2, label: "기준 설정" },
    { n: 3, label: "근무 유형 설정" },
    { n: 4, label: "기준 미리보기" },
  ] as const;

  const canNext1 = draft.name.trim().length > 0;

  const selectedTypes = useMemo(() => tagList(draft), [draft]);

  const preview = useMemo(() => {
    const lines: { k: string; v: string }[] = [];
    lines.push({ k: "시간 산출 단위", v: `${draft.timeUnit} 단위 · ${draft.rounding}` });
    lines.push({ k: "당일 근태 처리 구간", v: `${toStr(draft.dayRange.start)} ~ ${toStr(draft.dayRange.end)}` });
    lines.push({ k: "근무 제외", v: draft.excludeEnabled ? "외출/중간이탈 제외" : "미사용" });
    if (draft.earlyEnabled) lines.push({ k: "조기근무", v: `${draft.earlyMin} (최소) · ${draft.earlyMax} (최대)` });
    if (draft.overtimeEnabled) lines.push({ k: "연장근무", v: `${draft.overtimeMin} (최소) · ${draft.overtimeMax} (최대)` });
    if (draft.nightEnabled) lines.push({ k: "야간근무", v: `${toStr(draft.nightStart)} ~ ${toStr(draft.nightEnd)}${draft.nightCrossDay ? " (익일)" : ""}` });
    if (draft.holidayEnabled) lines.push({ k: "휴일근무", v: `${draft.holidayBasis} · 결근 시 ${draft.holidayAbsenceIgnore ? "무시" : "적용"}` });
    return lines;
  }, [draft]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/35" onClick={onClose} />
      <div className="relative w-[920px] max-w-[92vw] rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-lg font-extrabold">근무 시간 기준 만들기</div>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="flex items-center gap-2">
            {steps.map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold",
                    step === s.n ? "border-alpeta-blue bg-blue-50 text-alpeta-blue" : "border-slate-200 bg-white text-slate-600",
                  ].join(" ")}
                >
                  <span className={step > s.n ? "text-emerald-600" : ""}>{step > s.n ? "✓" : s.n}</span>
                  <span>{s.label}</span>
                </div>
                {s.n !== 4 ? <span className="text-slate-300">›</span> : null}
              </div>
            ))}
          </div>
        </div>

        <Divider />

        <div className="max-h-[70vh] overflow-auto px-6 py-5">
          {step === 1 ? (
            <div className="space-y-4">
              <SectionTitle>근무 시간 기준 정보</SectionTitle>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="space-y-3">
                  <Field label="기준 이름">
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      placeholder="예: 기본 근무 기준 (1)"
                    />
                  </Field>
                  <Field label="설명">
                    <input
                      value={draft.desc}
                      onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      placeholder="예: 사무직 기본 근무 시간 계산"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <SectionTitle>기준 설정</SectionTitle>
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                  <Field label="시간 산출 단위">
                    <div className="flex flex-wrap items-center gap-4">
                      {TIME_UNITS.map((u) => (
                        <label key={u} className="inline-flex items-center gap-2 text-sm font-bold">
                          <input type="radio" checked={draft.timeUnit === u} onChange={() => setDraft({ ...draft, timeUnit: u })} />
                          {u}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="반올림 방식">
                    <div className="flex flex-wrap items-center gap-4">
                      {ROUNDINGS.map((r) => (
                        <label key={r} className="inline-flex items-center gap-2 text-sm font-bold">
                          <input type="radio" checked={draft.rounding === r} onChange={() => setDraft({ ...draft, rounding: r })} />
                          {r}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="당일 근태 처리 구간">
                    <div className="flex items-center gap-3">
                      <TimePicker value={draft.dayRange.start} onChange={(v) => setDraft({ ...draft, dayRange: { ...draft.dayRange, start: v } })} />
                      <span className="text-sm text-slate-400">~</span>
                      <TimePicker value={draft.dayRange.end} onChange={(v) => setDraft({ ...draft, dayRange: { ...draft.dayRange, end: v } })} />
                    </div>
                  </Field>

                  <div className="text-xs text-slate-500 leading-5">
                    ※ 설정한 구간을 넘어가는 근무는 다음 근무일로 계산됩니다.
                    <br />
                    ※ 종료 시간이 시작 시간보다 빠른 경우, 다음 날까지 포함하여 계산합니다.
                    <br />
                    <span className="font-bold text-slate-700">※ 시간기준은 계산 기준이며 근무시간을 정의하지 않음</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <SectionTitle>근무 시간 유형 선택</SectionTitle>

              <div className="grid grid-cols-5 gap-2">
                <WorkTypeCard title="기본 근무" required selected={true} onClick={() => {}} />
                <WorkTypeCard title="조기 근무" selected={draft.earlyEnabled} onClick={() => setDraft({ ...draft, earlyEnabled: !draft.earlyEnabled })} />
                <WorkTypeCard title="연장 근무" selected={draft.overtimeEnabled} onClick={() => setDraft({ ...draft, overtimeEnabled: !draft.overtimeEnabled })} />
                <WorkTypeCard title="야간 근무" selected={draft.nightEnabled} onClick={() => setDraft({ ...draft, nightEnabled: !draft.nightEnabled })} />
                <WorkTypeCard title="휴일 근무" selected={draft.holidayEnabled} onClick={() => setDraft({ ...draft, holidayEnabled: !draft.holidayEnabled })} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <SectionTitle>공통 설정</SectionTitle>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">근무 제외 시간 설정</div>
                    <InlineHint>근무시간 계산에서 제외할 구간을 설정합니다.</InlineHint>
                  </div>
                  <Toggle checked={draft.excludeEnabled} onChange={(v) => setDraft({ ...draft, excludeEnabled: v })} />
                </div>
                <div className="space-y-2 pl-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.excludeOutside}
                      onChange={(e) => setDraft({ ...draft, excludeOutside: e.target.checked })}
                      disabled={!draft.excludeEnabled}
                    />
                    외출 시간 근무에서 제외
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.excludeBreak}
                      onChange={(e) => setDraft({ ...draft, excludeBreak: e.target.checked })}
                      disabled={!draft.excludeEnabled}
                    />
                    중간에 나간 시간 근무에서 제외
                  </label>
                </div>
              </div>

              {/* 조기 */}
              {draft.earlyEnabled ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <SectionTitle>조기 근무 세부 설정</SectionTitle>
                  <Field label="조기근무 기준">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm font-bold">
                        <input
                          type="radio"
                          checked={draft.earlyMode === "기본근무 시작 시간 이전"}
                          onChange={() => setDraft({ ...draft, earlyMode: "기본근무 시작 시간 이전" })}
                        />
                        기본근무 시작 시간 이전
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm font-bold">
                        <input
                          type="radio"
                          checked={draft.earlyMode === "특정 시간 구간"}
                          onChange={() => setDraft({ ...draft, earlyMode: "특정 시간 구간" })}
                        />
                        특정 시간 구간
                      </label>
                    </div>
                  </Field>

                  {draft.earlyMode === "특정 시간 구간" ? (
                    <Field label="특정 시간 구간">
                      <div className="flex items-center gap-3">
                        <TimePicker value={draft.earlyStart} onChange={(v) => setDraft({ ...draft, earlyStart: v })} />
                        <span className="text-sm text-slate-400">~</span>
                        <TimePicker value={draft.earlyEnd} onChange={(v) => setDraft({ ...draft, earlyEnd: v })} />
                      </div>
                    </Field>
                  ) : (
                    <Field label="기준시간">
                      <div className="text-sm font-bold text-slate-700">기본근무 시작 시간 이전 구간을 조기근무로 처리</div>
                    </Field>
                  )}

                  <Field label="인정 시간 범위">
                    <div className="flex items-center gap-2">
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.earlyMin} onChange={(e) => setDraft({ ...draft, earlyMin: e.target.value as any })}>
                        {MIN_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최소)</span>
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.earlyMax} onChange={(e) => setDraft({ ...draft, earlyMax: e.target.value as any })}>
                        {MAX_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최대)</span>
                    </div>
                  </Field>

                  <Field label="기본 근무 시간으로 집계">
                    <Toggle checked={draft.earlyExcludeFromBasic} onChange={(v) => setDraft({ ...draft, earlyExcludeFromBasic: v })} />
                  </Field>
                </div>
              ) : null}

              {/* 연장 */}
              {draft.overtimeEnabled ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <SectionTitle>연장 근무 세부 설정</SectionTitle>
                  <Field label="연장근무 기준">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm font-bold">
                        <input type="radio" checked={draft.overtimeMode === "기본근무 초과"} onChange={() => setDraft({ ...draft, overtimeMode: "기본근무 초과" })} />
                        기본근무 초과
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm font-bold">
                        <input type="radio" checked={draft.overtimeMode === "동일시간 초과"} onChange={() => setDraft({ ...draft, overtimeMode: "동일시간 초과" })} />
                        동일시간 초과
                      </label>
                    </div>
                  </Field>

                  <Field label="인정 시간 범위">
                    <div className="flex items-center gap-2">
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.overtimeMin} onChange={(e) => setDraft({ ...draft, overtimeMin: e.target.value as any })}>
                        {MIN_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최소)</span>
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.overtimeMax} onChange={(e) => setDraft({ ...draft, overtimeMax: e.target.value as any })}>
                        {MAX_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최대)</span>
                    </div>
                  </Field>

                  <Divider />
                  <SectionTitle>중복 처리</SectionTitle>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold">
                      <input
                        type="radio"
                        checked={draft.overlapPolicy === "근무 유형별 분리 인정"}
                        onChange={() => setDraft({ ...draft, overlapPolicy: "근무 유형별 분리 인정" })}
                      />
                      근무 유형별 분리 인정 <span className="text-xs font-bold text-slate-500">연장 + 야간/휴일 동시 인정 가능</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold">
                      <input type="radio" checked={draft.overlapPolicy === "최대 1개만 인정"} onChange={() => setDraft({ ...draft, overlapPolicy: "최대 1개만 인정" })} />
                      최대 1개만 인정 <span className="text-xs font-bold text-slate-500">겹치는 구간은 연장에서 제외</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={draft.overlapEarly}
                          onChange={(e) => setDraft({ ...draft, overlapEarly: e.target.checked })}
                        />
                        조기근무와 중복
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={draft.overlapNight}
                          onChange={(e) => setDraft({ ...draft, overlapNight: e.target.checked })}
                        />
                        야간근무와 중복
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={draft.overlapHoliday}
                          onChange={(e) => setDraft({ ...draft, overlapHoliday: e.target.checked })}
                        />
                        휴일근무와 중복
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* 야간 */}
              {draft.nightEnabled ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <SectionTitle>야간 근무 세부 설정</SectionTitle>
                  <Field label="야간 시간 구간">
                    <div className="flex items-center gap-3">
                      <TimePicker value={draft.nightStart} onChange={(v) => setDraft({ ...draft, nightStart: v })} />
                      <span className="text-sm text-slate-400">~</span>
                      <TimePicker value={draft.nightEnd} onChange={(v) => setDraft({ ...draft, nightEnd: v })} />
                      <label className="ml-2 inline-flex items-center gap-2 text-sm font-bold">
                        <input type="checkbox" checked={draft.nightCrossDay} onChange={(e) => setDraft({ ...draft, nightCrossDay: e.target.checked })} />
                        익일로 넘어감(+1일)
                      </label>
                    </div>
                  </Field>

                  <Field label="인정 시간 범위">
                    <div className="flex items-center gap-2">
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.nightMin} onChange={(e) => setDraft({ ...draft, nightMin: e.target.value as any })}>
                        {MIN_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최소)</span>
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.nightMax} onChange={(e) => setDraft({ ...draft, nightMax: e.target.value as any })}>
                        {MAX_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최대)</span>
                    </div>
                  </Field>

                  <Field label="기본 근무 시간으로 집계">
                    <Toggle checked={draft.nightExcludeFromBasic} onChange={(v) => setDraft({ ...draft, nightExcludeFromBasic: v })} />
                  </Field>
                </div>
              ) : null}

              {/* 휴일 */}
              {draft.holidayEnabled ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <SectionTitle>휴일근무 세부 설정</SectionTitle>

                  <Field label="휴일 판별 기준">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm font-bold">
                        <input type="radio" checked={draft.holidayBasis === "공휴일 캘린더"} onChange={() => setDraft({ ...draft, holidayBasis: "공휴일 캘린더" })} />
                        공휴일 캘린더
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm font-bold">
                        <input type="radio" checked={draft.holidayBasis === "사용자 지정"} onChange={() => setDraft({ ...draft, holidayBasis: "사용자 지정" })} />
                        사용자 지정
                      </label>
                      <span className="text-xs font-bold text-slate-500">※ 사용자 지정은 근무일정에서 지정</span>
                    </div>
                  </Field>

                  <Field label="휴일 결근 처리">
                    <div className="flex items-center gap-3">
                      <Toggle checked={draft.holidayAbsenceIgnore} onChange={(v) => setDraft({ ...draft, holidayAbsenceIgnore: v })} />
                      <span className="text-sm font-bold text-slate-700">결근 시 무시함(휴일에 적용)</span>
                    </div>
                  </Field>

                  <Field label="인정 시간 범위">
                    <div className="flex items-center gap-2">
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.holidayMin} onChange={(e) => setDraft({ ...draft, holidayMin: e.target.value as any })}>
                        {MIN_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최소)</span>
                      <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm" value={draft.holidayMax} onChange={(e) => setDraft({ ...draft, holidayMax: e.target.value as any })}>
                        {MAX_OPTS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-400">분 (최대)</span>
                    </div>
                  </Field>

                  <Field label="기본 근무 시간으로 집계">
                    <Toggle checked={draft.holidayExcludeFromBasic} onChange={(v) => setDraft({ ...draft, holidayExcludeFromBasic: v })} />
                  </Field>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <SectionTitle>기본 정보</SectionTitle>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-28 font-extrabold text-slate-700">기준명</div>
                    <div className="font-bold">{draft.name || "-"}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-28 font-extrabold text-slate-700">설명</div>
                    <div className="font-bold">{draft.desc || "-"}</div>
                  </div>
                </div>
              </div>

              <SectionTitle>근무 시간 계산 결과</SectionTitle>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="space-y-2">
                  {selectedTypes.map((k) => (
                    <div key={k} className="flex items-center gap-3 text-sm">
                      <Chip tone={WORKTYPE_TONE[k]}>{WORKTYPE_LABEL[k] + "근무"}</Chip>
                      <span className="font-bold text-slate-700">사용</span>
                      <span className="text-xs font-bold text-slate-500">
                        {k === "night" ? `${toStr(draft.nightStart)} ~ ${toStr(draft.nightEnd)}` : k === "holiday" ? `${draft.holidayBasis} 기준` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <SectionTitle>근무 시간 적용 기준 요약</SectionTitle>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-3">
                  {preview.map((x) => (
                    <div key={x.k} className="flex items-start gap-3 text-sm">
                      <div className="w-40 font-extrabold text-slate-700">{x.k}</div>
                      <div className="font-bold text-slate-800">{x.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold text-slate-800">근무시간 계산 순서</div>
                      <ol className="mt-2 list-decimal pl-5 text-xs font-bold text-slate-600 space-y-1">
                        <li>출퇴근 인증 기록 수집</li>
                        <li>근무유형 기준으로 기본 근무 구간 확정</li>
                        <li>근무 제외 시간 차감 (근무 제외)</li>
                        <li>근무 유형/구간별 인정 적용 (시간기준)</li>
                        <li>시간기준별 근무시간 분류</li>
                      </ol>
                    </div>
                    <div className="text-xs font-bold text-slate-500">※ 더미 데이터 기준(운영값과 유사하게 구성)</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Divider />

        <div className="flex items-center justify-between px-6 py-4">
          <div>
            {step > 1 ? (
              <Button tone="neutral" onClick={() => setStep((s) => (s === 2 ? 1 : s === 3 ? 2 : 3) as any)}>
                이전
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <Button
                tone="primary"
                onClick={() => {
                  if (step === 1 && !canNext1) return;
                  setStep((s) => (s + 1) as any);
                }}
                disabled={step === 1 && !canNext1}
              >
                다음
              </Button>
            ) : (
              <Button
                tone="primary"
                onClick={() => {
                  const finalRule = cloneRule(draft);
                  finalRule.tags = tagList(finalRule);
                  onCreate(finalRule);
                  setToast("기준이 생성되었습니다.");
                  setTimeout(() => {
                    onClose();
                    setToast("");
                  }, 400);
                }}
              >
                기준 생성
              </Button>
            )}
          </div>
        </div>
      </div>

      <Toast open={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function WorkTypeCard({
  title,
  selected,
  onClick,
  required,
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
  required?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-left shadow-sm transition",
        selected ? "border-alpeta-blue bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-800">{title}</div>
        <Chip tone={required ? "slate" : "blue"}>{required ? "필수" : "선택"}</Chip>
      </div>
      <div className="mt-1 text-xs font-bold text-slate-500 leading-5">
        {title === "기본 근무" ? "기본근무 시간을 기준으로 근무를 계산합니다." : "해당 근무 유형의 시간을 분리합니다."}
      </div>
    </button>
  );
}
