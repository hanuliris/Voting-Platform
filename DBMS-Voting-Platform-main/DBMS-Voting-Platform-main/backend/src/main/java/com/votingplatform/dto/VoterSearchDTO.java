package com.votingplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class VoterSearchDTO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
