import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, showService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatSelector from '../components/SeatSelector';

export default function Booking() {
  const { movieId, showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await movieService.getMovieById(movieId);
        setMovie(movieData);

        const showData = await showService.getShowById(showId);
        setShow(showData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, showId]);

  const handleSeatSelect = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalAmount = selectedSeats.length * (show?.price || 0);

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = await bookingService.createBooking({
        userId: user.id || user._id,
        movieId: movieId,
        showId: showId,
        seats: selectedSeats.length,
      });

      navigate(`/checkout/${bookingData._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium tracking-widest uppercase text-xs">Preparing Cinema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(`/movie/${movieId}`)}
          className="mb-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium tracking-wide text-xs uppercase">Cancel & Go Back</span>
        </button>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 animate-fade-in">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">CHOOSE YOUR SEATS</h1>
                <div className="h-1 w-12 bg-red-600 rounded-full"></div>
              </div>
              <p className="text-gray-500 font-medium text-sm hidden md:block uppercase tracking-widest">{show?.theater} • {show?.time}</p>
            </div>

            {error && error !== 'Please select at least one seat' && (
              <div className="bg-red-600/10 border border-red-600/20 text-red-500 p-4 rounded-xl mb-8 animate-shake text-sm font-bold flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            <SeatSelector
              totalSeats={100}
              bookedSeats={[]}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />
          </div>

          {/* Ticket Summary Sidebar */}
          <div className="lg:col-span-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-8xl">🎟️</span>
              </div>
              
              <div className="p-8 border-b border-white/10">
                <h2 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Order Summary</h2>
                <h3 className="text-3xl font-black text-white leading-tight uppercase italic group-hover:text-red-500 transition-colors duration-500">{movie?.title}</h3>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Theater</span>
                    <span className="text-white font-bold">{show?.theater}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Date</span>
                    <span className="text-white font-bold">{show && new Date(show.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Time</span>
                    <span className="text-red-500 font-bold">{show?.time}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Seats</span>
                    <span className="text-white font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-400 font-bold">{selectedSeats.length} Ticket(s)</span>
                    <span className="text-3xl font-black text-white">Rs. {totalAmount}</span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0 || submitting}
                    className="btn-primary w-full disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Selection</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                  
                  {error === 'Please select at least one seat' && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-4">Required: {error}</p>
                  )}
                </div>
              </div>
              
              {/* Ticket Jagged Edge Effect */}
              <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-[#0a0a0a] rounded-full -mb-1.5"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
