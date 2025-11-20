package webapp.progAvanzada.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.List;

@Data
public class Playlist {
    @Id
    private String id;
    private String name;
    private List<Video> videos;
}
