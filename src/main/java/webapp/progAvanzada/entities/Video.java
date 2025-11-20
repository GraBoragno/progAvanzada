package webapp.progAvanzada.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
public class Video {
    @Id
    private String id;
    private String name;
    private String link;
    private int likes;
    private boolean favorite;
}
