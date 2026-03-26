package com.example.webbanhang.controller;

import com.example.webbanhang.dto.AuthDto;
import com.example.webbanhang.entity.Address;
import com.example.webbanhang.entity.User;
import com.example.webbanhang.repository.AddressRepository;
import com.example.webbanhang.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final AddressRepository addressRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name(),
                "createdAt", user.getCreatedAt()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody AuthDto.UpdateProfileRequest req) {
        User updated = userService.updateProfile(userDetails.getUsername(), req);
        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "fullName", updated.getFullName(),
                "email", updated.getEmail(),
                "phone", updated.getPhone() != null ? updated.getPhone() : ""
        ));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody AuthDto.ChangePasswordRequest req) {
        try {
            userService.changePassword(userDetails.getUsername(), req);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(addressRepository.findByUserId(user.getId()));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<Address> addAddress(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestBody Address address) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        address.setUser(user);
        return ResponseEntity.ok(addressRepository.save(address));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền xóa địa chỉ này"));
        }
        addressRepository.delete(address);
        return ResponseEntity.ok(Map.of("message", "Đã xóa địa chỉ"));
    }
}
