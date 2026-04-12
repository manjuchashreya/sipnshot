"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useSipwise } from "@/components/sipwise-provider";
import { getRankedRecommendations } from "@/lib/recommendations";
import { calcBottles, totalBudget } from "@/lib/bottle-calc";

export function OnboardingFlow() {
  const {
    state,
    updatePrompt,
    applyPrompt,
    setAiLoading,
    setAiResult,
    setAiError,
  } = useSipwise();

  const recommendations = useMemo(() => getRankedRecommendations(state).slice(0, 3), [state]);

  const avgTolerance = useMemo(() => {
    const all = [state.profile, ...state.guestProfiles];
    const avg = all.reduce((s, p) => s + (p.tolerance === "Low" ? 0 : p.tolerance === "High" ? 2 : 1), 0) / all.length;
    return avg > 1.4 ? "High" : avg < 0.6 ? "Low" : "Medium" as "Low" | "Medium" | "High";
  }, [state]);

  const bottleEstimates = useMemo(() => {
    if (!state.aiResult?.suggestions.length) return [];
    return calcBottles(state.aiResult.suggestions, state.party, state.eventPreferences, avgTolerance);
  }, [state.aiResult, state.party, state.eventPreferences, avgTolerance]);

  const partyBudget = useMemo(() => {
    if (!bottleEstimates.length) return null;
    return totalBudget(bottleEstimates);
  }, [bottleEstimates]);

  async function handleAsk() {
    applyPrompt();
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: state.prompt,
          apiKey: state.apiConfig.openAiApiKey || undefined,
          model: state.apiConfig.openAiModel || undefined,
          state: {
            event: state.event,
            profile: state.profile,
            guestProfiles: state.guestProfiles,
            eventPreferences: state.eventPreferences,
            party: state.party,
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setAiError(payload.error || "Could not generate suggestions.");
        return;
      }

      setAiResult(payload);
    } catch {
      setAiError("Something went wrong while contacting OpenAI.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="app-showcase">
      <section className="hero-search">
        <div className="eyebrow">Start Here</div>
        <h2>Describe the party in one message.</h2>
        <p className="muted">
          Write what kind of event it is, how many people are coming, what people like, what they
          avoid, and where the party is. sip&apos;n shot turns that into drink suggestions and a simple plan.
        </p>
        <div className="search-shell">
          <textarea
            className="prompt-box"
            onChange={(event) => updatePrompt(event.target.value)}
            placeholder="Example: House party in Mumbai for 8 people. Two want beer, one wants wine, one avoids gluten, and we want lighter drinks after 10 PM."
            value={state.prompt}
          />
          <div className="button-row">
            <button className="button" onClick={handleAsk} type="button">
              {state.isAiLoading ? "Getting suggestions..." : "Get suggestions"}
            </button>
            <Link className="button secondary" href="/itinerary">
              See party plan
            </Link>
          </div>
          <div className="helper-list">
            <div className="helper-item">Include: city, people count, allergies, and preferred drinks.</div>
            <div className="helper-item">You can keep it casual. The app will structure it for you.</div>
          </div>
        </div>
      </section>

      <section className="ai-response">
        <div className="section-heading">
          <div>
            <div className="eyebrow">What We Understood</div>
            <h3>{state.event.name}</h3>
          </div>
          <span className="badge success">{state.party.peopleCount} people</span>
        </div>
        {state.isAiLoading ? (
          <div className="info-card empty-state-card">
            <strong>Thinking...</strong>
            <p className="muted">We&apos;re turning your party details into drink picks and a quick plan.</p>
          </div>
        ) : state.aiError ? (
          <div className="info-card empty-state-card error-card">
            <strong>Couldn&apos;t get AI suggestions</strong>
            <p className="muted">{state.aiError}</p>
          </div>
        ) : state.hasAsked && state.aiResult ? (
          <div className="summary-grid">
            <div className="info-card">
              <strong>Party setup</strong>
              <p className="muted">{state.aiResult.summary}</p>
            </div>
            <div className="info-card">
              <strong>Safety settings</strong>
              <p className="muted">{state.aiResult.safetyNote}</p>
            </div>
            <div className="info-card">
              <strong>How much to buy / pour</strong>
              <p className="muted">{state.aiResult.quantityGuidance}</p>
            </div>
          </div>
        ) : (
          <div className="info-card empty-state-card">
            <strong>No suggestions yet</strong>
            <p className="muted">
              Type your party details above and press <strong>Get suggestions</strong> to see the summary and best matches.
            </p>
          </div>
        )}
      </section>

      <section className="recommendation-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Best Matches</div>
            <h3>What to serve or suggest first</h3>
            <p className="muted">These are the clearest matches based on the prompt, taste profile, and pacing settings.</p>
          </div>
        </div>
        {state.isAiLoading ? (
          <div className="info-card empty-state-card">
            <strong>Building your shortlist</strong>
            <p className="muted">We&apos;ll show the best first picks as soon as the AI responds.</p>
          </div>
        ) : state.hasAsked && state.aiResult ? (
          <div className="stack">
            {state.aiResult.suggestions.map((drink, index) => {
              const est = bottleEstimates[index];
              return (
                <article className="recommendation-card recommendation-card--hero" key={`${drink.name}-${index}`}>
                  <div className="recommendation-rank">#{index + 1}</div>
                  <div className="recommendation-card__top">
                    <div>
                      <strong>{drink.name}</strong>
                      <p>{drink.serveSuggestion}</p>
                    </div>
                    <span className="badge">{drink.abv}</span>
                  </div>
                  <p className="muted">{drink.reason}</p>
                  <div className="chip-grid">
                    <span className="chip">{drink.category}</span>
                    <span className="chip">{drink.priceTier} budget</span>
                    <span className="chip">{drink.caution}</span>
                  </div>
                  {est && (
                    <div className="bottle-estimate">
                      <span><strong>{est.bottlesNeeded}</strong> bottle{est.bottlesNeeded !== 1 ? "s" : ""}</span>
                      <span style={{ color: "var(--text-soft)", fontSize: 12 }}>·</span>
                      <span>Est. <strong>{est.currency}{est.totalMin.toLocaleString()}–{est.currency}{est.totalMax.toLocaleString()}</strong></span>
                      <span style={{ color: "var(--text-soft)", fontSize: 12 }}>·</span>
                      <span className="muted" style={{ fontSize: 12 }}>{est.currency}{est.priceMin.toLocaleString()}–{est.currency}{est.priceMax.toLocaleString()} / bottle</span>
                    </div>
                  )}
                  {drink.alternative && (
                    <div className="info-card info-card--mini" style={{ marginTop: "0.75rem", background: "rgba(0,0,0,0.03)" }}>
                      <strong>Alternative:</strong> {drink.alternative}
                    </div>
                  )}
                </article>
              );
            })}
            {partyBudget && (
              <div className="budget-summary">
                <div>
                  <strong>Total estimated spend</strong>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    For {state.party.peopleCount} people · {state.party.eventDurationHours ?? 4} hrs · avg {avgTolerance.toLowerCase()} tolerance
                  </p>
                </div>
                <div className="budget-total">
                  {partyBudget.currency}{partyBudget.totalMin.toLocaleString()}
                  <span> – </span>
                  {partyBudget.currency}{partyBudget.totalMax.toLocaleString()}
                </div>
              </div>
            )}
            <div className="info-card">
              <strong>Local tip</strong>
              <p className="muted">{state.aiResult.regionalTip}</p>
            </div>
            <Link className="button secondary" href="/shopping" style={{ textAlign: "center" }}>
              View full shopping checklist
            </Link>
          </div>
        ) : (
          <div className="info-card empty-state-card">
            <strong>Recommendations will appear here</strong>
            <p className="muted">
              Once you ask, sip&apos;n shot will show top drink matches, a safer option, and guidance for the group.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
