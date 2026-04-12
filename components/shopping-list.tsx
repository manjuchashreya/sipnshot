"use client";

import { useState } from "react";
import { useSipwise } from "@/components/sipwise-provider";
import { calcBottles, totalBudget } from "@/lib/bottle-calc";
import { AppShell } from "./app-shell";

export function ShoppingList() {
    const { state } = useSipwise();
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [altChecked, setAltChecked] = useState<Record<string, boolean>>({});

    const suggestions = state.aiResult?.suggestions ?? [];
    const avgTolerance =
        [state.profile, ...state.guestProfiles].reduce(
            (sum, p) => sum + (p.tolerance === "Low" ? 0 : p.tolerance === "High" ? 2 : 1),
            0
        ) / Math.max(1, 1 + state.guestProfiles.length) > 1.5
            ? "High"
            : [state.profile, ...state.guestProfiles].reduce(
                (sum, p) => sum + (p.tolerance === "Low" ? 0 : p.tolerance === "High" ? 2 : 1),
                0
            ) /
                Math.max(1, 1 + state.guestProfiles.length) <
                0.75
                ? "Low"
                : "Medium";

    const estimates = calcBottles(
        suggestions,
        state.party,
        state.eventPreferences,
        avgTolerance as "Low" | "Medium" | "High"
    );
    const budget = totalBudget(estimates);

    function toggle(key: string) {
        setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
    }
    function toggleAlt(key: string) {
        setAltChecked((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function copyList() {
        const lines = estimates.map((e) => {
            const base = `[ ] ${e.suggestion.name} × ${e.bottlesNeeded} bottle${e.bottlesNeeded !== 1 ? "s" : ""} (${e.currency}${e.totalMin.toLocaleString()}–${e.currency}${e.totalMax.toLocaleString()})`;
            const alt = e.suggestion.alternative ? `\n  Alt: ${e.suggestion.alternative}` : "";
            return base + alt;
        });
        const total = `\nTotal estimate: ${budget.currency}${budget.totalMin.toLocaleString()}–${budget.currency}${budget.totalMax.toLocaleString()}`;
        navigator.clipboard.writeText(lines.join("\n") + total);
    }

    if (suggestions.length === 0) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                <h2>No suggestions yet</h2>
                <p className="muted">Go to <a href="/" style={{ color: "var(--accent)" }}>Start Here</a> and get AI recommendations first.</p>
            </div>
        );
    }

    return (
        <div className="stack">
            <div className="card feature-card">
                <div className="eyebrow">Shopping List</div>
                <h2>What to buy for tonight</h2>
                <p className="muted">
                    For <strong>{state.party.peopleCount} people</strong> over{" "}
                    <strong>{state.party.eventDurationHours ?? 4} hours</strong> in{" "}
                    <strong>{state.party.city || state.party.region}</strong>.
                    Estimates based on avg. tolerance.
                </p>
            </div>

            <div className="card card--full">
                <div className="section-heading">
                    <h2>Drink Checklist</h2>
                    <div className="button-row">
                        <button className="button secondary" onClick={copyList}>Copy list</button>
                        <button className="button secondary" onClick={() => window.print()}>Print</button>
                    </div>
                </div>

                <div className="shopping-list">
                    {estimates.map((e, i) => {
                        const key = `main-${i}`;
                        const altKey = `alt-${i}`;
                        return (
                            <div key={key} className={`shopping-item ${checked[key] ? "shopping-item--done" : ""}`}>
                                <label className="shopping-check">
                                    <input
                                        type="checkbox"
                                        checked={!!checked[key]}
                                        onChange={() => toggle(key)}
                                    />
                                    <div className="shopping-item__body">
                                        <div className="shopping-item__main">
                                            <strong>{e.suggestion.name}</strong>
                                            <span className="shopping-item__qty">
                                                × {e.bottlesNeeded} bottle{e.bottlesNeeded !== 1 ? "s" : ""}
                                            </span>
                                            <span className="badge">
                                                {e.currency}{e.totalMin.toLocaleString()}–{e.currency}{e.totalMax.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="muted shopping-item__meta">
                                            {e.suggestion.category} · ~{e.currency}{e.priceMin.toLocaleString()}-{e.currency}{e.priceMax.toLocaleString()} / bottle · {e.suggestion.abv} ABV
                                        </p>
                                    </div>
                                </label>

                                {e.suggestion.alternative && (
                                    <label
                                        className={`shopping-alt ${altChecked[altKey] ? "shopping-item--done" : ""}`}
                                        title="Alternative pick"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!altChecked[altKey]}
                                            onChange={() => toggleAlt(altKey)}
                                        />
                                        <span className="shopping-alt__label">
                                            Alt: <strong>{e.suggestion.alternative}</strong>
                                        </span>
                                    </label>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="budget-summary">
                    <div>
                        <strong>Estimated total spend</strong>
                        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                            Based on {state.party.peopleCount} guests × {state.party.eventDurationHours ?? 4} hrs
                        </p>
                    </div>
                    <div className="budget-total">
                        {budget.currency}{budget.totalMin.toLocaleString()}
                        <span> – </span>
                        {budget.currency}{budget.totalMax.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
