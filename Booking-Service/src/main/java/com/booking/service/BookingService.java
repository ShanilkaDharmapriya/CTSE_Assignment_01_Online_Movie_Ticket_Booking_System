package com.booking.service;

import com.booking.model.Booking;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BookingService {

    private final List<Booking> bookings = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public Booking createBooking(Booking booking) {
        booking.setBookingId(idCounter.getAndIncrement());
        booking.setBookingStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        bookings.add(booking);
        return booking;
    }

    public List<Booking> getAllBookings() {
        return bookings;
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookings.stream()
                .filter(b -> b.getBookingId().equals(id))
                .findFirst();
    }
}
