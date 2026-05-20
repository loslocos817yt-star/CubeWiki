const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            
const GH_TOKEN = atob("Z2hwX2NwUWVwWXdUZU1EbEZBSlk5MVhldU9uSUVzMHQxWjNhRFRDaQ==");

async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio';
    const cont = document.getElementById('contenido-wiki');
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`;

    try {
        cont.innerHTML = "Cargando...";
        // Quitamos cualquier cabecera extra que pueda activar el preflight de CORS
        const res = await fetch(url, { 
            method: 'GET',
            headers: { 
                'Authorization': 'token ' + GH_TOKEN
            } 
        });
        
        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre}</h2><p>El post no existe.</p>
            <button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}', '')">✨ Crear este post</button>`;
            return;
        }
        
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        
        cont.innerHTML = `<div class="texto-md">${render}</div>
        <hr><button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar post</button>`;
    } catch (e) { 
        console.error(e);
        cont.innerHTML = "Error de conexión. Revisa la consola."; 
    }
}

function editar(nombre, texto, sha) {
    document.getElementById('contenido-wiki').innerHTML = `
        <textarea id="editor">${texto}</textarea><br>
        <button onclick="guardar('${nombre}', '${sha}')">💾 Guardar</button>`;
}

async function guardar(nombre, sha) {
    const contenido = document.getElementById('editor').value;
    const body = { 
        message: "Update", 
        content: btoa(unescape(encodeURIComponent(contenido))) 
    };
    if (sha && sha !== "undefined") body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`, {
        method: 'PUT',
        headers: { 
            'Authorization': 'token ' + GH_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    
    if (res.ok) { alert("¡Guardado!"); cargarArticulo(nombre); } 
    else { alert("Error al subir"); }
}

window.onload = () => cargarArticulo('inicio');
