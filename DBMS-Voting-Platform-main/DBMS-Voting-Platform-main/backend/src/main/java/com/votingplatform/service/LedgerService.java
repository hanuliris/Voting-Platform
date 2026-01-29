package com.votingplatform.service;

import com.votingplatform.entity.LedgerEntry;
import com.votingplatform.entity.Poll;
import com.votingplatform.entity.Vote;
import com.votingplatform.repository.LedgerEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class LedgerService {

    private static final String ACTION_CREATE = "CREATE";
    private static final String ACTION_UPDATE = "UPDATE";
    private static final String ACTION_DELETE = "DELETE";
    private static final String ACTION_CAST_VOTE = "CAST";

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    public void recordPollCreated(Poll poll) {
        recordPollEvent(poll, ACTION_CREATE);
    }

    public void recordPollUpdated(Poll poll) {
        recordPollEvent(poll, ACTION_UPDATE);
    }

    public void recordPollDeleted(Poll poll) {
        recordPollEvent(poll, ACTION_DELETE);
    }

    public void recordVoteCast(Vote vote) {
        String criticalData = String.format("poll:%s|candidate:%s|user:%s|ip:%s",
                vote.getPoll().getId(),
                vote.getCandidate().getId(),
                vote.getUser().getId(),
                safe(vote.getIpAddress()));

        String metadata = String.format("Vote for poll %s by user %s", vote.getPoll().getId(), vote.getUser().getId());
        recordEntry(LedgerEntry.EntityType.VOTE, ACTION_CAST_VOTE, vote.getPoll().getId(), criticalData, metadata);
    }

    private void recordPollEvent(Poll poll, String action) {
        String criticalData = String.format("poll:%s|title:%s|status:%s|start:%s|end:%s",
                poll.getId(),
                safe(poll.getTitle()),
                poll.getStatus(),
                poll.getStartDate(),
                poll.getEndDate());
        String metadata = String.format("Poll %s - %s", poll.getId(), action);
        recordEntry(LedgerEntry.EntityType.POLL, action, poll.getId(), criticalData, metadata);
    }

    private void recordEntry(LedgerEntry.EntityType entityType,
                             String action,
                             Long entityId,
                             String criticalData,
                             String metadata) {
        String dataHash = hash(criticalData);
        String previousHash = ledgerEntryRepository.findTopByOrderByIdDesc()
                .map(LedgerEntry::getHash)
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        String blockSeed = entityType + "|" + action + "|" + entityId + "|" + dataHash + "|" +
                (previousHash == null ? "GENESIS" : previousHash) + "|" + now;
        String blockHash = hash(blockSeed);

        LedgerEntry entry = new LedgerEntry();
        entry.setEntityType(entityType);
        entry.setAction(action);
        entry.setEntityId(entityId);
        entry.setDataHash(dataHash);
        entry.setPreviousHash(previousHash);
        entry.setHash(blockHash);
        entry.setMetadata(metadata);
        entry.setCreatedAt(now);
        ledgerEntryRepository.save(entry);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String safe(Object value) {
        return value == null ? "" : value.toString();
    }
}
