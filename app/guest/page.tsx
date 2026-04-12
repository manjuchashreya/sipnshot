"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { tasteOptions } from "@/lib/types";

const TOLERANCE_OPTIONS = ["Low", "Medium", "High"] as const;
const BUDGET_OPTIONS = ["Value", "Mid", "Premium"] as const;
const CATEGORY_OPTIONS = ["Whiskey", "Gin", "Vodka", "Rum", "Tequila", "Beer", "Wine", "All spirits"] as const;

function GuestFormInner() {
    const searchParams = useSearchParams();
    const [eventInfo, setEventInfo] = useState<{ event: string; date: string; city: string } | null>(null);
    const [name, setName] = useState("");
    const [tastes, setTastes] = useState<string[]>([]);
    const [allergyNote, setAllergyNote] = useState("");
    const [tolerance, setTolerance] = useState<"Low" | "Medium" | "High">("Medium");
    const [budget, setBudget] = useState<"Value" | "Mid" | "Premium">("Mid");
    const [dislikedCategories, setDislikedCategories] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    useEffect(() => {
        const raw = searchParams.get("event");
        if (raw) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(raw)));
                setEventInfo(decoded);
            } catch {
                // ignore
            }
        }
    }, [searchParams]);

    function toggleTaste(t: string) {
        setTastes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
    }

    function toggleCategory(c: string) {
        setDislikedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
    }

    function handleSubmit() {
        const prefs = { name, tastes, allergyNote, tolerance, budget, dislikedCategories };
        const encoded = btoa(encodeURIComponent(JSON.stringify(prefs)));
        const url = `${window.location.origin}/guest/merge?prefs=${encoded}`;
        setShareUrl(url);
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="guest-form-shell">
                <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
                    <h2>Thanks, {name}!</h2>
                    <p className="muted">Your preferences are saved. Share the link below with the party host.</p>
                    <div className="inline-form" style={{ justifyContent: "center", marginTop: 16 }}>
                        <input className="input" value={shareUrl} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
                        <button className="button" onClick={() => { navigator.clipboard.writeText(shareUrl); }}>
                            Copy link
                        </button>
                    </div>
                    <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                        The host will merge your preferences into the party plan.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="guest-form-shell">
            <div className="card">
                <div className="eyebrow">Guest Preferences</div>
                {eventInfo ? (
                    <h2>You&apos;re invited to {eventInfo.event}</h2>
                ) : (
                    <h2>Add your drink preferences</h2>
                )}
                {eventInfo && (
                    <p className="muted">
                        {eventInfo.city} · {new Date(eventInfo.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                    </p>
                )}
            </div>

            <div className="card stack">
                <label>
                    <strong>Your name</strong>
                    <input className="input" placeholder="e.g. Alice" value={name} onChange={(e) => setName(e.target.value)} style={{ marginTop: 8 }} />
                </label>

                <div>
                    <strong>Taste preferences</strong>
                    <div className="chip-grid" style={{ marginTop: 10 }}>
                        {tasteOptions.map((t) => (
                            <button
                                key={t}
                                className={`chip-button ${tastes.includes(t) ? "chip-button--active" : ""}`}
                                onClick={() => toggleTaste(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <label>
                    <strong>Allergy or dietary note</strong>
                    <input className="input" placeholder="e.g. No gluten, No nuts" value={allergyNote} onChange={(e) => setAllergyNote(e.target.value)} style={{ marginTop: 8 }} />
                </label>

                <div>
                    <strong>Alcohol tolerance</strong>
                    <div className="chip-grid" style={{ marginTop: 10 }}>
                        {TOLERANCE_OPTIONS.map((tol) => (
                            <button
                                key={tol}
                                className={`chip-button ${tolerance === tol ? "chip-button--active" : ""}`}
                                onClick={() => setTolerance(tol)}
                            >
                                {tol}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <strong>Budget</strong>
                    <div className="chip-grid" style={{ marginTop: 10 }}>
                        {BUDGET_OPTIONS.map((b) => (
                            <button
                                key={b}
                                className={`chip-button ${budget === b ? "chip-button--active" : ""}`}
                                onClick={() => setBudget(b)}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <strong>Categories to avoid</strong>
                    <div className="chip-grid" style={{ marginTop: 10 }}>
                        {CATEGORY_OPTIONS.map((c) => (
                            <button
                                key={c}
                                className={`chip-button ${dislikedCategories.includes(c) ? "chip-button--active" : ""}`}
                                onClick={() => toggleCategory(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="button"
                    style={{ marginTop: 8 }}
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                >
                    Submit preferences →
                </button>
            </div>
        </div>
    );
}

export default function GuestPage() {
    return (
        <Suspense fallback={<div className="guest-form-shell"><div className="card"><p>Loading…</p></div></div>}>
            <GuestFormInner />
        </Suspense>
    );
}
