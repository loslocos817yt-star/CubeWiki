const USER = "loslocos817yt-star";
const REPO = "CubeWiki";
const GH_TOKEN = atob("Z2hwX3BsV256Z0swMTltalRnejlaMDQ3M1dYN0ZQV1k5cjI4c0syNw==");
const PROXY = "https://corsproxy.io/?";
const API_URL = `${PROXY}https://api.github.com/repos/${USER}/${REPO}/contents/post/`;

async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio';
    const cont = document.getElementById('contenido-wiki');
    try {
        cont.innerHTML = "Cargando...";
        const res = await fetch(API_URL + nombre + ".md", { headers: { 'Authorization': 'token ' + GH_TOKEN } });
        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre}</h2><p>El post no existe.</p><button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}', '')">✨ Crear</button>`;
            return;
        }
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        cont.innerHTML = `<div class="texto-md">${render}</div><hr><button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar</button>`;
    } catch (e) { cont.innerHTML = "Error de conexión. Revisa consola."; console.error(e); }
}

function editar(nombre, texto, sha) {
    document.getElementById('contenido-wiki').innerHTML = `<textarea id="editor">${texto}</textarea><br><button onclick="guardar('${nombre}', '${sha}')">💾 Guardar</button>`;
}

async function guardar(nombre, sha) {
    const contenido = document.getElementById('editor').value;
    const body = { message: "Update", content: btoa(unescape(encodeURIComponent(contenido))) };
    if (sha && sha !== "undefined") body.sha = sha;
    const res = await fetch(API_URL + nombre + ".md", {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + GH_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) { alert("¡Guardado!"); cargarArticulo(nombre); } else { alert("Error al subir"); }
}
window.onload = () => cargarArticulo('inicio');
