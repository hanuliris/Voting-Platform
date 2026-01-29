package com.votingplatform.controller;

import com.votingplatform.entity.LedgerEntry;
import com.votingplatform.repository.LedgerEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ledger")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class LedgerController {

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @GetMapping
    public List<LedgerEntry> getAllEntries() {
        return ledgerEntryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @GetMapping("/latest")
    public ResponseEntity<LedgerEntry> getLatestEntry() {
        return ledgerEntryRepository.findTopByOrderByIdDesc()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
