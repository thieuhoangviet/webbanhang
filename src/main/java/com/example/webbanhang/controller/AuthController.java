package com.example.webbanhang.controller;

import com.example.webbanhang.dto.AuthDto;
import com.example.webbanhang.entity.User;
import com.example.webbanhang.security.JwtUtil;
import com.example.webbanhang.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        try {
            User user = userService.register(req);
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthDto.AuthResponse(
                    token, user.getEmail(), user.getFullName(), user.getRole().name(), user.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            User user = userService.getUserByEmail(req.getEmail());
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthDto.AuthResponse(
                    token, user.getEmail(), user.getFullName(), user.getRole().name(), user.getId()
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email hoặc mật khẩu không đúng!"));
        }
    }
}
