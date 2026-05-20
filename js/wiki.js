const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            
const GH_TOKEN = atob("Z2hwX2NwUWVwWXdUZU1EbEZBSlk5MVhldU9uSUVzMHQxWjNhRFRDaQ==");

async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio';
    const cont = document.getElementById('contenido-wiki');
    // Ruta explícita: la carpeta 'post' debe existir en la raíz
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`;

    try {
        cont.innerHTML = "Conectando con GitHub...";
        const res = await fetch(url, { 
            headers: { 
                'Authorization': `token ${GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache'
            } 
        });
        
        // Si el servidor responde algo distinto a 200 OK
        if (!res.ok) {
            if (res.status === 404) {
                cont.innerHTML = `<h2>${nombre}</h2><p>El archivo no se encuentra en /post/.</p>
                <button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}', '')">✨ Crear este post</button>`;
            } else {
                const errorData = await res.json();
                cont.innerHTML = `❌ Error ${res.status}: ${errorData.message || 'Error desconocido'}`;
            }
            return;
        }
        
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        
        cont.innerHTML = `<div class="texto-md">${render}</div>
        <hr><button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar post</button>`;
        
    } catch (e) { 
        cont.innerHTML = "❌ Error crítico: " + e.message + ". ¿Tienes conexión a internet?";
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
    
    const body = { 
        message: "Update " + nombre, 
        content: contentEncoded 
    };
    if (sha && sha !== "undefined") body.sha = sha;

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
