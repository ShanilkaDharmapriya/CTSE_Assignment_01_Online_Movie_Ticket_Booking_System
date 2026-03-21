import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService, paymentService } from '../services/api';

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await paymentService.processPayment({
        bookingId,
        amount: booking?.totalAmount || booking?.amount,
        paymentMethod: 'Credit/Debit Card',
        ...formData,
      });
      alert('Payment Successful! Your tickets are confirmed.');
      navigate('/booking-history');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium tracking-widest uppercase text-xs">Securing Connection...</div>
      </div>
    );
  }

  const finalAmount = booking?.totalAmount || booking?.amount;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Reservation Summary */}
          <div className="animate-fade-in">
            <h1 className="text-4xl font-black tracking-tight mb-8">SECURE CHECKOUT</h1>
            
            <div className="glass-card p-8 border-l-4 border-red-600 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <span className="text-6xl text-white">💳</span>
              </div>
              <h2 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Reservation Details</h2>
              
              <div className="space-y-6">
                <div>
                  <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Movie title</span>
                  <span className="text-2xl font-black text-white uppercase italic">{booking?.movieTitle}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Reference</span>
                    <span className="text-white font-bold font-mono">#{booking?.bookingReference || bookingId.slice(-8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Tickets</span>
                    <span className="text-white font-bold">{booking?.seats} Seats</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest block mb-1">Total Payable</span>
                    <span className="text-4xl font-black text-red-600 italic">Rs. {finalAmount}.00</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Incl. all taxes</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-xs px-2">
              <span className="text-2xl">🔒</span>
              <p>Your payment information is encrypted and processed securely. We never store your full card details.</p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-10 bg-white/[0.02]">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
                <span>Credit / Debit Card</span>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-gray-800 rounded flex items-center justify-center text-[8px] font-bold text-gray-500 border border-white/10">VISA</div>
                  <div className="w-8 h-5 bg-gray-800 rounded flex items-center justify-center text-[8px] font-bold text-gray-500 border border-white/10">MC</div>
                </div>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-600/10 border border-red-600/20 text-red-500 p-4 rounded-xl text-sm font-bold animate-shake">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="JOHN DOE"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="input-field tracking-widest"
                    placeholder="•••• •••• •••• ••••"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full py-4 text-sm tracking-widest uppercase font-black flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Payment</span>
                        <span className="text-xl">💳</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full mt-4 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
