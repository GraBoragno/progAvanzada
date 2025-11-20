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
async function loadPlaylists() {
    const user = getUser();
    if (!user) {
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
            likes
            favorite
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
    const playlists = data.data.userById.playlists;
    const container = document.getElementById('playlists');

    playlists.forEach(pl => {
        const plDiv = document.createElement('div');
        plDiv.innerHTML = `<h2>${pl.name}</h2>`;
        pl.videos.forEach(v => {
            plDiv.innerHTML += `
        <div class="card">
          <h3>${v.name}</h3>
          <iframe src="${v.link}" width="560" height="315" frameborder="0" allowfullscreen></iframe>
          <p>Likes: ${v.likes}</p>
          <p>Favorito: ${v.favorite}</p>
        </div>
      `;
        });
        container.appendChild(plDiv);
    });
}

// Si existe el div playlists en la página, cargamos
if (document.getElementById('playlists')) {
    loadPlaylists();
}
