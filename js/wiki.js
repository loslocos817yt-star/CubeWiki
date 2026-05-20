/** * Configuración principal de Cubopedia 
 * Proyecto: Wiki de Cubos
 */
const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            
const GH_TOKEN = atob("Z2hwX2NwUWVwWXdUZU1EbEZBSlk5MVhldU9uSUVzMHQxWjNhRFRDaQ==");

/**
 * Función principal: Obtiene el markdown desde GitHub
 * @param {string} nombre - Nombre del archivo sin extensión
 */
async function cargarArticulo(nombre) {
    if(!nombre) nombre = 'inicio'; // Fallback a inicio
    const cont = document.getElementById('contenido-wiki');
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`;

    try {
        cont.innerHTML = "Cargando...";
        const res = await fetch(url, { 
            headers: { 
                'Authorization': `Bearer ${GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            } 
        });
        
        // Manejo de archivo inexistente
        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre}</h2><p>El post aún no existe.</p>
            <button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}\\n\\nContenido inicial...', '')">✨ Crear este post</button>`;
            return;
        }
        
        const data = await res.json();
        // Decodificación de contenido base64
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        
        // Renderizado con Marked.js y reemplazo de algoritmos (RULDFB)
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        
        cont.innerHTML = `<div class="texto-md">${render}</div>
        <hr><button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar post</button>`;
        
    } catch (e) { 
        console.error("Error al conectar:", e);
        cont.innerHTML = "❌ Error de conexión. Revisa que el archivo exista en la carpeta /post y que tu token sea válido."; 
    }
}

/**
 * Muestra el editor de texto
 */
function editar(nombre, texto, sha) {
    document.getElementById('contenido-wiki').innerHTML = `
        <h3>Editando: ${nombre}</h3>
        <textarea id="editor">${texto}</textarea>
        <br><br>
        <button onclick="guardar('${nombre}', '${sha}')">💾 Guardar cambios</button>
        <button onclick="cargarArticulo('${nombre}')">Cancelar</button>`;
}

/**
 * Envía el archivo de vuelta a GitHub vía PUT
 */
async function guardar(nombre, sha) {
    const contenido = document.getElementById('editor').value;
    const contentEncoded = btoa(unescape(encodeURIComponent(contenido)));
    
    const body = { 
        message: "Actualizando post: " + nombre, 
        content: contentEncoded 
    };
    if (sha) body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${GH_TOKEN}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
    });
    
    if (res.ok) { 
        alert("¡Guardado correctamente!"); 
        cargarArticulo(nombre); 
    } else { 
        const errorData = await res.json();
        alert("Error al subir: " + errorData.message); 
    }
}

// Carga inicial
window.onload = () => cargarArticulo('inicio');
        
