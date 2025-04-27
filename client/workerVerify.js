const API = 'http://localhost:3001/'

self.onmessage = async function (event) {
    const url = API + 'verify-email';
    const code = event.data;

    const headers = new Headers({
        "Content-Type": 'application/json'
    })

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(code)
        });

        const data = await response.json();

        if(!response.ok) {
            if(response.status === 404)
                self.postMessage({error: (data.message === 'Email not found') ? 'Email no encontrado': 'Codigo invalido'});
            else self.postMessage({error: 'Error del Servidor'});

            return;
        }

        self.postMessage({message: 'Usuario registrado'});
    } catch(error) {
        self.postMessage({error: "Error en realizar la peticion"});
    }
}