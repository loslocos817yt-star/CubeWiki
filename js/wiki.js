const USER = "loslocos817yt-star";
const REPO = "CubeWiki";

// Token en Binario
const BIN_TOKEN = "01100111 01101000 01110000 01011111 01110010 01001011 00110101 01010111 01011010 01111001 01001111 01001011 01000110 01001101 01110110 01010011 01100101 01000100 01010001 00110011 01010000 01100100 01101100 01010110 01000001 01101100 01011010 01000001 00111001 01111001 01100100 01001100 01000111 01111010 00110010 01111001 00111001 01000100 00110001 01100001";

function decodificarBinario(bin) {
    return bin.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
}

const GH_TOKEN = decodificarBinario(BIN_TOKEN);
const API_BASE = "https://api.github.com/repos/" + USER + "/" + REPO + "/contents/post/";

async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio';
    const cont = document.getElementById('contenido-wiki');
    cont.innerHTML = "Cargando...";

    try {
        const res = await fetch(API_BASE + nombre + ".md", {
            headers: { 'Authorization': 'token ' + GH_TOKEN, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre.toUpperCase()}</h2><p>El post no existe.</p><button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}', '')">✨ Crear</button>`;
            return;
        }

        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content)));

        let procesado = content
            .replace(/(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/gi, '<img src="$1" style="max-width:100%; border-radius:8px;">')
            .replace(/\[([^\]]+)\]/g, '<div class="player-container"><twisty-player alg="$1" control-panel="bottom"></twisty-player></div>');

        const render = marked.parse(procesado);
        cont.innerHTML = `<div class="texto-md">${render}</div><hr><button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar</button>`;
    } catch (e) { 
        cont.innerHTML = "Error al cargar."; 
        console.error(e); 
    }
}

function editar(nombre, texto, sha) {
    document.getElementById('contenido-wiki').innerHTML = `
        <h3>Editor de ${nombre.toUpperCase()}</h3>
        <textarea id="editor" style="width:100%; height:300px; background:#333; color:#fff; border:none; padding:10px;">${texto}</textarea>
        <button onclick="guardar('${nombre}', '${sha}')">💾 Guardar</button>
    `;
}

async function guardar(nombre, sha) {
    const contenido = document.getElementById('editor').value;
    const body = { 
        message: "Update " + nombre, 
        content: btoa(unescape(encodeURIComponent(contenido))) 
    };
    if (sha) body.sha = sha;

    const res = await fetch(API_BASE + nombre + ".md", {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + GH_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.ok) { alert("¡Guardado!"); cargarArticulo(nombre); } 
    else { alert("Error al subir."); }
}

window.onload = () => cargarArticulo('inicio');
