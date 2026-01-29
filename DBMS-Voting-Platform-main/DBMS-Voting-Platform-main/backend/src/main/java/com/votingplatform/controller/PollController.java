package com.votingplatform.controller;

import com.votingplatform.dto.PollRequest;
import com.votingplatform.entity.Candidate;
import com.votingplatform.entity.Poll;
import com.votingplatform.repository.CandidateRepository;
import com.votingplatform.service.PollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/polls")
@CrossOrigin(origins = "http://localhost:3000")
public class PollController {

    @Autowired
    private PollService pollService;

    @Autowired
    private CandidateRepository candidateRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Poll> createPoll(@RequestBody PollRequest request) {
        Poll poll = pollService.createPoll(request);
        return ResponseEntity.ok(poll);
    }

    @GetMapping
    public ResponseEntity<List<Poll>> getAllPolls() {
        List<Poll> polls = pollService.getAllPolls();
        return ResponseEntity.ok(polls);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Poll>> getActivePolls() {
        List<Poll> polls = pollService.getActivePolls();
        return ResponseEntity.ok(polls);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poll> getPollById(@PathVariable Long id) {
        Poll poll = pollService.getPollById(id);
        return ResponseEntity.ok(poll);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Poll> updatePoll(@PathVariable Long id, @RequestBody PollRequest request) {
        Poll poll = pollService.updatePoll(id, request);
        return ResponseEntity.ok(poll);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePoll(@PathVariable Long id) {
        pollService.deletePoll(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAllPolls() {
        long deleted = pollService.deleteAllPolls();
        return ResponseEntity.ok(Map.of("deleted", deleted, "scope", "ALL"));
    }

    @DeleteMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteActivePolls() {
        long deleted = pollService.deleteActivePolls();
        return ResponseEntity.ok(Map.of("deleted", deleted, "scope", "ACTIVE"));
    }

    @GetMapping("/{pollId}/candidates")
    public ResponseEntity<List<Candidate>> getCandidatesByPollId(@PathVariable Long pollId) {
        List<Candidate> candidates = candidateRepository.findByPollId(pollId);
        return ResponseEntity.ok(candidates);
    }

    @PostMapping("/{pollId}/candidates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Candidate> addCandidate(@PathVariable Long pollId, @RequestBody Map<String, String> request) {
        Poll poll = pollService.getPollById(pollId);
        
        Candidate candidate = new Candidate();
        candidate.setName(request.get("name"));
        candidate.setDescription(request.get("description"));
        candidate.setPoll(poll);
        
        Candidate savedCandidate = candidateRepository.save(candidate);
        return ResponseEntity.ok(savedCandidate);
    }
}
