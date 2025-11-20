package webapp.progAvanzada;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import webapp.progAvanzada.entities.User;
import webapp.progAvanzada.entities.Playlist;
import webapp.progAvanzada.entities.Video;
import webapp.progAvanzada.repo.UserRepository;
import webapp.progAvanzada.resolver.UserController;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BackendIntegrationTests {

    @Autowired
    private UserController userController;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFullFlow() {
        // Registro
        User user = userController.register("lautaro", "123");
        assertNotNull(user.getId());
        assertEquals("lautaro", user.getUsername());
        assertTrue(user.getPlaylists().isEmpty());

        // Crear playlist
        Playlist playlist = userController.addPlaylist(user.getId(), "Favoritos");
        assertEquals("Favoritos", playlist.getName());
        assertTrue(playlist.getVideos().isEmpty());

        // Agregar video
        Video video = userController.addVideo(user.getId(), playlist.getId(), "Video test", "https://youtu.be/abc123");
        assertEquals("Video test", video.getName());
        assertEquals(0, video.getLike());
        assertFalse(video.isFav());

        // Like
        Video liked = userController.likeVideo(user.getId(), playlist.getId(), video.getId());
        assertEquals(1, liked.getLike());

        // Toggle favorito
        Video toggled = userController.toggleFavorite(user.getId(), playlist.getId(), video.getId());
        assertTrue(toggled.isFav());
    }
}
