import React from 'react';

export default function MovieCard({ movie }) {
  return (
    <div className="movie-card group">
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-stone-900 flex flex-col items-center justify-center text-gray-500">
            <span className="text-4xl mb-2">🎬</span>
            <span className="text-sm font-medium">No Image Available</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1 shadow-xl">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-white text-xs font-bold">{movie.rating || 'N/A'}</span>
        </div>
        
        {/* Genre Badge */}
        <div className="absolute bottom-4 left-4 bg-red-600/90 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-lg">
          {movie.genre?.split('/')[0].trim()}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-red-500 transition-colors duration-300">
          {movie.title}
        </h3>
        <div className="flex items-center text-gray-400 text-xs gap-3">
          <span>{movie.duration} mins</span>
          <span className="h-1 w-1 rounded-full bg-gray-600"></span>
          <span>{movie.genre?.split('/')[1]?.trim() || movie.genre}</span>
        </div>
      </div>
    </div>
  );
}
