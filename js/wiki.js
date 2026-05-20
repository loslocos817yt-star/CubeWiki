const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            
const GH_TOKEN = atob("Z2hwX2NwUWVwWXdUZU1EbEZBSlk5MVhldU9uSUVzMHQxWjNhRFRDaQ==");

async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio';
    const cont = document.getElementById('contenido-wiki');
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`;

    try {
        cont.innerHTML = "Cargando...";
        // QUITAMOS 'Cache-Control' y dejamos solo lo básico para evitar el bloqueo CORS
        const res = await fetch(url, { 
            headers: { 
                'Authorization': `token ${GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            } 
        });
        
        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre}</h2><p>El post no existe.</p>
            <button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}', '')">✨ Crear</button>`;
            return;
        }
        
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        
        cont.innerHTML = `<div class="texto-md">${render}</div>
        <hr><button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar</button>`;
        
    } catch (e) { 
        cont.innerHTML = "Error crítico de conexión: " + e.message;
    }
}

function editar(nombre, texto, sha) {
    document.getElementById('contenido-wiki').innerHTML = `
        <h3>Editando: ${nombre}</h3>
        <textarea id="editor">${texto}</textarea><br>
        <button onclick="guardar('${nombre}', '${sha}')">💾 Guardar</button>
        <button onclick="cargarArticulo('${nombre}')">Cancelar</button>`;
}

async function guardar(nombre, sha) {
    const contenido = document.getElementById('editor').value;
    const contentEncoded = btoa(unescape(encodeURIComponent(contenido)));
    
    const body = { message: "Update " + nombre, content: contentEncoded };
    if (sha && sha !== "undefined") body.sha = sha;

    // Igual aquí, quitamos cabeceras innecesarias para evitar CORS
    const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`, {
        method: 'PUT',
        headers: { 
            'Authorization': `token ${GH_TOKEN}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
    });
    
    if (res.ok) { 
        alert("¡Guardado!"); 
        cargarArticulo(nombre); 
    } else { 
        const err = await res.json();
        alert("Error al subir: " + err.message); 
    }
}

window.onload = () => cargarArticulo('inicio');
