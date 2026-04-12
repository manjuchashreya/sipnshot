"use client";

import { useState } from "react";

import { useSipwise } from "@/components/sipwise-provider";

export function ItineraryDashboard() {
  const { state, addItineraryItem } = useSipwise();
  const [phase, setPhase] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [note, setNote] = useState("");

  function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phase.trim() || !timeLabel.trim() || !note.trim()) {
      return;
    }

    addItineraryItem({
      id: `${Date.now()}`,
      phase: phase.trim(),
      timeLabel: timeLabel.trim(),
      note: note.trim(),
    });

    setPhase("");
    setTimeLabel("");
    setNote("");
  }

  return (
    <div className="dashboard-grid">
      <section className="card feature-card">
        <div className="eyebrow">Party Plan</div>
        <h2>A simple timeline for the night</h2>
        <p className="muted">Use this to plan when to start light, when to serve main drinks, and when to slow down.</p>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Suggested flow</h2>
            <p className="muted">Think of this as a lightweight cheat sheet for the event.</p>
          </div>
        </div>
        <div className="timeline">
          {state.itinerary.map((item) => (
            <div className="timeline__item" key={item.id}>
              <span className="timeline__time">{item.timeLabel}</span>
              <div>
                <strong>{item.phase}</strong>
                <p className="muted">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card card--full">
        <div className="section-heading">
          <div>
            <h2>Add another stop</h2>
            <p className="muted">Example: arrival drinks, dinner, main party, wind-down.</p>
          </div>
        </div>
        <form className="form-grid-two" onSubmit={handleAddItem}>
          <label>
            Phase
            <input className="input" onChange={(event) => setPhase(event.target.value)} value={phase} />
          </label>
          <label>
            Time
            <input className="input" onChange={(event) => setTimeLabel(event.target.value)} value={timeLabel} />
          </label>
          <label className="form-grid-span">
            Note
            <input className="input" onChange={(event) => setNote(event.target.value)} value={note} />
          </label>
          <div className="button-row">
            <button className="button" type="submit">
              Add stop
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
