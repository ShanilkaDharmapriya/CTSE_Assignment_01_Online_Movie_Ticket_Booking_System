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
    <div className="bg-gray-700 rounded-lg p-8">
      {/* Screen */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 h-8 rounded-full mx-12 flex items-center justify-center">
          <span className="text-gray-400 text-sm font-semibold">SCREEN</span>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col items-center gap-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            <span className="w-6 text-center text-gray-400 text-sm font-semibold">
              {String.fromCharCode(65 + rowIndex)}
            </span>
            {Array.from({ length: 10 }).map((_, colIndex) => {
              const seatNumber = getSeatNumber(rowIndex, colIndex);
              const isBooked = bookedSeats.includes(seatNumber);
              const isSelected = selectedSeats.includes(seatNumber);

              return (
                <button
                  key={seatNumber}
                  onClick={() => handleSeatClick(seatNumber)}
                  className={`seat ${
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
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
