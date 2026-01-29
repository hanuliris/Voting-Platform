package com.votingplatform.dto;

import lombok.Data;

@Data
public class VoteRequest {
    private Long pollId;
    private Long candidateId;
}
