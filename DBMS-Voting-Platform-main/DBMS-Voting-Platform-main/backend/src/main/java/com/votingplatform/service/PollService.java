package com.votingplatform.service;

import com.votingplatform.dto.PollRequest;
import com.votingplatform.entity.Poll;
import com.votingplatform.entity.User;
import com.votingplatform.repository.CandidateRepository;
import com.votingplatform.repository.PollRepository;
import com.votingplatform.repository.UserRepository;
import com.votingplatform.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PollService {

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private LedgerService ledgerService;

    public Poll createPoll(PollRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Poll poll = new Poll();
        poll.setTitle(request.getTitle());
        poll.setDescription(request.getDescription());
        poll.setStartDate(request.getStartDate());
        poll.setEndDate(request.getEndDate());
        poll.setStatus(Poll.Status.ACTIVE);
        poll.setCreatedBy(user);

        Poll savedPoll = pollRepository.save(poll);
        ledgerService.recordPollCreated(savedPoll);
        return savedPoll;
    }

    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }

    public List<Poll> getActivePolls() {
        return pollRepository.findActivePolls(LocalDateTime.now());
    }

    public Poll getPollById(Long id) {
        return pollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Poll not found"));
    }

    public Poll updatePoll(Long id, PollRequest request) {
        Poll poll = getPollById(id);
        poll.setTitle(request.getTitle());
        poll.setDescription(request.getDescription());
        poll.setStartDate(request.getStartDate());
        poll.setEndDate(request.getEndDate());
        Poll updated = pollRepository.save(poll);
        ledgerService.recordPollUpdated(updated);
        return updated;
    }

    @Transactional
    public void deletePoll(Long id) {
        Poll poll = getPollById(id);
        deletePollInternal(poll);
    }

    @Transactional
    public long deleteAllPolls() {
        List<Poll> polls = pollRepository.findAll();
        polls.forEach(this::deletePollInternal);
        return polls.size();
    }

    @Transactional
    public long deleteActivePolls() {
        List<Poll> activePolls = pollRepository.findByStatus(Poll.Status.ACTIVE);
        activePolls.forEach(this::deletePollInternal);
        return activePolls.size();
    }

    private void deletePollInternal(Poll poll) {
        Long pollId = poll.getId();
        voteRepository.deleteByPollId(pollId);
        candidateRepository.deleteByPollId(pollId);
        pollRepository.deleteById(pollId);
        ledgerService.recordPollDeleted(poll);
    }
}
