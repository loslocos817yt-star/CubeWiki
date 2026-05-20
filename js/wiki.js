const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            
const GH_TOKEN = atob("Z2hwX2NwUWVwWXdUZU1EbEZBSlk5MVhldU9uSUVzMHQxWjNhRFRDaQ==");

async function cargarArticulo(nombre) {
    if(!nombre) return;
    const cont = document.getElementById('contenido-wiki');
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`;

    try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${GH_TOKEN}` } });
        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre}</h2><p>No existe aún.</p><button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}\\n\\nContenido aquí...', '')">✨ Crear este post</button>`;
            return;
        }
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        
        cont.innerHTML = `<div class="texto-md">${render}</div>
        <button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar post</button>`;
    } catch (e) { cont.innerHTML = "Error de conexión."; }
}

function editar(nombre, texto, sha) {
    document.getElementById('contenido-wiki').innerHTML = `
        <textarea id="editor">${texto}</textarea>
        <button onclick="guardar('${nombre}', '${sha}')">💾 Guardar</button>`;
}

async function guardar(nombre, sha) {
    const content = btoa(unescape(encodeURIComponent(document.getElementById('editor').value)));
    const body = { message: "Update", content: content };
    if (sha && sha !== "undefined") body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${GH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) { alert("¡Guardado!"); cargarArticulo(nombre); } else { alert("Error al subir"); }
}

window.onload = () => cargarArticulo('inicio');
