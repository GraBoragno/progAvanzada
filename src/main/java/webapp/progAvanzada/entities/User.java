package webapp.progAvanzada.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "user")
public class User {

    @Id
    private String id;
    private String username;
    private String password;
    private List<Playlist> playlists = new ArrayList<>();

}
