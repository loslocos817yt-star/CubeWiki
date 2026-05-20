// Configuración de tu repositorio de GitHub
const USER = "loslocos817yt-star"; 
const REPO = "CubeWiki";            

let GH_TOKEN = "";

// 1. Inicializar cargando el Token desde web/API.txt
async function inicializarWiki() {
    const contenedor = document.getElementById('contenido-wiki');
    try {
        const response = await fetch('web/API.txt');
        if (!response.ok) throw new Error("No se encontró web/API.txt");
        const base64Texto = await response.text();
        
        // Decodificamos el token de contrabando
        GH_TOKEN = atob(base64Texto.trim());
        
        console.log("¡Anarquía activa! API de GitHub cargada.");
        // Cargar un post inicial por defecto
        cargarArticulo('inicio');
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<h2>Error de Inicialización</h2><p>Asegúrate de haber generado web/API.txt con el token en Base64.</p>`;
    }
}

// 2. Leer un artículo directamente desde la carpeta /post de GitHub
async function cargarArticulo(nombreArticulo) {
    const contenedor = document.getElementById('contenido-wiki');
    contenedor.innerHTML = "<p>Buscando artículo en el repositorio...</p>";

    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombreArticulo}.md`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${GH_TOKEN}` }
        });

        if (response.status === 404) {
            contenedor.innerHTML = `
                <h2>El artículo "${nombreArticulo}" no existe aún</h2>
                <p>¿Quieres ser el primero en crearlo? El conocimiento debe ser libre.</p>
                <button onclick="habilitarEdicion('${nombreArticulo}', '', '')">✨ Crear Artículo</button>
            `;
            return;
        }

        const datos = await response.json();
        const markdownTexto = decodeURIComponent(escape(atob(datos.content.replace(/\s/g, ''))));
        const shaArchivo = datos.sha; 

        contenedor.innerHTML = `
            <div id="cuerpo-articulo">
                <div class="texto-md">${marked.parse(markdownTexto)}</div>
                <hr style="margin-top:20px; border: 0; border-top: 1px solid #ccc;">
                <button onclick="habilitarEdicion('${nombreArticulo}', \`${markdownTexto.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`, '${shaArchivo}')}\">✏️ Modificar este artículo libremente</button>
            </div>
        `;
    } catch (err) {
        contenedor.innerHTML = `<p>Error al conectar con la API de GitHub: ${err.message}</p>`;
    }
}

// 3. Desplegar el editor rústico en pantalla
function habilitarEdicion(nombreArticulo, contenidoActual, shaArchivo) {
    const contenedor = document.getElementById('contenido-wiki');
    contenedor.innerHTML = `
        <h2>Editando: ${nombreArticulo}.md</h2>
        <p style="font-size:0.9em; color:#666;">Escribe usando Markdown clásico. No hay reglas, eres libre.</p>
        <textarea id="editor-texto" style="width:100%; height:350px; font-family:monospace; padding:10px; box-sizing:border-box;">${contenidoActual}</textarea>
        <br><br>
        <button onclick="guardarCambios('${nombreArticulo}', '${shaArchivo}')" style="padding:10px 20px; background:#28a745; color:white; border:none; cursor:pointer;">💾 Guardar Cambios Inmediatamente</button>
        <button onclick="cargarArticulo('${nombreArticulo}')" style="padding:10px 20px; background:#dc3545; color:white; border:none; cursor:pointer; margin-left:10px;">Cancelar</button>
    `;
}

// 4. Subir o actualizar el archivo directamente al repositorio de GitHub
async function guardarCambios(nombreArticulo, shaArchivo) {
    const nuevoContenido = document.getElementById('editor-texto').value;
    const url = `https://api.github.com/repos/${USER}/${REPO}/contents/post/${nombreArticulo}.md`;
    
    const contenidoBase64 = btoa(unescape(encodeURIComponent(nuevoContenido)));

    const bodyData = {
        message: `Comunidad wiki: actualización libre de ${nombreArticulo}.md`,
        content: contenidoBase64
    };

    if (shaArchivo && shaArchivo !== "") {
        bodyData.sha = shaArchivo;
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            alert("¡Hecho! Los cambios ya están impactados en el repositorio.");
            cargarArticulo(nombreArticulo);
        } else {
            const errDatos = await response.json();
            alert(`Error de GitHub: ${errDatos.message}`);
        }
    } catch (err) {
        alert("Error de conexión al intentar subir los cambios.");
    }
}

window.onload = inicializarWiki;
