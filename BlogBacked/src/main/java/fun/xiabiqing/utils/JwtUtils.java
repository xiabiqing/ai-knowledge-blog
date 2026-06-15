package fun.xiabiqing.utils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
public class JwtUtils {
    public static final String JWT_SECRET = System.getenv().getOrDefault("JWT_SECRET", "change_me_to_a_random_secret");
    public static final long JWT_EXPIRATION = 24*60*60*1000;
    public static String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+JWT_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256,JWT_SECRET)
                .compact();

    }
    public static Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(JWT_SECRET)
                .parseClaimsJws(token)
                .getBody();
    }
}
