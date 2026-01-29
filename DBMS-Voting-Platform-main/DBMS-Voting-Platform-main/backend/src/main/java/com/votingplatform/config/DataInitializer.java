package com.votingplatform.config;

import com.votingplatform.entity.User;
import com.votingplatform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if users already exist
            if (userRepository.count() == 0) {
                // Create Admin User
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@voting.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Admin user created - Email: admin@voting.com, Password: Admin@123");

                // Create Voter User 1
                User voter1 = new User();
                voter1.setName("John Doe");
                voter1.setEmail("voter1@voting.com");
                voter1.setPassword(passwordEncoder.encode("Voter@123"));
                voter1.setRole(User.Role.VOTER);
                userRepository.save(voter1);
                System.out.println("✅ Voter1 user created - Email: voter1@voting.com, Password: Voter@123");

                // Create Voter User 2
                User voter2 = new User();
                voter2.setName("Jane Smith");
                voter2.setEmail("voter2@voting.com");
                voter2.setPassword(passwordEncoder.encode("Voter@123"));
                voter2.setRole(User.Role.VOTER);
                userRepository.save(voter2);
                System.out.println("✅ Voter2 user created - Email: voter2@voting.com, Password: Voter@123");

                // Create Candidate User (can also be a voter)
                User candidate = new User();
                candidate.setName("Alex Johnson");
                candidate.setEmail("candidate@voting.com");
                candidate.setPassword(passwordEncoder.encode("Candidate@123"));
                candidate.setRole(User.Role.VOTER); // Candidates are voters by role
                userRepository.save(candidate);
                System.out.println("✅ Candidate user created - Email: candidate@voting.com, Password: Candidate@123");
                
                System.out.println("\n📋 DEFAULT CREDENTIALS SUMMARY:");
                System.out.println("================================");
                System.out.println("ADMIN:");
                System.out.println("  Email: admin@voting.com");
                System.out.println("  Password: Admin@123");
                System.out.println("\nVOTER 1:");
                System.out.println("  Email: voter1@voting.com");
                System.out.println("  Password: Voter@123");
                System.out.println("\nVOTER 2:");
                System.out.println("  Email: voter2@voting.com");
                System.out.println("  Password: Voter@123");
                System.out.println("\nCANDIDATE:");
                System.out.println("  Email: candidate@voting.com");
                System.out.println("  Password: Candidate@123");
                System.out.println("================================\n");
            } else {
                System.out.println("ℹ️  Users already exist in database. Skipping initialization.");
            }
        };
    }
}
