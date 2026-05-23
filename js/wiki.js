const USER = "loslocos817yt-star";
const REPO = "CubeWiki";
const GH_TOKEN = "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"; 
const API_BASE = "https://api.github.com/repos/" + USER + "/" + REPO + "/contents/post/";

async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio';
    const cont = document.getElementById('contenido-wiki');
    cont.innerHTML = "Cargando...";

    try {
        const res = await fetch(API_BASE + nombre + ".md", {
            headers: { 
                'Authorization': 'token ' + GH_TOKEN,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre.toUpperCase()}</h2><p>El post no existe.</p><button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}', '')">✨ Crear</button>`;
            return;
        }

        const data = await res.json();
        const content = decodeURIComponent(atob(data.content).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        // Procesamiento: 
        // 1. Links a imágenes -> <img>
        // 2. Algoritmos en [alg] -> <twisty-player>
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
        <p><small>Para poner un cubo, escribe el algoritmo entre corchetes, ej: [R U R' U']</small></p>
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
        headers: { 
            'Authorization': 'token ' + GH_TOKEN, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
    });

    if (res.ok) { 
        alert("¡Guardado!"); 
        cargarArticulo(nombre); 
    } else { 
        alert("Error al subir."); 
    }
}

window.onload = () => cargarArticulo('inicio');
