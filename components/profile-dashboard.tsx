"use client";

import { useState } from "react";
import { useSipwise } from "@/components/sipwise-provider";
import { tasteOptions } from "@/lib/types";

const categories = ["whiskey", "gin", "vodka", "rum", "tequila", "beer", "wine"];

export function ProfileDashboard() {
  const {
    state,
    toggleTaste,
    updateAllergyNote,
    updateTolerance,
    updateBudget,
    toggleDislikedCategory,
    updateProfileName,
    addGuestProfile,
    removeGuestProfile,
  } = useSipwise();

  const [activeTab, setActiveTab] = useState<string>("user");

  const guestIndex = activeTab.startsWith("guest-")
    ? parseInt(activeTab.split("-")[1], 10)
    : undefined;

  const currentProfile = activeTab === "user" ? state.profile : state.guestProfiles[guestIndex ?? 0];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!currentProfile) {
    // Fallback if a guest was removed while active
    if (activeTab !== "user") setActiveTab("user");
    return null;
  }

  return (
    <div className="dashboard-grid">
      <section className="card feature-card">
        <div className="eyebrow">My Taste</div>
        <h2>Save what you usually like</h2>
        <p className="muted">
          This helps the app personalize suggestions before it looks at the details of a specific party.
        </p>
      </section>

      <section className="card card--full">
        <div className="section-heading">
          <div style={{ width: "100%" }}>
            <div
              className="tabs"
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
              }}
            >
              <button
                className={`tab-button ${activeTab === "user" ? "active" : ""}`}
                onClick={() => handleTabChange("user")}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: activeTab === "user" ? "var(--accent)" : "rgba(0,0,0,0.05)",
                  color: activeTab === "user" ? "white" : "var(--foreground)",
                  borderRadius: "20px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
                My Profile
              </button>
              {state.guestProfiles.map((guest, idx) => (
                <button
                  className={`tab-button ${activeTab === `guest-${idx}` ? "active" : ""}`}
                  key={`guest-${idx}`}
                  onClick={() => handleTabChange(`guest-${idx}`)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    background: activeTab === `guest-${idx}` ? "var(--accent)" : "rgba(0,0,0,0.05)",
                    color: activeTab === `guest-${idx}` ? "white" : "var(--foreground)",
                    borderRadius: "20px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontWeight: "bold",
                  }}
                >
                  {guest.name || `Guest ${idx + 1}`}
                </button>
              ))}
              <button
                className="tab-button"
                onClick={() => {
                  addGuestProfile();
                  setActiveTab(`guest-${state.guestProfiles.length}`);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px dashed var(--accent)",
                  background: "transparent",
                  color: "var(--accent)",
                  borderRadius: "20px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
                + Add Guest
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <h2 style={{ margin: 0 }}>
                    {activeTab === "user" ? "Your defaults" : `Preferences for ${currentProfile.name}`}
                  </h2>
                  {activeTab !== "user" && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove guest profile for ${currentProfile.name}?`)) {
                          removeGuestProfile(guestIndex!);
                          setActiveTab("user");
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        textDecoration: "underline",
                      }}
                    >
                      Delete Profile
                    </button>
                  )}
                </div>
                <p className="muted">
                  {activeTab === "user"
                    ? "Choose the flavors, limits, and drink types that usually fit you best."
                    : "Tailor these settings to match what this guest typically enjoys."}
                </p>
              </div>
            </div>

            {activeTab !== "user" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.5rem" }}>Guest Name</label>
                <input
                  className="input"
                  onChange={(e) => updateProfileName(e.target.value, "guest", guestIndex)}
                  placeholder="Guest Name (e.g. Alice)"
                  value={currentProfile.name}
                  style={{ maxWidth: "300px" }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="chip-grid">
          {tasteOptions.map((taste) => (
            <button
              className={`chip-button${currentProfile.tastes.includes(taste) ? " chip-button--active" : ""}`}
              key={taste}
              onClick={() => toggleTaste(taste, activeTab === "user" ? "user" : "guest", guestIndex)}
              type="button"
            >
              {taste}
            </button>
          ))}
        </div>
        <div className="form-grid-two">
          <label>
            Allergy / avoid note
            <input
              className="input"
              onChange={(event) =>
                updateAllergyNote(event.target.value, activeTab === "user" ? "user" : "guest", guestIndex)
              }
              value={currentProfile.allergyNote}
            />
          </label>
          <label>
            Tolerance
            <select
              className="input"
              onChange={(event) =>
                updateTolerance(
                  event.target.value as typeof state.profile.tolerance,
                  activeTab === "user" ? "user" : "guest",
                  guestIndex,
                )
              }
              value={currentProfile.tolerance}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label>
            Budget
            <select
              className="input"
              onChange={(event) =>
                updateBudget(
                  event.target.value as typeof state.profile.budget,
                  activeTab === "user" ? "user" : "guest",
                  guestIndex,
                )
              }
              value={currentProfile.budget}
            >
              <option value="Value">Value</option>
              <option value="Mid">Mid</option>
              <option value="Premium">Premium</option>
            </select>
          </label>
        </div>
        <div className="stack">
          <strong>Alcohol types {activeTab === "user" ? "you" : "this guest"} usually avoid</strong>
          <div className="chip-grid">
            {categories.map((category) => (
              <button
                className={`chip-button${currentProfile.dislikedCategories.includes(category) ? " chip-button--active" : ""}`}
                key={category}
                onClick={() =>
                  toggleDislikedCategory(category, activeTab === "user" ? "user" : "guest", guestIndex)
                }
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
