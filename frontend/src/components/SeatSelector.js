import React from 'react';

export default function SeatSelector({
  totalSeats = 100,
  bookedSeats = [],
  selectedSeats = [],
  onSeatSelect = () => {},
}) {
  const rows = Math.ceil(totalSeats / 10);

  const getSeatNumber = (row, col) => {
    return String.fromCharCode(65 + row) + (col + 1);
  };

  const handleSeatClick = (seatNumber) => {
    const isBooked = bookedSeats.includes(seatNumber);
    if (!isBooked) {
      onSeatSelect(seatNumber);
    }
  };

  return (
    <div className="glass-card p-10 flex flex-col items-center">
      {/* Cinematic Screen */}
      <div className="w-full mb-16 perspective-1000">
        <div className="h-2 bg-red-600 rounded-full w-full shadow-[0_0_20px_rgba(229,9,20,0.5)] mb-2" />
        <div className="h-20 bg-gradient-to-b from-red-600/20 to-transparent w-full rounded-b-3xl transform -rotateX-20 origin-top blur-md" />
        <div className="text-center -mt-10 tracking-[0.5em] text-white/20 font-black text-xs">SCREEN</div>
      </div>

      {/* Seats Grid */}
      <div className="grid gap-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-3 items-center">
            <span className="w-8 text-right text-gray-500 text-[10px] font-black uppercase tracking-widest mr-4">
              {String.fromCharCode(65 + rowIndex)}
            </span>
            <div className="flex gap-2">
              {Array.from({ length: 10 }).map((_, colIndex) => {
                const seatNumber = getSeatNumber(rowIndex, colIndex);
                const isBooked = bookedSeats.includes(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);

                return (
                  <button
                    key={seatNumber}
                    onClick={() => handleSeatClick(seatNumber)}
                    className={`seat !w-8 !h-8 md:!w-10 md:!h-10 ${
                      isBooked
                        ? 'booked'
                        : isSelected
                        ? 'selected'
                        : 'available'
                    }`}
                    disabled={isBooked}
                    title={seatNumber}
                  >
                    {isSelected && (
                      <span className="text-white text-[10px] font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="w-8 text-left text-gray-500 text-[10px] font-black uppercase tracking-widest ml-4">
              {String.fromCharCode(65 + rowIndex)}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 border-t border-white/5 pt-8 w-full">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-red-600 border border-red-500" />
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-gray-900 border border-white/5 opacity-30 shadow-inner" />
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Occupied</span>
        </div>
      </div>
    </div>
  );
}
