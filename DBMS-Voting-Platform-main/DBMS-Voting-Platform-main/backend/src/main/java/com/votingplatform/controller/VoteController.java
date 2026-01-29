package com.votingplatform.controller;

import com.votingplatform.dto.VoteRequest;
import com.votingplatform.dto.VoteResultDTO;
import com.votingplatform.entity.Vote;
import com.votingplatform.service.VoteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "http://localhost:3000")
public class VoteController {

    @Autowired
    private VoteService voteService;

    @PostMapping
    public ResponseEntity<?> castVote(@RequestBody VoteRequest request, HttpServletRequest httpRequest) {
        try {
            Vote vote = voteService.castVote(request, httpRequest);
            return ResponseEntity.ok(vote);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/poll/{pollId}/user")
    public ResponseEntity<Map<String, Boolean>> hasUserVoted(@PathVariable Long pollId) {
        boolean hasVoted = voteService.hasUserVoted(pollId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasVoted", hasVoted);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/poll/{pollId}/results")
    public ResponseEntity<List<VoteResultDTO>> getPollResults(@PathVariable Long pollId) {
        List<VoteResultDTO> results = voteService.getPollResults(pollId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getUserVoteHistory() {
        try {
            List<Vote> votes = voteService.getUserVoteHistory();
            return ResponseEntity.ok(votes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
