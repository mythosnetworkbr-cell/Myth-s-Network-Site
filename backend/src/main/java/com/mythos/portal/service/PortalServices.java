package com.mythos.portal.service;

import com.mythos.portal.model.Models.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public final class PortalServices { private PortalServices() {} }

@Service
class CoinService {
    public List<CoinPackage> getAvailablePackages() {
        return List.of(new CoinPackage(1,25,"25 Coins",25.00),new CoinPackage(2,50,"50 Coins",50.00),new CoinPackage(3,80,"80 Coins",80.00),new CoinPackage(4,100,"100 Coins",100.00),new CoinPackage(5,150,"150 Coins",150.00),new CoinPackage(6,200,"200 Coins",200.00));
    }
    public double calculatePrice(int amount, boolean coupon) { if(amount <= 0) throw new IllegalArgumentException("Quantidade inválida."); double p=amount; return coupon?p*0.95:p; }
}

@Service
class ServerService {
    public List<ServerInfo> getActiveServers() { return List.of(new ServerInfo(1,"Servidor 1 Lex City RP","ONLINE",128,150),new ServerInfo(2,"Servidor 2 Nyx Roleplay","ONLINE",94,150)); }
}

@Service
class AuthService {
    private final CoinService coins; private final ServerService servers;
    AuthService(CoinService coins, ServerService servers){this.coins=coins;this.servers=servers;}
    public AuthResponse login(LoginRequest r){
        if(r==null||r.loginType()==null) throw new IllegalArgumentException("Tipo de login obrigatório.");
        validate(r.identifier(),r.loginType());
        if(r.password()==null||r.password().length()<6) throw new IllegalArgumentException("Senha deve possuir ao menos 6 caracteres.");
        String username=r.identifier().contains("@")?r.identifier().split("@",2)[0]:r.identifier();
        Coupon c=new Coupon("MYTHOS5OFF-"+UUID.randomUUID().toString().substring(0,6).toUpperCase(),5.0,true);
        return new AuthResponse(UUID.randomUUID().toString(),username,"Bem-vindo de volta à Mythøs Network, "+username+"! Você recebeu um cupom de 5% de desconto na sua conta.",c,servers.getActiveServers(),coins.getAvailablePackages());
    }
    private void validate(String id, LoginType t){
        if(id==null||id.isBlank()) throw new IllegalArgumentException("Identificador de login não pode estar vazio.");
        switch(t){case EMAIL->{if(!id.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))throw new IllegalArgumentException("Formato de e-mail inválido.");} case PHONE->{if(!id.matches("\\+?[0-9]{10,15}"))throw new IllegalArgumentException("Número de telefone inválido.");} case DISCORD->{if(id.trim().length()<3)throw new IllegalArgumentException("Usuário/ID do Discord inválido.");}}
    }
}

@Service
class PhotoService {
    private final Map<String,PhotoPost> photos=new ConcurrentHashMap<>();
    private final Map<String,Set<String>> likes=new ConcurrentHashMap<>();
    public PhotoPost publish(CreatePhotoRequest r,String username,String avatar){if(r==null||r.userId()==null||r.userId().isBlank())throw new IllegalArgumentException("Usuário obrigatório.");if(r.imageUrl()==null||r.imageUrl().isBlank())throw new IllegalArgumentException("A URL da imagem é obrigatória.");String id=UUID.randomUUID().toString();PhotoPost p=new PhotoPost(id,r.userId(),username,avatar,r.imageUrl(),r.caption()==null?"":r.caption(),0,LocalDateTime.now());photos.put(id,p);return p;}
    public List<PhotoPost> all(){return photos.values().stream().sorted(Comparator.comparing(PhotoPost::createdAt).reversed()).toList();}
    public synchronized PhotoPost like(String photoId,String userId){PhotoPost p=Optional.ofNullable(photos.get(photoId)).orElseThrow(()->new IllegalArgumentException("Foto não encontrada."));if(userId==null||userId.isBlank())throw new IllegalArgumentException("Usuário obrigatório.");Set<String>s=likes.computeIfAbsent(photoId,k->new HashSet<>());if(!s.add(userId))return p;PhotoPost u=new PhotoPost(p.id(),p.userId(),p.username(),p.userAvatar(),p.imageUrl(),p.caption(),s.size(),p.createdAt());photos.put(photoId,u);return u;}
}
