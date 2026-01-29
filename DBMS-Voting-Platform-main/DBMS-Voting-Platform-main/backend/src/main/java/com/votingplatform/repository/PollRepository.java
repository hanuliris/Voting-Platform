package com.votingplatform.repository;

import com.votingplatform.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    
    @Query("SELECT p FROM Poll p WHERE p.status = 'ACTIVE'")
    List<Poll> findActivePolls(LocalDateTime now);
    
    List<Poll> findByStatus(Poll.Status status);

    @Modifying
    long deleteByStatus(Poll.Status status);
}
