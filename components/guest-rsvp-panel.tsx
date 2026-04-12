"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useSipwise } from "@/components/sipwise-provider";

export function GuestRsvpPanel() {
    const { state } = useSipwise();
    const [baseUrl, setBaseUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Build base URL at runtime so it works on localhost and production
        setBaseUrl(window.location.origin);
    }, []);

    // Encode event info into the guest RSVP link
    const eventContext = {
        event: state.event.name,
        date: state.event.date,
        city: state.party.city,
    };
    const encoded = typeof window !== "undefined"
        ? btoa(encodeURIComponent(JSON.stringify(eventContext)))
        : "";
    const rsvpUrl = `${baseUrl}/guest?event=${encoded}`;

    function copyLink() {
        navigator.clipboard.writeText(rsvpUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    if (!baseUrl) return null;

    return (
        <div className="guest-rsvp-panel">
            <div className="qr-block">
                <QRCodeSVG value={rsvpUrl} size={180} bgColor="transparent" fgColor="var(--text)" />
                <p className="muted" style={{ fontSize: 12, marginTop: 8, textAlign: "center" }}>
                    Scan to fill preferences
                </p>
            </div>
            <div className="qr-info">
                <h3>Share with guests</h3>
                <p className="muted">
                    Guests scan the QR code or use the link below to add their drink preferences.
                    Once they submit, share their link back to you so you can merge it into the app.
                </p>
                <div className="qr-link-row">
                    <input
                        className="input"
                        value={rsvpUrl}
                        readOnly
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button className="button" onClick={copyLink}>
                        {copied ? "Copied!" : "Copy link"}
                    </button>
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    Note: Each guest fills out their preferences and sends you back their own link.
                    Use "Merge Guest Link" on the Party Setup page.
                </p>
            </div>
        </div>
    );
}
