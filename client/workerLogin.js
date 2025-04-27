const API = 'http://localhost:3001/'

self.onmessage = async function (event) {
    const url = API + 'login'
    const form = event.data;

    console.log(form);

    const headers = new Headers({
        "Content-Type": 'application/json'
    })

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(form)
        });
        const data = await response.json();

        console.log(data)

        if(!response.ok) {
            if(response.status === 404)
                self.postMessage({error: 'Username o Correo o Contraseña invalidos'});
            else self.postMessage({error: 'Error del Servidor'});

            return;
        }

        self.postMessage(data)
    } catch(error) {
        self.postMessage({error: "Error en realizar la peticion"});
    }
}