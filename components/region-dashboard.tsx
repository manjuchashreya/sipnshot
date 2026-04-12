"use client";

import { useMemo } from "react";

import { useSipwise } from "@/components/sipwise-provider";
import { getRegionalHighlights } from "@/lib/recommendations";

export function RegionDashboard() {
  const { state, updateParty, updateApiConfig } = useSipwise();
  const highlights = useMemo(() => getRegionalHighlights(state), [state]);

  return (
    <div className="dashboard-grid">
      <section className="card feature-card">
        <div className="eyebrow">Local Picks</div>
        <h2>See what makes sense for your location</h2>
        <p className="muted">Location helps the app surface brands and styles that feel more realistic for that city or region.</p>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>OpenAI Setup</h2>
            <p className="muted">Paste your key here for the hackathon. It stays in this browser only.</p>
          </div>
        </div>
        <div className="form-grid-two">
          <label className="form-grid-span">
            OpenAI API key
            <input
              className="input"
              onChange={(event) => updateApiConfig("openAiApiKey", event.target.value)}
              placeholder="sk-..."
              type="password"
              value={state.apiConfig.openAiApiKey}
            />
          </label>
          <label>
            Model
            <input
              className="input"
              onChange={(event) => updateApiConfig("openAiModel", event.target.value)}
              placeholder="gpt-4o-mini"
              value={state.apiConfig.openAiModel}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Location</h2>
            <p className="muted">Change these to explore what the app would suggest in another place.</p>
          </div>
        </div>
        <div className="form-grid-two">
          <label>
            Region / country
            <input
              className="input"
              onChange={(event) => updateParty("region", event.target.value)}
              value={state.party.region}
            />
          </label>
          <label>
            City
            <input
              className="input"
              onChange={(event) => updateParty("city", event.target.value)}
              value={state.party.city}
            />
          </label>
        </div>
      </section>

      <section className="card card--full">
        <div className="section-heading">
          <div>
            <h2>Local recommendations</h2>
            <p className="muted">A quick shortlist influenced by your selected location.</p>
          </div>
        </div>
        <div className="stack">
          {highlights.map((drink) => (
            <article className="recommendation-card" key={drink.id}>
              <div className="recommendation-card__top">
                <div>
                  <strong>{drink.name}</strong>
                  <p>{drink.profileLine}</p>
                </div>
                <span className="badge">{drink.badge}</span>
              </div>
              <p className="muted">{drink.reason}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
