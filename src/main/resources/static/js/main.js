// URL de tu backend GraphQL
const GRAPHQL_URL = '/graphql';

// ====== Helpers de sesión ======
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ====== Registro ======
document.getElementById('registerForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    const query = `
    mutation {
      register(username: "${username}", password: "${password}") {
        id
        username
      }
    }
  `;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.data.register) {
        setUser(data.data.register);
        window.location.href = 'login.html';
    } else {
        alert('Error al registrar');
    }
});

// ====== Login ======
document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const query = `
    query {
      login(username: "${username}", password: "${password}") {
        id
        username
      }
    }
  `;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    const user = data.data.login;
    if (user) {
        setUser(user);
        window.location.href = 'index.html';
    } else {
        alert('Credenciales inválidas');
    }
});

// ====== Home ======
if (document.getElementById('username')) {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.getElementById('username').innerText = user.username;
    }
}

// ====== Playlists ======


let selectedPlaylistId = null;

// Helpers de sesión


// ====== Modales ======
function openPlaylistModal() {
    document.getElementById('playlistModal').style.display = 'flex';
}
function closePlaylistModal() {
    document.getElementById('playlistModal').style.display = 'none';
}
function openVideoModal(playlistId) {
    selectedPlaylistId = playlistId;
    document.getElementById('videoModal').style.display = 'flex';
}
function closeVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
}

// ====== Crear Playlist ======
async function createPlaylist() {
    const user = getUser();
    const name = document.getElementById('playlistName').value;

    const query = `
    mutation {
      addPlaylist(userId: "${user.id}", name: "${name}") {
        id
        name
      }
    }
  `;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.data.addPlaylist) {
        closePlaylistModal();
        loadPlaylists();
    }
}

// ====== Crear Video ======
async function createVideo() {
    const user = getUser();
    const name = document.getElementById('videoName').value;
    const link = document.getElementById('videoLink').value;

    const query = `
    mutation {
      addVideo(userId: "${user.id}", playlistId: "${selectedPlaylistId}", name: "${name}", link: "${link}") {
        id
        name
        link
      }
    }
  `;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.data.addVideo) {
        closeVideoModal();
        loadPlaylists();
    }
}

// ====== Render Playlists ======
async function loadPlaylists() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const query = `
    query {
      userById(id: "${user.id}") {
        id
        username
        playlists {
          id
          name
          videos {
            id
            name
            link
          }
        }
      }
    }
  `;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    console.log("Respuesta GraphQL:", data); // 👈 para depurar

    if (!data.data.userById) {
        document.getElementById('playlists').innerHTML = "<p>No hay playlists aún</p>";
        return;
    }

    const playlists = data.data.userById.playlists || [];
    const container = document.getElementById('playlists');
    container.innerHTML = '';

    playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'playlist-card';

        const videosHtml = pl.videos && pl.videos.length > 0
            ? pl.videos.map(v => `
      <div class="video-item" onclick="goToVideo('${v.id}')">
        <div class="video-name">${v.name}</div>
        <div class="video-link">${v.link}</div>
      </div>
    `).join('')
            : "<p>Esta playlist aún no tiene videos</p>";


        card.innerHTML = `
      <div class="playlist-title">
        ${pl.name}
        <span style="cursor:pointer; color:#cc0000; font-size:20px;" onclick="openVideoModal('${pl.id}')">+</span>
      </div>
      <div class="videos-list">${videosHtml}</div>
    `;

        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'SPAN') {
                const videosDiv = card.querySelector('.videos-list');
                videosDiv.classList.toggle('active');
            }
        });

        container.appendChild(card);
    });
}


if (document.getElementById('playlists')) {
    loadPlaylists();
}

function goToVideo(videoId) {
    window.location.href = `video.html?video=${videoId}`;
}


// ====== Reproductor de video ======
async function loadVideoPage() {
    const videoId = new URLSearchParams(window.location.search).get("video");
    const user = getUser();
    if (!user || !videoId) {
        window.location.href = 'login.html';
        return;
    }

    const query = `
    query {
      userById(id: "${user.id}") {
        playlists {
          id
          name
          videos {
            id
            name
            link
          }
        }
      }
    }
    `;

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    const allPlaylists = data.data.userById?.playlists || [];

    // Buscar el video y su playlist
    let currentVideo = null;
    let currentPlaylist = null;

    for (const pl of allPlaylists) {
        const match = pl.videos.find(v => v.id === videoId);
        if (match) {
            currentVideo = match;
            currentPlaylist = pl;
            break;
        }
    }

    if (!currentVideo) {
        document.getElementById("videoTitle").innerText = "Video no encontrado";
        document.getElementById("videoFrame").style.display = "none";
        return;
    }

    // Mostrar video principal

    document.getElementById("videoTitle").innerText = currentVideo.name;

    const iframe = document.getElementById("videoFrame");
    const embedUrl = getEmbedUrl(currentVideo.link);

// Si embedUrl proviene de youtube/vimeo/etc. lo usamos
    iframe.src = embedUrl;

    const initialLikes = Number(currentVideo.like ?? 0);
    document.getElementById("likeCount").innerText = initialLikes;

    const isFavInitial = Boolean(currentVideo.fav);
    document.getElementById("favBtn").classList.toggle("active", isFavInitial);
    // Mostrar likes y favoritos
    document.getElementById("likeCount").innerText = currentVideo.like ?? 0;
    if (currentVideo.fav) {
        document.getElementById("favBtn").classList.add("active");
    }

    const likeBtn = document.getElementById("likeBtn");
    const likeCountSpan = document.getElementById("likeCount");

// Set initial
    likeCountSpan.innerText = Number(currentVideo.like ?? 0);

// Use onclick (evita duplicados de addEventListener)
    likeBtn.onclick = async () => {
        likeBtn.disabled = true;
        try {
            const mutation = `
      mutation {
        likeVideo(userId: "${user.id}", playlistId: "${currentPlaylist.id}", videoId: "${currentVideo.id}") {
          id
          like
        }
      }`;
            const r = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: mutation })
            });
            const json = await r.json();
            if (json.errors) {
                console.error('GraphQL errors:', json.errors);
                alert('Error al dar like. Revisa consola.');
            } else {
                const updated = json.data.likeVideo;
                // Actualiza estado local y UI
                currentVideo.like = Number(updated.like ?? currentVideo.like ?? 0);
                likeCountSpan.innerText = currentVideo.like;
            }
        } catch (err) {
            console.error(err);
            alert('Error de red al dar like');
        } finally {
            likeBtn.disabled = false;
        }
    };

// --- Favorito ---
    const favBtn = document.getElementById("favBtn");
// Inicial
    favBtn.classList.toggle("active", Boolean(currentVideo.fav));
    favBtn.onclick = async () => {
        favBtn.disabled = true;
        try {
            const mutation = `
      mutation {
        toggleFavorite(userId: "${user.id}", playlistId: "${currentPlaylist.id}", videoId: "${currentVideo.id}") {
          id
          fav
        }
      }`;
            const r = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: mutation })
            });
            const json = await r.json();
            if (json.errors) {
                console.error('GraphQL errors:', json.errors);
                alert('Error al toggle favorito. Revisa consola.');
            } else {
                const updated = json.data.toggleFavorite;
                currentVideo.fav = Boolean(updated.fav);
                favBtn.classList.toggle("active", currentVideo.fav);
            }
        } catch (err) {
            console.error(err);
            alert('Error de red al togglear favorito');
        } finally {
            favBtn.disabled = false;
        }
    };

// Fallback: siempre mostrar un enlace "Abrir en nueva pestaña"
    const fallbackDiv = document.getElementById('videoFallback');
    fallbackDiv.innerHTML = `<a href="${currentVideo.link}" target="_blank" rel="noopener noreferrer">Abrir video en nueva pestaña</a>`;


    // Renderizar lista lateral
    const listContainer = document.getElementById("playlistVideos");
    listContainer.innerHTML = "";

    currentPlaylist.videos.forEach(v => {
        const item = document.createElement("div");
        item.className = "video-list-item";
        item.onclick = () => window.location.href = `video.html?video=${v.id}`;
        item.innerHTML = `<div class="video-name"> ${v.name}</div>`;
        listContainer.appendChild(item);
    });
}

// Ejecutar solo si estamos en videos.html
if (document.getElementById("videoFrame")) {
    loadVideoPage();
}

function getEmbedUrl(link) {
    if (!link) return '';

    try {
        const url = new URL(link);
        const host = url.hostname.replace('www.', '').toLowerCase();

        // YouTube: watch?v=ID  o youtu.be/ID  o ya embed
        if (host.includes('youtube.com')) {
            // si ya es /embed/...
            if (url.pathname.startsWith('/embed/')) return url.href;
            // parámetro v
            const vid = url.searchParams.get('v');
            if (vid) return `https://www.youtube.com/embed/${vid}`;
            // otras rutas (ej: /v/ID)
            const parts = url.pathname.split('/');
            const maybeId = parts.pop() || parts.pop();
            if (maybeId) return `https://www.youtube.com/embed/${maybeId}`;
        }
        if (host === 'youtu.be') {
            const id = url.pathname.replace('/', '');
            if (id) return `https://www.youtube.com/embed/${id}`;
        }

        // Vimeo (ejemplo)
        if (host.includes('vimeo.com')) {
            // vimeo.com/ID  o player.vimeo.com/video/ID
            if (url.pathname.startsWith('/video/')) return url.href;
            const parts = url.pathname.split('/');
            const id = parts.pop() || parts.pop();
            if (id) return `https://player.vimeo.com/video/${id}`;
        }

        // Si ya es un .embed u otro dominio que permita iframe, devuélvelo tal cual
        return link;
    } catch (e) {
        return link; // si no es una URL válida, devolver tal cual
    }
}