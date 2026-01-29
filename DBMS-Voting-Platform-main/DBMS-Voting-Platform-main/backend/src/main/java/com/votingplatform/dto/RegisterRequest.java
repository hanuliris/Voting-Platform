package com.votingplatform.dto;

import com.votingplatform.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private User.Role role = User.Role.VOTER;
}
