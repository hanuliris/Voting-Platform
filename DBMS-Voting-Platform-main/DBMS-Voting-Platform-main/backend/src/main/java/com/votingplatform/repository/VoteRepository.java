package com.votingplatform.repository;

import com.votingplatform.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    boolean existsByPollIdAndUserId(Long pollId, Long userId);
    
    List<Vote> findByUserId(Long userId);
    
    @Query("SELECT v.candidate.id as candidateId, v.candidate.name as candidateName, COUNT(v) as votes " +
           "FROM Vote v WHERE v.poll.id = :pollId " +
           "GROUP BY v.candidate.id, v.candidate.name")
    List<Object[]> getPollResults(@Param("pollId") Long pollId);
    
    long countByPollId(Long pollId);

    @Modifying
    long deleteByPollId(Long pollId);

    @Modifying
    long deleteByUserIdIn(List<Long> userIds);
}
