"use client";

import { useState } from "react";
import { useSipwise } from "@/components/sipwise-provider";

export function PartyDashboard() {
  const { state, updateParty, updateEventPreference, saveTemplate, loadTemplate, removeTemplate } = useSipwise();
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  async function detectCity() {
    setDetectingLocation(true);
    setLocationError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await resp.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "";
      const country = data.address?.country ?? "";
      if (city) updateParty("city", city);
      if (country) updateParty("region", country);
    } catch {
      setLocationError("Could not detect location. Please enter manually.");
    } finally {
      setDetectingLocation(false);
    }
  }

  function handleSaveTemplate() {
    if (!templateName.trim()) return;
    saveTemplate(templateName.trim());
    setTemplateName("");
    setShowSaveTemplate(false);
  }

  return (
    <div className="dashboard-grid">
      <section className="card feature-card">
        <div className="eyebrow">Party Setup</div>
        <h2>Tonight&apos;s details</h2>
        <p className="muted">Set guest count, location, vibe, and event preferences for this specific party.</p>
      </section>

      <section className="card card--full">
        <div className="section-heading">
          <div>
            <h2>Location & Guests</h2>
            <p className="muted">Used for regional drink suggestions.</p>
          </div>
        </div>
        <div className="form-grid-two">
          <label>
            Number of people
            <input
              className="input"
              min={1}
              type="number"
              onChange={(e) => updateParty("peopleCount", Number(e.target.value))}
              value={state.party.peopleCount}
            />
          </label>
          <label>
            Party type
            <input
              className="input"
              onChange={(e) => updateParty("partyType", e.target.value)}
              value={state.party.partyType}
            />
          </label>
          <label>
            City
            <div className="city-input-row">
              <input
                className="input"
                placeholder="e.g. Mumbai, Miami, São Paulo"
                onChange={(e) => updateParty("city", e.target.value)}
                value={state.party.city}
              />
              <button
                className="button secondary detect-btn"
                onClick={detectCity}
                disabled={detectingLocation}
                title="Auto-detect location"
              >
                {detectingLocation ? "…" : "Detect"}
              </button>
            </div>
            {locationError && <span className="location-error">{locationError}</span>}
          </label>
          <label>
            Region / Country
            <input
              className="input"
              placeholder="e.g. India, USA, Brazil"
              onChange={(e) => updateParty("region", e.target.value)}
              value={state.party.region}
            />
          </label>
          <label>
            Event duration (hours)
            <input
              className="input"
              min={1}
              max={12}
              type="number"
              onChange={(e) => updateParty("eventDurationHours", Number(e.target.value))}
              value={state.party.eventDurationHours ?? 4}
            />
          </label>
          <label>
            Guest allergies / restrictions
            <input
              className="input"
              onChange={(e) => updateParty("guestAllergies", e.target.value)}
              value={state.party.guestAllergies}
            />
          </label>
          <label className="form-grid-span">
            Guest preferences
            <input
              className="input"
              placeholder="e.g. 2 want low alcohol, 1 prefers sweeter drinks"
              onChange={(e) => updateParty("guestPreferences", e.target.value)}
              value={state.party.guestPreferences}
            />
          </label>
        </div>
      </section>

      <section className="card card--full">
        <div className="section-heading">
          <div>
            <h2>Event Preferences</h2>
            <p className="muted">Adjust the vibe and safety settings.</p>
          </div>
        </div>
        <div className="form-grid-two">
          <label>
            Vibe
            <select
              className="input"
              onChange={(e) =>
                updateEventPreference("vibe", e.target.value as typeof state.eventPreferences.vibe)
              }
              value={state.eventPreferences.vibe}
            >
              <option value="Chill">Chill</option>
              <option value="Social">Social</option>
              <option value="High energy">High energy</option>
            </select>
          </label>
          <label>
            Max drinks per person
            <input
              className="input"
              min={1}
              max={10}
              type="number"
              onChange={(e) => updateEventPreference("maxDrinks", Number(e.target.value))}
              value={state.eventPreferences.maxDrinks}
            />
          </label>
        </div>

        <div className="toggle-stack">
          <label className="toggle-row">
            <div>
              <strong>Prefer lighter drinks overall</strong>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>Prioritise low-ABV options in suggestions</p>
            </div>
            <input
              type="checkbox"
              checked={state.eventPreferences.lowAbvMode}
              onChange={(e) => updateEventPreference("lowAbvMode", e.target.checked)}
            />
          </label>
          <label className="toggle-row mocktail-toggle">
            <div>
              <strong>Mocktail / Non-Alcoholic Mode</strong>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>All suggestions will be non-alcoholic</p>
            </div>
            <input
              type="checkbox"
              checked={state.eventPreferences.mocktailMode ?? false}
              onChange={(e) => updateEventPreference("mocktailMode", e.target.checked)}
            />
          </label>
        </div>
      </section>

      <section className="card card--full">
        <div className="section-heading">
          <div>
            <h2>Party Templates</h2>
            <p className="muted">Save the current setup and reuse it next time.</p>
          </div>
          <button
            className="button secondary"
            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
          >
            + Save Template
          </button>
        </div>

        {showSaveTemplate && (
          <div className="inline-form" style={{ marginTop: 12 }}>
            <input
              className="input"
              placeholder="Template name, e.g. House Party Mumbai"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <button className="button" onClick={handleSaveTemplate}>
              Save
            </button>
            <button className="button secondary" onClick={() => setShowSaveTemplate(false)}>
              Cancel
            </button>
          </div>
        )}

        {state.savedTemplates && state.savedTemplates.length > 0 ? (
          <div className="template-list">
            {state.savedTemplates.map((t) => (
              <div key={t.id} className="template-card">
                <div>
                  <strong>{t.name}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    {t.party.city} · {t.party.peopleCount} people · saved{" "}
                    {new Date(t.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="button-row" style={{ gap: 8 }}>
                  <button className="button secondary" onClick={() => loadTemplate(t.id)}>
                    Load
                  </button>
                  <button
                    className="button secondary"
                    style={{ color: "#cc4422" }}
                    onClick={() => removeTemplate(t.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            No saved templates yet. Configure a party and click &ldquo;Save Template&rdquo; to reuse it.
          </p>
        )}
      </section>
    </div>
  );
}
