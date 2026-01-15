"use client";

import React, { useMemo, useState } from "react";
import { Button, Chip, Divider, Field, SectionTitle, Toggle } from "./ui";
import { TimePicker, Toast, toStr } from "./time";
import { Rule, WORKTYPE_LABEL, WORKTYPE_TONE, cloneRule, tagList } from "./types";
import { seedRules } from "./seed";
import { WizardModal } from "./Wizard";

function nextIdFrom(rules: Rule[]) {
  const nums = rules
    .map((r) => Number(String(r.id).split("-")[1] || "0"))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => b - a);
  const next = (nums[0] || 0) + 1;
  return `R-${String(next).padStart(3, "0")}`;
}

export default function MainPage() {
  const [rules, setRules] = useState<Rule[]>(() => seedRules.map((r) => ({ ...r, tags: tagList(r) })));
  const [selectedId, setSelectedId] = useState<string>(rules[1]?.id || rules[0].id);

  const selected = useMemo(() => rules.find((r) => r.id === selectedId)!, [rules, selectedId]);

  const [filters, setFilters] = useState({ type: "전체", useYn: "전체", q: "" });
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Rule>(() => cloneRule(selected));
  const [toast, setToast] = useState("");

  const [wizardOpen, setWizardOpen] = useState(false);

  React.useEffect(() => {
    setEditMode(false);
    setDraft(cloneRule(selected));
  }, [selectedId]);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const typeOk = filters.type === "전체" ? true : r.tags.includes(mapTypeToKey(filters.type));
      const useOk = filters.useYn === "전체" ? true : r.useYn === filters.useYn;
      const qOk = filters.q.trim() === "" ? true : (r.name + " " + r.desc).toLowerCase().includes(filters.q.toLowerCase());
      return typeOk && useOk && qOk;
    });
  }, [rules, filters]);

  const nextId = useMemo(() => nextIdFrom(rules), [rules]);

  return (
    <div className="min-h-screen">
      <TopBar />

      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <div className="flex gap-3">
          <SideIconBar />

          <div className="flex w-full gap-3">
            <LeftMenu />

            <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
                <div className="text-sm font-extrabold text-slate-900">근무시간 관리</div>
              </div>

              {/* filter row */}
              <div className="grid grid-cols-12 items-end gap-3 px-6 py-4">
                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs font-bold text-slate-500 mb-1">근무유형</div>
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm font-bold"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    {["전체", "기본", "조기", "연장", "야간", "휴일"].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs font-bold text-slate-500 mb-1">사용 여부</div>
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm font-bold"
                    value={filters.useYn}
                    onChange={(e) => setFilters({ ...filters, useYn: e.target.value })}
                  >
                    {["전체", "사용", "미사용"].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <div className="text-xs font-bold text-slate-500 mb-1">검색</div>
                  <input
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    placeholder="검색어를 입력해주세요."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  />
                </div>

                <div className="col-span-12 md:col-span-2 flex justify-end">
                  <Button tone="primary" onClick={() => setWizardOpen(true)}>
                    +시간 기준 추가
                  </Button>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-12 gap-3 px-6 py-4">
                {/* list */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="text-sm font-extrabold text-slate-800 mb-3">기준 근무 기준</div>
                  <div className="space-y-2">
                    {filtered.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedId(r.id)}
                        className={[
                          "w-full rounded-xl border p-3 text-left transition",
                          r.id === selectedId ? "border-alpeta-blue bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">{r.name}</div>
                            <div className="mt-0.5 text-xs font-bold text-slate-500">{r.desc}</div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {r.tags.map((k) => (
                                <Chip key={k} tone={WORKTYPE_TONE[k]}>
                                  {WORKTYPE_LABEL[k]}
                                </Chip>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs font-extrabold text-slate-700">{r.useYn}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* detail */}
                <div className="col-span-12 lg:col-span-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-slate-800">기준 상세</div>
                    {!editMode ? (
                      <Button tone="neutral" onClick={() => setEditMode(true)}>
                        편집
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          tone="neutral"
                          onClick={() => {
                            setEditMode(false);
                            setDraft(cloneRule(selected));
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          tone="primary"
                          onClick={() => {
                            setRules((prev) => prev.map((x) => (x.id === draft.id ? { ...draft, tags: tagList(draft) } : x)));
                            setEditMode(false);
                            setToast("저장되었습니다.");
                          }}
                        >
                          저장
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {draft.tags.map((k) => (
                        <Chip key={k} tone={WORKTYPE_TONE[k]}>
                          {WORKTYPE_LABEL[k]}
                        </Chip>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                      <Field label="기준 이름">
                        <input
                          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50"
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          disabled={!editMode}
                        />
                      </Field>
                      <Field label="설명">
                        <input
                          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50"
                          value={draft.desc}
                          onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                          disabled={!editMode}
                        />
                      </Field>
                      <Field label="사용 여부">
                        <select
                          className="h-9 w-40 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold disabled:bg-slate-50"
                          value={draft.useYn}
                          onChange={(e) => setDraft({ ...draft, useYn: e.target.value as any })}
                          disabled={!editMode}
                        >
                          <option value="사용">사용</option>
                          <option value="미사용">미사용</option>
                        </select>
                      </Field>
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-6">
                          <Field label="시간 산출 단위">
                            <select
                              className="h-9 w-40 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold disabled:bg-slate-50"
                              value={draft.timeUnit}
                              onChange={(e) => setDraft({ ...draft, timeUnit: e.target.value as any })}
                              disabled={!editMode}
                            >
                              {["1분", "10분", "15분", "30분"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                        <div className="col-span-6">
                          <Field label="반올림 방식">
                            <select
                              className="h-9 w-40 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold disabled:bg-slate-50"
                              value={draft.rounding}
                              onChange={(e) => setDraft({ ...draft, rounding: e.target.value as any })}
                              disabled={!editMode}
                            >
                              {["버림", "반올림", "올림"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                      <SectionTitle>기본 근무</SectionTitle>
                      <Field label="근무일 기준 시간">
                        <div className="flex items-center gap-3">
                          <TimePicker value={draft.dayRange.start} onChange={(v) => setDraft({ ...draft, dayRange: { ...draft.dayRange, start: v } })} disabled={!editMode} />
                          <span className="text-sm text-slate-400">~</span>
                          <TimePicker value={draft.dayRange.end} onChange={(v) => setDraft({ ...draft, dayRange: { ...draft.dayRange, end: v } })} disabled={!editMode} />
                        </div>
                      </Field>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-extrabold text-slate-800">근무 제외 시간 설정</div>
                          <div className="text-xs font-bold text-slate-500">근무시간 계산에서 제외할 구간을 설정합니다.</div>
                        </div>
                        <Toggle checked={draft.excludeEnabled} onChange={(v) => setDraft({ ...draft, excludeEnabled: v })} disabled={!editMode} />
                      </div>

                      <div className="space-y-2 pl-1">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={draft.excludeOutside}
                            onChange={(e) => setDraft({ ...draft, excludeOutside: e.target.checked })}
                            disabled={!editMode || !draft.excludeEnabled}
                          />
                          외출 시간 근무에서 제외
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={draft.excludeBreak}
                            onChange={(e) => setDraft({ ...draft, excludeBreak: e.target.checked })}
                            disabled={!editMode || !draft.excludeEnabled}
                          />
                          중간에 나간 시간 근무에서 제외
                        </label>
                      </div>
                    </div>

                    {draft.nightEnabled ? (
                      <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                        <SectionTitle>야간 근무</SectionTitle>
                        <Field label="야간 시간 구간">
                          <div className="flex items-center gap-3">
                            <TimePicker value={draft.nightStart} onChange={(v) => setDraft({ ...draft, nightStart: v })} disabled={!editMode} />
                            <span className="text-sm text-slate-400">~</span>
                            <TimePicker value={draft.nightEnd} onChange={(v) => setDraft({ ...draft, nightEnd: v })} disabled={!editMode} />
                            <label className="ml-2 inline-flex items-center gap-2 text-sm font-bold">
                              <input type="checkbox" checked={draft.nightCrossDay} onChange={(e) => setDraft({ ...draft, nightCrossDay: e.target.checked })} disabled={!editMode} />
                              익일로 넘어감(+1일)
                            </label>
                          </div>
                        </Field>
                        <Field label="인정 시간 범위">
                          <div className="flex items-center gap-2">
                            <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold disabled:bg-slate-50" value={draft.nightMin} onChange={(e) => setDraft({ ...draft, nightMin: e.target.value as any })} disabled={!editMode}>
                              {["1분", "5분", "10분", "15분", "30분"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                            <span className="text-sm text-slate-400">분 (최소)</span>
                            <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold disabled:bg-slate-50" value={draft.nightMax} onChange={(e) => setDraft({ ...draft, nightMax: e.target.value as any })} disabled={!editMode}>
                              {["30분", "60분", "120분", "180분", "240분"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                            <span className="text-sm text-slate-400">분 (최대)</span>
                          </div>
                        </Field>
                      </div>
                    ) : null}

                    {draft.holidayEnabled ? (
                      <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                        <SectionTitle>휴일 근무</SectionTitle>
                        <Field label="휴일 판별 기준">
                          <div className="flex items-center gap-4">
                            {["공휴일 캘린더", "사용자 지정"].map((x) => (
                              <label key={x} className="inline-flex items-center gap-2 text-sm font-bold">
                                <input type="radio" checked={draft.holidayBasis === (x as any)} onChange={() => setDraft({ ...draft, holidayBasis: x as any })} disabled={!editMode} />
                                {x}
                              </label>
                            ))}
                          </div>
                        </Field>
                        <Field label="휴일 결근 처리">
                          <div className="flex items-center gap-3">
                            <Toggle checked={draft.holidayAbsenceIgnore} onChange={(v) => setDraft({ ...draft, holidayAbsenceIgnore: v })} disabled={!editMode} />
                            <span className="text-sm font-bold text-slate-700">결근 시 무시함(휴일에 적용)</span>
                          </div>
                        </Field>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        nextId={nextId}
        onCreate={(newRule) => {
          setRules((prev) => [newRule, ...prev]);
          setSelectedId(newRule.id);
          setWizardOpen(false);
          setToast("기준이 생성되었습니다.");
        }}
      />

      <Toast open={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function mapTypeToKey(t: string) {
  switch (t) {
    case "기본":
      return "basic";
    case "조기":
      return "early";
    case "연장":
      return "overtime";
    case "야간":
      return "night";
    case "휴일":
      return "holiday";
    default:
      return "basic";
  }
}

function TopBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-lg font-extrabold">Alpeta</div>
          <div className="rounded bg-alpeta-blue px-2 py-0.5 text-xs font-extrabold text-white">X</div>
        </div>
        <div className="text-xs font-bold text-slate-400">Copyright slogan text area</div>

        <div className="flex-1" />

        <div className="w-[520px] max-w-[44vw]">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
            <span className="text-slate-400">🔎</span>
            <input className="w-full outline-none text-sm" placeholder="Search  사용자, 기능" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="알림">
            🔔
          </button>
          <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="도움말">
            ❔
          </button>
          <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="설정">
            ⚙
          </button>
        </div>
      </div>
    </div>
  );
}

function SideIconBar() {
  const items = ["Dashboard", "User", "Device", "Access", "FMS", "Guard", "HR"];
  return (
    <div className="w-14 shrink-0">
      <div className="sticky top-[72px] flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 shadow-card">
        {items.map((x, idx) => (
          <div key={x} className="flex flex-col items-center gap-1">
            <div className={["h-9 w-9 rounded-full grid place-items-center text-xs font-extrabold", x === "HR" ? "bg-alpeta-blue text-white" : "bg-slate-100 text-slate-700"].join(" ")}>
              ic
            </div>
            <div className="text-[10px] font-bold text-slate-500">{x}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeftMenu() {
  return (
    <div className="w-[220px] shrink-0">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <div className="rounded-xl bg-alpeta-blue px-3 py-1 text-xs font-extrabold text-white">근무기준 관리</div>
          <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">리포트</div>
          <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">식수관리</div>
        </div>

        <div className="p-3 space-y-2">
          {["근무유형 관리", "근무일정 관리", "근무시간 관리"].map((x) => (
            <div key={x} className={["flex items-center justify-between rounded-lg px-3 py-2 text-sm font-extrabold", x === "근무시간 관리" ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"].join(" ")}>
              <span>{x}</span>
              <span className="text-slate-400">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
