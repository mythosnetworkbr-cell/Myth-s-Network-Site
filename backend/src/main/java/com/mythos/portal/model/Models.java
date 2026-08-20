package com.mythos.portal.model;

import java.time.LocalDateTime;
import java.util.List;

public final class Models {
    private Models() {}

    public enum LoginType { EMAIL, DISCORD, PHONE }
    public record LoginRequest(String identifier, String password, LoginType loginType) {}
    public record Coupon(String code, double discountPercentage, boolean active) {}
    public record CoinPackage(int id, int coinsAmount, String label, double price) {}
    public record ServerInfo(int id, String name, String status, int playersOnline, int maxPlayers) {}
    public record AuthResponse(String userId, String username, String notificationMessage, Coupon welcomeCoupon, List<ServerInfo> availableServers, List<CoinPackage> availableCoins) {}
    public record PhotoPost(String id, String userId, String username, String userAvatar, String imageUrl, String caption, int likesCount, LocalDateTime createdAt) {}
    public record CreatePhotoRequest(String userId, String imageUrl, String caption) {}
}
