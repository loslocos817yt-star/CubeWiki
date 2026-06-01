const USER = "loslocos817yt-star";
const REPO = "CubeWiki";

// Token en Binario
const BIN_TOKEN = "01100111 01101000 01110000 01011111 01110010 01001011 00110101 01010111 01011010 01111001 01001111 01001011 01000110 01001101 01110110 01010011 01100101 01000100 01010001 00110011 01010000 01100100 01101100 01010110 01000001 01101100 01011010 01000001 00111001 01111001 01100100 01001100 01000111 01111010 00110010 01111001 00111001 01000100 00110001 01100001";

function decodificarBinario(bin) {
    return bin.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
}

const GH_TOKEN = decodificarBinario(BIN_TOKEN);
const API_BASE = "https://api.github.com/repos/" + USER + "/" + REPO + "/contents/post/";

// Mapeo exacto
const puzzleMap = {
    "square-1": "square1",
    "face-turning octahedron": "fto",
    "melinda's 2x2x2x2": "melindas2x2x2x2",
    "2x2x2 cube": "2x2x2",
    "3x3x3 cube": "3x3x3",
    "4x4x4 cube": "4x4x4",
    "5x5x5 cube": "5x5x5",
    "6x6x6 cube": "6x6x6",
    "7x7x7 cube": "7x7x7",
    "redi cube": "redi_cube",
    "master tetraminx": "master_tetraminx",
    "baby fto": "baby_fto",
    "triquad": "triquad",
    "loopover": "loopover"
};

function normalizarCubo(nombre) {
    let n = nombre.toLowerCase().trim();
    return puzzleMap[n] || n.replace(/\s+/g, '_');
}

// =======================================================
// LÓGICA DE ARTÍCULOS PRINCIPALES
// =======================================================

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
            .replace(/\[([^\]]+)\]\s*=\s*([a-zA-Z0-9\s\-\'xX]+)/g, (match, alg, puzzleRaw) => {
                let puzzleNameDisplay = puzzleRaw.trim();
                let puzzleId = normalizarCubo(puzzleNameDisplay);
                return `<div class="player-container"><p><strong>Cubo:</strong> ${puzzleNameDisplay}</p><twisty-player alg="${alg}" puzzle="${puzzleId}" control-panel="bottom"></twisty-player></div>`;
            });

        const render = marked.parse(procesado);
        cont.innerHTML = `<div class="texto-md">${render}</div><hr><button id="btn-editar-art">✏️ Editar</button>`;
        
        // Asignación segura del evento para evitar errores con comillas en el contenido
        document.getElementById('btn-editar-art').onclick = () => editar(nombre, content, data.sha);
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

// =======================================================
// SECCIÓN DE DEBATES (TODO EL CONTENIDO DIRECTO EN PANTALLA)
// =======================================================

