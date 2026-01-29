package com.votingplatform.repository;

import com.votingplatform.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByPollId(Long pollId);

    @Modifying
    long deleteByPollId(Long pollId);
}
