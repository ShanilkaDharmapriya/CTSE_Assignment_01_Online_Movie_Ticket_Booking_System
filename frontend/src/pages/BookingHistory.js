import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import { Link } from 'react-router-dom';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getBookings();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action is irreversible.')) {
      return;
    }

    setCancelingId(bookingId);

    try {
      const updatedBooking = await bookingService.cancelBooking(
        bookingId,
        'User cancelled'
      );

      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? updatedBooking : b
        )
      );
      alert('Booking cancelled successfully.');
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium tracking-widest uppercase text-xs">Retrieving Tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">My Collection</h1>
            <p className="text-gray-500 font-medium tracking-wide">Your past and upcoming cinematic experiences</p>
          </div>
          <Link to="/" className="btn-secondary px-6 py-3 text-[10px] font-black tracking-widest uppercase">
            Book More
          </Link>
        </div>

        {error && (
          <div className="bg-red-600/10 border border-red-600/20 text-red-500 p-6 rounded-2xl mb-12 font-bold animate-shake">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="glass-card p-16 text-center border-dashed border-2 border-white/5">
            <span className="text-6xl mb-6 block opacity-20">🎟️</span>
            <h2 className="text-2xl font-black text-white/40 mb-2 uppercase italic">No Tickets Found</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">You haven't booked any movies yet. Start your cinematic journey now!</p>
            <Link to="/" className="btn-primary inline-flex px-8 py-4 text-xs font-black tracking-widest uppercase">
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookings.map((booking, index) => (
              <div
                key={booking._id}
                className="glass-card overflow-hidden group animate-fade-in relative transition-all duration-500 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Ticket Body */}
                <div className="flex flex-col md:flex-row">
                  {/* Left Side (Movie Info) */}
                  <div className="flex-grow p-8 border-b md:border-b-0 md:border-r border-white/5 relative">
                    {/* Status Badge */}
                    <div className="absolute top-8 right-8">
                      <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                        booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-6 uppercase italic leading-tight pr-24">
                      {booking.movieTitle}
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Date</span>
                        <p className="text-white font-bold">{new Date(booking.showDateTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Time</span>
                        <p className="text-white font-bold">{new Date(booking.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Theater</span>
                        <p className="text-white font-bold truncate pr-2">{booking.theaterName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Seats</span>
                        <p className="text-white font-bold">{booking.seats}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side (Price & Action) */}
                  <div className="md:w-48 p-8 flex flex-col justify-between items-center bg-white/[0.01] relative">
                    {/* Perforation Effect */}
                    <div className="hidden md:block absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col gap-2">
                       {[...Array(8)].map((_, i) => (
                         <div key={i} className="w-2 h-2 rounded-full bg-[#0a0a0a] my-2" />
                       ))}
                    </div>

                    <div className="text-center">
                      <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Ref ID</span>
                      <p className="text-white font-mono text-xs mb-4">#{booking.bookingReference || booking._id.slice(-8).toUpperCase()}</p>
                      
                      <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Paid</span>
                      <p className="text-3xl font-black text-red-600 italic">Rs.{booking.amount < 1000 ? booking.amount : (booking.amount/1000).toFixed(1) + 'K'}</p>
                    </div>

                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelingId === booking._id}
                        className="mt-6 text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-red-500 transition-colors"
                      >
                        {cancelingId === booking._id ? 'Processing...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
