import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetchMyBookings, fetchMovies } from "../services/api.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

const statusColor = (status) => {
  if (!status) return "#9aa0a8";
  const s = status.toUpperCase();
  if (s === "CONFIRMED") return "#4ade80";
  if (s === "PAYMENT_FAILED" || s === "CANCELLED") return "#f87171";
  if (s === "PENDING") return "#facc15";
  return "#9aa0a8";
};

function BookingTicket({ booking, movie }) {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const ref = booking.bookingReference || booking.bookingId || booking._id || "N/A";
  const movieTitle =
    booking.movieTitle || movie?.title || booking.movieId || "Unknown Movie";
  const showWhen = formatDateTime(booking.showStartTime);
  const hallName = booking.theaterName || "—";
  const seats = Array.isArray(booking.seats)
    ? booking.seats.join(", ")
    : booking.seats ?? "-";

  const qrPayload = JSON.stringify({
    ref,
    movie: movieTitle,
    seats: booking.seats,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
  });

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#14161c",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a5" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.height / canvas.width;
      const imgHeight = pdfWidth * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`ticket-${ref}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="booking-ticket-wrap">
      <div className="booking-ticket-card" ref={ticketRef}>
        {/* Left strip */}
        <div className="ticket-strip" />

        {/* Ticket body */}
        <div className="ticket-body">
          <div className="ticket-header">
            <span className="ticket-brand">🎬 CineBook</span>
            <span
              className="ticket-status-badge"
              style={{ color: statusColor(booking.status) }}
            >
              {booking.status || "PENDING"}
            </span>
          </div>

          <h3 className="ticket-movie-title">{movieTitle}</h3>

          <div className="ticket-details">
            <div className="ticket-detail-row">
              <span className="ticket-label">Reference</span>
              <span className="ticket-value">{ref}</span>
            </div>
            <div className="ticket-detail-row">
              <span className="ticket-label">Show time</span>
              <span className="ticket-value">{showWhen}</span>
            </div>
            <div className="ticket-detail-row">
              <span className="ticket-label">Theater</span>
              <span className="ticket-value">{hallName}</span>
            </div>
            <div className="ticket-detail-row">
              <span className="ticket-label">Seats</span>
              <span className="ticket-value">{seats}</span>
            </div>
            <div className="ticket-detail-row">
              <span className="ticket-label">Payment</span>
              <span
                className="ticket-value"
                style={{ color: statusColor(booking.paymentStatus) }}
              >
                {booking.paymentStatus || "-"}
              </span>
            </div>
            <div className="ticket-detail-row">
              <span className="ticket-label">Booked</span>
              <span className="ticket-value">{formatDateTime(booking.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="ticket-divider">
          <span className="ticket-notch ticket-notch--top" />
          <div className="ticket-dashes" />
          <span className="ticket-notch ticket-notch--bottom" />
        </div>

        {/* QR section */}
        <div className="ticket-qr-section">
          <QRCodeSVG
            value={qrPayload}
            size={110}
            bgColor="#14161c"
            fgColor="#f5f5f5"
            level="M"
          />
          <p className="ticket-scan-label">Scan to verify</p>
        </div>
      </div>

      {/* Download button (outside the capture area) */}
      <button
        className="btn btn--primary ticket-download-btn"
        onClick={handleDownloadPDF}
        disabled={downloading}
      >
        {downloading ? "Generating PDF…" : "⬇ Download Ticket (PDF)"}
      </button>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [bookingData, movieData] = await Promise.all([fetchMyBookings(), fetchMovies()]);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setMovies(Array.isArray(movieData) ? movieData : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const moviesById = useMemo(
    () => Object.fromEntries(movies.map((movie) => [movie._id, movie])),
    [movies]
  );

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>My Bookings</h1>
        <p>View your booking tickets and download them as PDF.</p>
      </div>

      {isLoading && <p className="state-msg">Loading bookings…</p>}
      {!isLoading && error && <p className="state-msg state-msg--error">{error}</p>}

      {!isLoading && !error && bookings.length === 0 && (
        <p className="state-msg">No bookings found. Book a movie to get started!</p>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <BookingTicket
              key={booking.bookingId || booking.bookingReference || booking._id}
              booking={booking}
              movie={moviesById[booking.movieId]}
            />
          ))}
        </div>
      )}
    </main>
  );
}
