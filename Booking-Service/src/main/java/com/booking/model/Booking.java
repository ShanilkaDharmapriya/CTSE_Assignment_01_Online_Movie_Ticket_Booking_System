package com.booking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Booking {

    private Long bookingId;
    private String userId;
    private Long movieId;
    private Long showId;
    private int seats;
    private String bookingStatus;
    private LocalDateTime createdAt;
}
