import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { usePopup } from "../context/PopupContext.jsx";
import {
  fetchMovieById,
  fetchSeatLayout,
  fetchShowsForMovie,
  holdSeats,
} from "../services/api.js";

function formatShowWhen(show) {
  if (!show?.startTime) return "—";
  try {
    const d = new Date(show.startTime);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function groupSeatsByRow(seatList) {
  const map = new Map();
  for (const s of seatList) {
    const m = String(s.seatNumber).match(/^([A-Z]+)(\d+)$/i);
    const row = m ? m[1].toUpperCase() : "?";
    if (!map.has(row)) map.set(row, []);
    map.get(row).push(s);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => {
      const na = String(a.seatNumber).replace(/^\D+/, "");
      const nb = String(b.seatNumber).replace(/^\D+/, "");
      return Number(na) - Number(nb);
    });
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

const MAX_SELECT = 8;

export default function ShowPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { notify } = usePopup();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedShow, setSelectedShow] = useState(null);
  const [layout, setLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState(() => new Set());
  const [holdLoading, setHoldLoading] = useState(false);

  const userId = user?.id;

  const loadLayout = useCallback(async (showId) => {
    setLayoutLoading(true);
    setLayoutError("");
    try {
      const data = await fetchSeatLayout(showId);
      setLayout(data);
    } catch (err) {
      setLayout(null);
      setLayoutError(err.response?.data?.message || err.message || "Could not load seats.");
    } finally {
      setLayoutLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [m, sList] = await Promise.all([
          fetchMovieById(movieId),
          fetchShowsForMovie(movieId),
        ]);
        if (!cancelled) {
          setMovie(m);
          setShows(Array.isArray(sList) ? sList : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to load showtimes.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  useEffect(() => {
    if (!selectedShow?._id) {
      setLayout(null);
      setSelectedSeats(new Set());
      return;
    }
    loadLayout(selectedShow._id);
    const interval = setInterval(() => loadLayout(selectedShow._id), 45_000);
    return () => clearInterval(interval);
  }, [selectedShow, loadLayout]);

  const rowsGrouped = useMemo(() => {
    if (!layout?.seats?.length) return [];
    return groupSeatsByRow(layout.seats);
  }, [layout]);

  const toggleSeat = (seat) => {
    if (seat.status !== "AVAILABLE") return;

    const id = seat.seatNumber;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= MAX_SELECT) {
        notify(`You can select at most ${MAX_SELECT} seats.`, "error", 2800);
        return next;
      }
      next.add(id);
      return next;
    });
  };

  const handleBookNow = (show) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSelectedShow(show);
    setSelectedSeats(new Set());
    setLayoutError("");
  };

  const handleHoldAndPay = async () => {
    if (!selectedShow || !layout) return;
    if (selectedSeats.size < 1) {
      notify("Select at least one available seat.", "error", 2800);
      return;
    }

    setHoldLoading(true);
    try {
      const seats = [...selectedSeats];
      const result = await holdSeats(selectedShow._id, seats);
      const payload = result?.data;
      if (!payload?.expiresAt || !payload?.seatNumbers?.length) {
        throw new Error("Unexpected hold response from server.");
      }

      const bookingId = crypto.randomUUID();
      navigate("/payment", {
        state: {
          bookingId,
          movie,
          show: selectedShow,
          seatNumbers: payload.seatNumbers,
          holdExpiresAt: payload.expiresAt,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Could not hold seats.";
      notify(String(msg), "error", 4200);
      await loadLayout(selectedShow._id);
    } finally {
      setHoldLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="main-pad">
        <p className="state-msg">Loading…</p>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="main-pad">
        <p className="state-msg state-msg--error">{error || "Movie not found."}</p>
      </main>
    );
  }

  return (
    <main className="main-pad">
      <div className="show-header">
        <h1>{movie.title}</h1>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Pick exact seats — they are held for 5 minutes while you pay.
        </p>
      </div>

      {shows.length === 0 ? (
        <p className="state-msg">No showtimes listed for this movie yet.</p>
      ) : (
        <div className="show-list">
          {shows.map((show) => (
            <div key={show._id} className="show-row">
              <div className="show-row__info">
                <p>
                  <strong>{show.theaterId?.name || "Hall"}</strong>
                </p>
                <p className="muted">{formatShowWhen(show)}</p>
                <p className="muted">
                  {typeof show.availableSeats === "number"
                    ? `${show.availableSeats} seats available now`
                    : "Select to see live seat map"}
                  {typeof show.heldSeats === "number" && show.heldSeats > 0
                    ? ` · ${show.heldSeats} on hold`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                disabled={
                  typeof show.availableSeats === "number" ? show.availableSeats < 1 : false
                }
                onClick={() => handleBookNow(show)}
              >
                Choose seats
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedShow && (
        <div className="booking-panel seat-booking-panel">
          <h3>Seat map — {selectedShow.theaterId?.name || "Hall"}</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            {formatShowWhen(selectedShow)}
          </p>

          <div className="seat-legend">
            <span>
              <i className="seat-dot seat-dot--available" /> Available
            </span>
            <span>
              <i className="seat-dot seat-dot--held" /> On hold
            </span>
            <span>
              <i className="seat-dot seat-dot--booked" /> Booked
            </span>
            <span>
              <i className="seat-dot seat-dot--selected" /> Your selection
            </span>
          </div>

          {layoutLoading && <p className="state-msg">Loading seat map…</p>}
          {layoutError && <p className="form-error">{layoutError}</p>}

          {!layoutLoading && layout && (
            <div className="seat-map-wrap">
              <div className="seat-screen">SCREEN</div>
              <div className="seat-map">
                {rowsGrouped.map(([row, seats]) => (
                  <div key={row} className="seat-row">
                    <span className="seat-row-label">{row}</span>
                    <div className="seat-row-cells">
                      {seats.map((seat) => {
                        const isMineHeld =
                          seat.status === "HELD" && String(seat.heldBy) === String(userId);
                        const isSelected = selectedSeats.has(seat.seatNumber);
                        let cls = "seat-cell";
                        if (seat.status === "BOOKED") cls += " seat-cell--booked";
                        else if (seat.status === "HELD") cls += isMineHeld ? " seat-cell--held-mine" : " seat-cell--held";
                        else cls += " seat-cell--available";
                        if (isSelected) cls += " seat-cell--selected";

                        return (
                          <button
                            key={seat.seatNumber}
                            type="button"
                            className={cls}
                            disabled={seat.status !== "AVAILABLE"}
                            title={seat.seatNumber}
                            onClick={() => toggleSeat(seat)}
                          >
                            {seat.seatNumber.replace(/^[A-Z]+/i, "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="admin-hint" style={{ marginTop: "0.75rem" }}>
            Selected: {selectedSeats.size ? [...selectedSeats].sort().join(", ") : "—"} (max{" "}
            {MAX_SELECT})
          </p>

          <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={holdLoading || selectedSeats.size < 1 || layoutLoading}
              onClick={handleHoldAndPay}
            >
              {holdLoading ? "Holding…" : "Hold & continue to payment"}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setSelectedShow(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
