package webapp.progAvanzada.resolver;

import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import webapp.progAvanzada.entities.Playlist;
import webapp.progAvanzada.entities.User;
import webapp.progAvanzada.entities.Video;
import webapp.progAvanzada.repo.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;



    @QueryMapping
    public List<User> users()
    {
        return userRepository.findAll();
    }

    @QueryMapping
    public User userById(@Argument String id)
    {
        return userRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public User login(@Argument String username, @Argument String password)
    {
        return userRepository.findByUsernameAndPassword(username, password).orElse(null);
    }

    @MutationMapping
    public User register(@Argument String username, @Argument String password)
    {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setPlaylists(new ArrayList<>());
        return userRepository.save(user);
    }

    @MutationMapping
    public Playlist addPlaylist(@Argument String userId, @Argument String name)
    {
        User user = userRepository.findById(userId).orElse(null);
        Playlist newPlaylist = new Playlist();
        newPlaylist.setId(UUID.randomUUID().toString());
        newPlaylist.setName(name);
        newPlaylist.setVideos(new ArrayList<>());
        if (user.getPlaylists() == null) {
            user.setPlaylists(new ArrayList<>());
        }
        user.getPlaylists().add(newPlaylist);
        userRepository.save(user);
        return newPlaylist;
    }

    @MutationMapping
    public Video addVideo(@Argument String userId, @Argument String playlistId, @Argument String name, @Argument String link)
    {
        User user = userRepository.findById(userId).orElse(null);

        Video newVideo = new Video();
        newVideo.setId(UUID.randomUUID().toString());
        newVideo.setName(name);
        newVideo.setLink(link);
        newVideo.setFav(false);
        newVideo.setLike(0);

        Playlist playlist = user.getPlaylists().stream().filter(p -> p.getId().equals(playlistId)).findFirst().get();
        if (playlist.getVideos() == null) {
            playlist.setVideos(new ArrayList<>());
        }
        playlist.getVideos().add(newVideo);
        userRepository.save(user);

        return newVideo;
    }

    @MutationMapping
    public Video likeVideo(@Argument String userId, @Argument String playlistId, @Argument String videoId)
    {
        User user = userRepository.findById(userId).orElse(null);
        Playlist playlist = user.getPlaylists().stream().filter(p -> p.getId().equals(playlistId)).findFirst().get();
        Video video = playlist.getVideos().stream().filter(v -> v.getId().equals(videoId)).findFirst().get();
        video.setLike(video.getLike() + 1);
        userRepository.save(user);
        return video;
    }

    @MutationMapping
    public Video toggleFavorite(@Argument String userId, @Argument String playlistId, @Argument String videoId)
    {
        User user = userRepository.findById(userId).orElse(null);
        Playlist playlist = user.getPlaylists().stream().filter(p -> p.getId().equals(playlistId)).findFirst().get();
        Video video = playlist.getVideos().stream().filter(v -> v.getId().equals(videoId)).findFirst().get();
        video.setFav(!video.isFav());
        userRepository.save(user);
        return video;
    }

}
