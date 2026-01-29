package com.votingplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteResultDTO {
    private Long candidateId;
    private String candidateName;
    private Long votes;
}
