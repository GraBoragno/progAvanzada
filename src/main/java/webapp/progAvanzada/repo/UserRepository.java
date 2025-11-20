package webapp.progAvanzada.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import webapp.progAvanzada.entities.User;

import java.util.Optional;

public interface UserRepository  extends MongoRepository<User, String> {
    Optional<User> findByUsernameAndPassword(String username, String password);
}
