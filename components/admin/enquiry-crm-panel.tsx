"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEnquiryStatusAction, assignEnquiryAction, addFollowUpNoteAction } from "@/app/actions/enquiry.actions";

type Note = {
  id: string;
  note: string;
  followUpDate: string | null; // ISO
  createdAt: string; // ISO
  author: { name: string } | null;
};

type CrmPanelProps = {
  enquiryId: string;
  currentStatus: string;
  currentAssigneeId: string | null;
  users: { id: string; name: string }[];
  notes: Note[];
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"];

const selectStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #E4E1DC",
  background: "#F6F4F1",
  fontFamily: "Archivo, sans-serif",
  fontSize: 13,
  outline: "none",
};

export function EnquiryCrmPanel({ enquiryId, currentStatus, currentAssigneeId, users, notes }: CrmPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateEnquiryStatusAction({ id: enquiryId, status });
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function handleAssign(userId: string) {
    startTransition(async () => {
      const result = await assignEnquiryAction({ id: enquiryId, assignedToId: userId || null });
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const result = await addFollowUpNoteAction({
        enquiryId,
        note: noteText,
        followUpDate: followUpDate || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNoteText("");
      setFollowUpDate("");
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6862", display: "block", marginBottom: 6 }}>
            Status
          </label>
          <select style={selectStyle} value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)} disabled={isPending}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6862", display: "block", marginBottom: 6 }}>
            Assigned to
          </label>
          <select style={selectStyle} value={currentAssigneeId ?? ""} onChange={(e) => handleAssign(e.target.value)} disabled={isPending}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p style={{ color: "#B3261E", fontSize: 12 }}>{error}</p>}

      <div>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, marginBottom: 14 }}>Follow-up log</h3>

        <div style={{ border: "1px solid #E4E1DC", padding: 16, marginBottom: 16 }}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Log a call, email, or note…"
            rows={3}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #E4E1DC", background: "#F6F4F1", fontFamily: "Archivo, sans-serif", fontSize: 13, outline: "none", resize: "vertical", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ fontSize: 11, color: "#6B6862" }}>Next follow-up:</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              style={{ padding: "8px 10px", border: "1px solid #E4E1DC", background: "#F6F4F1", fontSize: 12 }}
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={isPending || !noteText.trim()}
              style={{ marginLeft: "auto", background: "#121110", color: "#FFFFFF", border: 0, padding: "9px 20px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
            >
              Add note
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6B6862" }}>No follow-ups logged yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {notes.map((n) => (
              <div key={n.id} style={{ padding: "14px 0", borderBottom: "1px solid #E4E1DC" }}>
                <div style={{ fontSize: 13, marginBottom: 6 }}>{n.note}</div>
                <div style={{ fontSize: 11, color: "#6B6862", display: "flex", gap: 12 }}>
                  <span>{n.author?.name ?? "System"}</span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {n.followUpDate && <span style={{ color: "#8C6A45" }}>Follow up {new Date(n.followUpDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