async function listarDebates() {
    const cont = document.getElementById('contenido-wiki');
    
    // Mostramos la cabecera y preparamos el contenedor del muro
    cont.innerHTML = `
        <h2>🗣️ Debates</h2>
        <button onclick="editarDebate('', '# Nuevo Debate', '')" style="margin-bottom: 20px;">✨ Crear Nuevo Debate</button>
        <div id="muro-debates"><h3>Extrayendo contenido de todos los debates... ⏳</h3></div>
    `;

    try {
        const res = await fetch(API_BASE + "Debate", {
            headers: { 'Authorization': 'token ' + GH_TOKEN }
        });
        
        if (!res.ok) {
            document.getElementById('muro-debates').innerHTML = "<p>Aún no hay debates o la carpeta no existe.</p>";
            return;
        }

        const archivos = await res.json();
        const archivosMd = archivos.filter(f => f.name.endsWith('.md'));

        if (archivosMd.length === 0) {
            document.getElementById('muro-debates').innerHTML = "<p>No hay debates todavía.</p>";
            return;
        }

        // Descargar EL CONTENIDO de todos los archivos MD al mismo tiempo (mucho más rápido)
        const promesas = archivosMd.map(async f => {
            const nombre = f.name.replace('.md', '');
            const urlSegura = API_BASE + "Debate/" + encodeURIComponent(f.name);
            const resObj = await fetch(urlSegura, { headers: { 'Authorization': 'token ' + GH_TOKEN } });
            const dataObj = await resObj.json();
            const content = decodeURIComponent(escape(atob(dataObj.content)));
            
            let procesado = content
                .replace(/(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/gi, '<img src="$1" style="max-width:100%; border-radius:8px;">')
                .replace(/\[([^\]]+)\]\s*=\s*([a-zA-Z0-9\s\-\'xX]+)/g, (match, alg, puzzleRaw) => {
                    let puzzleNameDisplay = puzzleRaw.trim();
                    let puzzleId = normalizarCubo(puzzleNameDisplay);
                    return `<div class="player-container"><p><strong>Cubo:</strong> ${puzzleNameDisplay}</p><twisty-player alg="${alg}" puzzle="${puzzleId}" control-panel="bottom"></twisty-player></div>`;
                });

            const render = marked.parse(procesado);
            return { nombre, content, sha: dataObj.sha, render };
        });

        // Esperamos a que todos bajen su contenido
        const debatesCompletos = await Promise.all(promesas);
        const muro = document.getElementById('muro-debates');
        muro.innerHTML = ""; // Limpiar el texto de "Cargando..."

        // Por cada debate descargado, creamos su caja en el muro
        debatesCompletos.forEach(debate => {
            const divDebate = document.createElement('div');
            divDebate.style = "background:#222; padding:15px; margin-bottom:20px; border-radius:8px; border: 1px solid #444;";
            
            // Aquí inyectamos el título y EL PUTO CONTENIDO ya procesado
            divDebate.innerHTML = `
                <h3 style="margin-top:0;">🔥 ${debate.nombre}</h3>
                <div class="texto-md" style="margin-bottom:15px;">${debate.render}</div>
                <hr style="border-color:#444;">
            `;

            const btnEditar = document.createElement('button');
            btnEditar.innerText = "✏️ Editar este Debate";
            // Lo asignamos por JS puro, así si el texto tiene comillas no se rompe el código
            btnEditar.onclick = () => editarDebate(debate.nombre, debate.content, debate.sha);
            
            divDebate.appendChild(btnEditar);
            muro.appendChild(divDebate);
        });

    } catch(e) {
        document.getElementById('muro-debates').innerHTML = "<p>Error al cargar el contenido de los debates.</p>";
        console.error(e);
    }
}

// Ya no necesitas 'cargarDebate' individual porque 'listarDebates' ya abre TODO de golpe.
// Así que pasamos directamente al editor.

function editarDebate(nombreActual, texto, sha) {
    let inputNombre = sha 
        ? `<input type="hidden" id="nombre-debate" value="${nombreActual}"><h3>Editando Debate: ${nombreActual}</h3>` 
        : `<h3>Nuevo Debate</h3><input type="text" id="nombre-debate" value="${nombreActual}" placeholder="Nombre del archivo (sin .md)" style="width:100%; padding:8px; margin-bottom:10px; background:#333; color:#fff; border:none; border-radius:5px;">`;

    document.getElementById('contenido-wiki').innerHTML = `
        ${inputNombre}
        <textarea id="editor" style="width:100%; height:300px; background:#333; color:#fff; border:none; padding:10px;">${texto}</textarea>
        <div style="margin-top:10px;">
            <button onclick="guardarDebate('${sha}')">💾 Guardar Debate</button>
            <button onclick="listarDebates()" style="margin-left:10px;">❌ Cancelar</button>
        </div>
    `;
}

async function guardarDebate(sha) {
    const nombre = document.getElementById('nombre-debate').value.trim();
    if (!nombre) return alert("Ponle un nombre al debate, güey.");

    const contenido = document.getElementById('editor').value;
    const body = { 
        message: "Update debate " + nombre, 
        content: btoa(unescape(encodeURIComponent(contenido))) 
    };
    if (sha) body.sha = sha;

    // Codificamos el nombre por si le metes espacios
    const urlSegura = API_BASE + "Debate/" + encodeURIComponent(nombre) + ".md";

    const res = await fetch(urlSegura, {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + GH_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.ok) { 
        alert("¡Guardado!"); 
        listarDebates(); // Recargamos el muro
    } else { 
        alert("Error al subir el debate."); 
    }
}
