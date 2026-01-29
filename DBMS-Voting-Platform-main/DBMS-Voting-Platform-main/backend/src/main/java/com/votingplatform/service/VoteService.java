package com.votingplatform.service;

import com.votingplatform.dto.VoteRequest;
import com.votingplatform.dto.VoteResultDTO;
import com.votingplatform.entity.Candidate;
import com.votingplatform.entity.Poll;
import com.votingplatform.entity.User;
import com.votingplatform.entity.Vote;
import com.votingplatform.repository.CandidateRepository;
import com.votingplatform.repository.PollRepository;
import com.votingplatform.repository.UserRepository;
import com.votingplatform.repository.VoteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LedgerService ledgerService;

    public Vote castVote(VoteRequest request, HttpServletRequest httpRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already voted
        if (voteRepository.existsByPollIdAndUserId(request.getPollId(), user.getId())) {
            throw new RuntimeException("You have already voted in this poll");
        }

        Poll poll = pollRepository.findById(request.getPollId())
                .orElseThrow(() -> new RuntimeException("Poll not found"));

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Vote vote = new Vote();
        vote.setPoll(poll);
        vote.setCandidate(candidate);
        vote.setUser(user);
        vote.setIpAddress(getClientIp(httpRequest));

        Vote savedVote = voteRepository.save(vote);
        ledgerService.recordVoteCast(savedVote);
        return savedVote;
    }

    public boolean hasUserVoted(Long pollId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return voteRepository.existsByPollIdAndUserId(pollId, user.getId());
    }

    public List<VoteResultDTO> getPollResults(Long pollId) {
        List<Object[]> results = voteRepository.getPollResults(pollId);
        return results.stream()
                .map(result -> new VoteResultDTO(
                        (Long) result[0],
                        (String) result[1],
                        (Long) result[2]
                ))
                .collect(Collectors.toList());
    }

    public List<Vote> getUserVoteHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return voteRepository.findByUserId(user.getId());
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
