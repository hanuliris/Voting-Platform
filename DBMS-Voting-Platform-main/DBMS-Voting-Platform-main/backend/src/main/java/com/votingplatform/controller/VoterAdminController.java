package com.votingplatform.controller;

import com.votingplatform.dto.VoterProvisionDTO;
import com.votingplatform.dto.VoterSearchDTO;
import com.votingplatform.service.VoterAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/voters")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class VoterAdminController {

    @Autowired
    private VoterAdminService voterAdminService;

    @PostMapping("/import")
    public ResponseEntity<?> importVoters(@RequestParam("file") MultipartFile file) {
        try {
            List<VoterProvisionDTO> results = voterAdminService.importVoters(file);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/search")
    public List<VoterSearchDTO> searchVoters(@RequestParam("q") String query) {
        return voterAdminService.searchVoters(query);
    }

    @DeleteMapping("/all")
    public ResponseEntity<Map<String, Object>> deleteAllVoters() {
        long deleted = voterAdminService.deleteAllVoters();
        return ResponseEntity.ok(Map.of(
                "deleted", deleted,
                "scope", "VOTERS"
        ));
    }
}
