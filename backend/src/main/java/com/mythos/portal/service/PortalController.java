package com.mythos.portal.service;

import com.mythos.portal.model.Models.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "${MYTHOS_CORS_ORIGIN:http://localhost:5173}")
public class PortalController {
    private final AuthService auth; private final CoinService coins; private final ServerService servers; private final PhotoService photos;
    public PortalController(AuthService auth,CoinService coins,ServerService servers,PhotoService photos){this.auth=auth;this.coins=coins;this.servers=servers;this.photos=photos;}

    @PostMapping("/auth/login") public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest r){return ResponseEntity.ok(auth.login(r));}
    @GetMapping("/coins/packages") public ResponseEntity<List<CoinPackage>> coins(){return ResponseEntity.ok(coins.getAvailablePackages());}
    @GetMapping("/servers") public ResponseEntity<List<ServerInfo>> servers(){return ResponseEntity.ok(servers.getActiveServers());}
    @GetMapping("/photos") public ResponseEntity<List<PhotoPost>> feed(){return ResponseEntity.ok(photos.all());}
    @PostMapping("/photos/publish") public ResponseEntity<PhotoPost> publish(@RequestBody CreatePhotoRequest r,@RequestHeader(value="X-User-Name",defaultValue="Jogador")String name,@RequestHeader(value="X-User-Avatar",defaultValue="")String avatar){return ResponseEntity.ok(photos.publish(r,name,avatar));}
    @PostMapping("/photos/{id}/like") public ResponseEntity<PhotoPost> like(@PathVariable String id,@RequestHeader("X-User-Id")String userId){return ResponseEntity.ok(photos.like(id,userId));}
}
