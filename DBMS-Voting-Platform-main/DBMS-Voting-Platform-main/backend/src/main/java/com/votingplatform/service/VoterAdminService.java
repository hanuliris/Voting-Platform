package com.votingplatform.service;

import com.votingplatform.dto.VoterProvisionDTO;
import com.votingplatform.dto.VoterSearchDTO;
import com.votingplatform.entity.User;
import com.votingplatform.repository.UserRepository;
import com.votingplatform.repository.VoteRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VoterAdminService {

    private static final String EMAIL_DOMAIN = "@voting.com";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VoteRepository voteRepository;

    @Transactional
    public List<VoterProvisionDTO> importVoters(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a non-empty Excel file");
        }

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalArgumentException("Excel sheet is empty");
            }

            List<VoterProvisionDTO> created = new ArrayList<>();
            Set<String> pendingEmails = new HashSet<>();

            for (Row row : sheet) {
                if (row == null) {
                    continue;
                }

                if (isHeaderRow(row)) {
                    continue;
                }

                Cell cell = row.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (cell == null) {
                    continue;
                }

                cell.setCellType(CellType.STRING);
                String rawName = cell.getStringCellValue();
                if (rawName == null) {
                    continue;
                }

                String name = rawName.trim();
                if (name.isEmpty()) {
                    continue;
                }

                String email = generateUniqueEmail(name, pendingEmails);
                String tempPassword = generateTemporaryPassword();

                User user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(tempPassword));
                user.setRole(User.Role.VOTER);

                LocalDateTime now = LocalDateTime.now();
                User saved = userRepository.save(user);
                LocalDateTime createdAt = saved.getCreatedAt() != null ? saved.getCreatedAt() : now;
                pendingEmails.add(email.toLowerCase(Locale.ROOT));

                created.add(new VoterProvisionDTO(
                        saved.getId(),
                        saved.getName(),
                        saved.getEmail(),
                        tempPassword,
                    createdAt
                ));
            }

            if (created.isEmpty()) {
                throw new IllegalArgumentException("No valid names were found in the uploaded file");
            }

            return created;
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read Excel file. Please upload .xlsx format", e);
        }
    }

    public List<VoterSearchDTO> searchVoters(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        List<User> users = userRepository.searchByRoleAndQuery(User.Role.VOTER, query.trim());
        List<VoterSearchDTO> results = new ArrayList<>();
        for (User user : users) {
            results.add(new VoterSearchDTO(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt()));
        }
        return results;
    }

    @Transactional
    public long deleteAllVoters() {
        List<Long> voterIds = userRepository.findIdsByRole(User.Role.VOTER);
        if (voterIds.isEmpty()) {
            return 0;
        }

        voteRepository.deleteByUserIdIn(voterIds);
        return userRepository.deleteByRole(User.Role.VOTER);
    }

    private boolean isHeaderRow(Row row) {
        if (row.getRowNum() == 0) {
            Cell cell = row.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null) {
                cell.setCellType(CellType.STRING);
                String value = cell.getStringCellValue();
                return value != null && value.trim().equalsIgnoreCase("name");
            }
        }
        return false;
    }

    private String generateUniqueEmail(String name, Set<String> pendingEmails) {
        String base = sanitizeName(name);
        if (base.isEmpty()) {
            base = "voter";
        }

        String candidate = base;
        int suffix = 1;
        while (emailExists(candidate + EMAIL_DOMAIN, pendingEmails)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate + EMAIL_DOMAIN;
    }

    private boolean emailExists(String email, Set<String> pending) {
        String lower = email.toLowerCase(Locale.ROOT);
        return pending.contains(lower) || userRepository.existsByEmail(email);
    }

        private String sanitizeName(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
            .replaceAll("[^\\p{ASCII}]", "");
        String lowered = normalized.toLowerCase(Locale.ROOT)
            .replaceAll("\\s+", ".")
            .replaceAll("[^a-z0-9.]", "");
        return lowered.replaceAll("\\.+", ".").replaceAll("^\\.+|\\.+$", "");
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            int index = RANDOM.nextInt(PASSWORD_CHARS.length());
            sb.append(PASSWORD_CHARS.charAt(index));
        }
        return "Vote@" + sb;
    }
}
