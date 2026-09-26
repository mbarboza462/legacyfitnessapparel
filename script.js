const imagens = [
    "camisa 1.jpeg",
    "camisa 2.jpeg",
    "camisa 3.jpeg",
    "camisa 4.jpeg"
];

let atual = 0;

const heroImage = document.getElementById("hero-shirt");

setInterval(() => {

    atual++;

    if (atual >= imagens.length) {
        atual = 0;
    }

    heroImage.src = imagens[atual];

}, 3000);
