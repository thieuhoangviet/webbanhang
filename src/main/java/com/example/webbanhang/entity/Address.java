package com.example.webbanhang.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "receiver_name")
    private String receiverName;

    private String phone;

    @Column(name = "address_line")
    private String addressLine;

    private String ward;
    private String district;
    private String province;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;
}
