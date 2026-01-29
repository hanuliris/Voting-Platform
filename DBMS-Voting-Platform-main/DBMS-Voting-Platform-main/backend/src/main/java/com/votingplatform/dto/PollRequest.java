package com.votingplatform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PollRequest {
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
