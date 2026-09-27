const imagens = [

    "camisa 1.jpeg",
    "camisa 2.jpeg",
    "camisa 3.jpeg",
    "camisa 4.jpeg",
    "camisa 5.jpeg",
    "camisa tradicional off.jpeg",
    "camisa tradicional preto.jpeg"

];

let atual = 0;

const heroImage = document.getElementById("hero-shirt");

setInterval(() => {

    heroImage.style.opacity = "0";

    setTimeout(() => {

        atual++;

        if (atual >= imagens.length) {
            atual = 0;
        }

        heroImage.src = imagens[atual];

        heroImage.style.opacity = "1";

    }, 300);

}, 4000);
