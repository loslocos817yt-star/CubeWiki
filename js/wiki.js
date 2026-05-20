const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            
const GH_TOKEN = atob("Z2hwX2NwUWVwWXdUZU1EbEZBSlk5MVhldU9uSUVzMHQxWjNhRFRDaQ==");

async function cargarArticulo(nombre) {
    if(!nombre) return;
    const cont = document.getElementById('contenido-wiki');
    // Mantenemos 'post/' como querías
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombre}.md`;

    try {
        // Añadimos 'Accept' para asegurar que GitHub nos devuelva el JSON correctamente
        const res = await fetch(url, { 
            headers: { 
                'Authorization': `Bearer ${GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            } 
        });
        
        if (res.status === 404) {
            cont.innerHTML = `<h2>${nombre}</h2><p>No existe aún.</p><button onclick="editar('${nombre}', '# ${nombre.toUpperCase()}\\n\\nContenido aquí...', '')">✨ Crear este post</button>`;
            return;
        }
        
        const data = await res.json();
        // Limpieza de base64 más robusta
        const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const render = marked.parse(content.replace(/([RULDFB]['2]?)/g, '<span class="alg">$&</span>'));
        
        cont.innerHTML = `<div class="texto-md">${render}</div>
        <button onclick="editar('${nombre}', \`${content.replace(/`/g, '\\`')}\`, '${data.sha}')">✏️ Editar post</button>`;
    } catch (e) { 
        console.error("Error:", e);
        cont.innerHTML = "Error al conectar con la Wiki. Revisa la consola."; 
    }
}

// ... (la función editar y guardar se quedan igual, solo asegúrate de que usen 'post/')
