const axios = require("axios");
RestartDynos = () => {
    console.log("EMPEZANDO A REINICIAR APP");
    axios({
            url: "https://api.heroku.com/apps/pepehunter/dynos",
            method: 'delete',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/vnd.heroku+json; version=3",
                "Authorization": "Bearer 0f7aa113-c83a-447d-811c-9665db4edd60"
            }
        })
        .then(res => {
            console.log(`reiniciado con exito: ${res.data}`)
        }).catch(err => console.log("algo salio mal...", err));
}

setInterval(RestartDynos, 4 * 60 * 60 * 1000);