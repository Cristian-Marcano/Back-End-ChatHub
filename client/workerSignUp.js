const API = 'http://localhost:3001/'

self.onmessage = async function (event) {
    const url = API + 'signup';
    const form = event.data;

    const headers = new Headers({
        "Content-Type": 'application/json'
    });

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if(!response.ok) {
            if(response.status === 404)
                self.postMessage({error: (data.message === 'Username alredy exists') ? 'El username ya existe': 'El email ya existe'});
            else self.postMessage({error: 'Error del Servidor'});

            return;
        }

        self.postMessage({message: 'Codigo enviado al email'});
    } catch(error) {
        self.postMessage({error: "Error en realizar la peticion"});
    }
}
