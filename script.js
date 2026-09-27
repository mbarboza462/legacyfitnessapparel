/* =========================================================
LEGACY FITNESS APPAREL
script.js

1. Carrossel da página inicial (preservado)
2. Carrinho de compras (localStorage)
3. Contador do menu
4. Página do carrinho + finalização via WhatsApp
========================================================= */


/* =========================================================
1. CARROSSEL DA HOME
========================================================= */

const imagens = [

    "camisa 2.jpeg",
    "camisa tradicional off.jpeg",
    "camisa tradicional preto.jpeg"

];

let atual = 0;

const heroImage = document.getElementById("hero-shirt");

if (heroImage) {

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

}


/* =========================================================
2. CARRINHO — NÚCLEO
========================================================= */

const LEGACY_CARRINHO_KEY = "legacy_carrinho";

const LEGACY_WHATSAPP = "5571986201642";

const LEGACY_TAMANHOS = ["P", "M", "G", "GG"];


/* Lê o carrinho do localStorage de forma segura */

function lerCarrinho() {

    try {

        const bruto = localStorage.getItem(LEGACY_CARRINHO_KEY);

        if (!bruto) {
            return [];
        }

        const dados = JSON.parse(bruto);

        if (!Array.isArray(dados)) {
            return [];
        }

        return dados.filter(item =>
            item &&
            typeof item.nome === "string" &&
            typeof item.tamanho === "string"
        ).map(item => ({
            nome: item.nome,
            tamanho: item.tamanho,
            imagem: typeof item.imagem === "string" ? item.imagem : "",
            pagina: typeof item.pagina === "string" ? item.pagina : "",
            quantidade: Number(item.quantidade) > 0 ? Math.floor(Number(item.quantidade)) : 1
        }));

    } catch (erro) {

        return [];

    }

}


/* Grava o carrinho no localStorage */

function salvarCarrinho(itens) {

    try {

        localStorage.setItem(
            LEGACY_CARRINHO_KEY,
            JSON.stringify(itens)
        );

    } catch (erro) {

        /* Armazenamento indisponível (modo privado, por exemplo) */

    }

    atualizarContador();

}


/* Total de peças */

function totalPecas() {

    return lerCarrinho().reduce(
        (soma, item) => soma + item.quantidade,
        0
    );

}


/* Adiciona um produto ao carrinho */

function adicionarAoCarrinho(produto) {

    const itens = lerCarrinho();

    const existente = itens.find(item =>
        item.nome === produto.nome &&
        item.tamanho === produto.tamanho
    );

    if (existente) {

        existente.quantidade += 1;

    } else {

        itens.push({
            nome: produto.nome,
            tamanho: produto.tamanho,
            imagem: produto.imagem || "",
            pagina: produto.pagina || "",
            quantidade: 1
        });

    }

    salvarCarrinho(itens);

}


/* Remove uma linha inteira do carrinho */

function removerDoCarrinho(indice) {

    const itens = lerCarrinho();

    if (indice < 0 || indice >= itens.length) {
        return;
    }

    itens.splice(indice, 1);

    salvarCarrinho(itens);

}


/* Altera a quantidade de uma linha */

function alterarQuantidade(indice, variacao) {

    const itens = lerCarrinho();

    if (indice < 0 || indice >= itens.length) {
        return;
    }

    itens[indice].quantidade += variacao;

    if (itens[indice].quantidade < 1) {
        itens.splice(indice, 1);
    }

    salvarCarrinho(itens);

}


/* Esvazia o carrinho */

function limparCarrinho() {

    salvarCarrinho([]);

}


/* =========================================================
3. CONTADOR DO MENU
========================================================= */

function atualizarContador() {

    const total = totalPecas();

    document.querySelectorAll("[data-cart-count]").forEach(alvo => {

        alvo.textContent = total;

    });

    document.querySelectorAll(".nav-carrinho").forEach(link => {

        link.classList.toggle("tem-itens", total > 0);

    });

}


/* Mantém o contador sincronizado entre abas */

window.addEventListener("storage", evento => {

    if (evento.key === LEGACY_CARRINHO_KEY) {

        atualizarContador();

        if (document.getElementById("carrinho-conteudo")) {
            renderizarCarrinho();
        }

    }

});


/* =========================================================
4. AVISO VISUAL (TOAST)
========================================================= */

let avisoTimer = null;

function mostrarAviso(mensagem, tipo) {

    let aviso = document.getElementById("legacy-toast");

    if (!aviso) {

        aviso = document.createElement("div");

        aviso.id = "legacy-toast";

        aviso.className = "legacy-toast";

        aviso.setAttribute("role", "status");

        aviso.setAttribute("aria-live", "polite");

        document.body.appendChild(aviso);

    }

    aviso.textContent = mensagem;

    aviso.classList.toggle("erro", tipo === "erro");

    /* Reinicia a animação */

    aviso.classList.remove("visivel");

    void aviso.offsetWidth;

    aviso.classList.add("visivel");

    clearTimeout(avisoTimer);

    avisoTimer = setTimeout(() => {

        aviso.classList.remove("visivel");

    }, 2800);

}


/* =========================================================
5. PÁGINAS DE PRODUTO
========================================================= */

function iniciarPaginaProduto() {

    const bloco = document.querySelector("[data-produto]");

    if (!bloco) {
        return;
    }

    const nome = bloco.getAttribute("data-produto");

    const imagem = bloco.getAttribute("data-imagem") || "";

    const pagina = bloco.getAttribute("data-pagina") || "";

    const botoesTamanho = bloco.querySelectorAll(".tamanho-btn");

    const seletor = bloco.querySelector(".tamanhos");

    const botaoAdicionar = bloco.querySelector(".btn-carrinho");

    let tamanhoEscolhido = "";

    /* Produtos de tamanho único já chegam com a opção marcada */

    const jaAtivo = bloco.querySelector(".tamanho-btn.ativo");

    if (jaAtivo) {
        tamanhoEscolhido = jaAtivo.getAttribute("data-tamanho");
    }

    botoesTamanho.forEach(botao => {

        botao.addEventListener("click", () => {

            botoesTamanho.forEach(outro => {
                outro.classList.remove("ativo");
                outro.setAttribute("aria-pressed", "false");
            });

            botao.classList.add("ativo");

            botao.setAttribute("aria-pressed", "true");

            tamanhoEscolhido = botao.getAttribute("data-tamanho");

            if (seletor) {
                seletor.classList.remove("pendente");
            }

        });

    });

    if (!botaoAdicionar) {
        return;
    }

    botaoAdicionar.addEventListener("click", evento => {

        evento.preventDefault();

        if (!tamanhoEscolhido) {

            if (seletor) {

                seletor.classList.add("pendente");

                seletor.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

            mostrarAviso("Selecione o tamanho antes de adicionar.", "erro");

            return;

        }

        adicionarAoCarrinho({
            nome: nome,
            tamanho: tamanhoEscolhido,
            imagem: imagem,
            pagina: pagina
        });

        botaoAdicionar.classList.remove("confirmado");

        void botaoAdicionar.offsetWidth;

        botaoAdicionar.classList.add("confirmado");

        mostrarAviso(nome + " - " + tamanhoEscolhido + " adicionado ao carrinho.");

    });

}


/* =========================================================
6. PÁGINA DO CARRINHO
========================================================= */

function escapar(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


function renderizarCarrinho() {

    const conteudo = document.getElementById("carrinho-conteudo");

    if (!conteudo) {
        return;
    }

    const vazio = document.getElementById("carrinho-vazio");

    const resumo = document.getElementById("carrinho-resumo");

    const itens = lerCarrinho();

    if (itens.length === 0) {

        conteudo.innerHTML = "";

        if (vazio) {
            vazio.style.display = "block";
        }

        if (resumo) {
            resumo.style.display = "none";
        }

        atualizarContador();

        return;

    }

    if (vazio) {
        vazio.style.display = "none";
    }

    if (resumo) {
        resumo.style.display = "flex";
    }

    conteudo.innerHTML = itens.map((item, indice) => {

        const imagem = item.imagem
            ? '<img src="' + escapar(item.imagem) + '" alt="' + escapar(item.nome) + '">'
            : '<span class="carrinho-item-sem-imagem">LEGACY</span>';

        const nome = item.pagina
            ? '<a class="carrinho-item-nome" href="' + escapar(item.pagina) + '">' + escapar(item.nome) + '</a>'
            : '<span class="carrinho-item-nome">' + escapar(item.nome) + '</span>';

        return '' +
            '<article class="carrinho-item">' +

                '<div class="carrinho-item-imagem">' + imagem + '</div>' +

                '<div class="carrinho-item-info">' +
                    nome +
                    '<span class="carrinho-item-tamanho">Tamanho ' + escapar(item.tamanho) + '</span>' +
                '</div>' +

                '<div class="carrinho-item-qtd">' +
                    '<button type="button" class="qtd-btn" data-acao="menos" data-indice="' + indice + '" aria-label="Diminuir quantidade">−</button>' +
                    '<span class="qtd-valor">' + item.quantidade + '</span>' +
                    '<button type="button" class="qtd-btn" data-acao="mais" data-indice="' + indice + '" aria-label="Aumentar quantidade">+</button>' +
                '</div>' +

                '<button type="button" class="carrinho-remover" data-acao="remover" data-indice="' + indice + '" aria-label="Remover ' + escapar(item.nome) + '">Remover</button>' +

            '</article>';

    }).join("");

    const total = totalPecas();

    const rotuloTotal = document.getElementById("carrinho-total");

    if (rotuloTotal) {

        rotuloTotal.textContent =
            "Total: " + total + (total === 1 ? " peça" : " peças");

    }

    atualizarContador();

}


function montarMensagemWhatsApp() {

    const itens = lerCarrinho();

    if (itens.length === 0) {
        return "";
    }

    const linhas = itens.map(item => {

        const quantidade = item.quantidade > 1
            ? " (" + item.quantidade + " unidades)"
            : "";

        return "• " + item.nome + " - " + item.tamanho + quantidade;

    });

    const total = totalPecas();

    const mensagem =
        "Olá!\n" +
        "Tenho interesse nos seguintes produtos:\n\n" +
        linhas.join("\n") + "\n\n" +
        "Total de peças: " + total + "\n\n" +
        "Gostaria de verificar disponibilidade.";

    return mensagem;

}


function iniciarPaginaCarrinho() {

    const conteudo = document.getElementById("carrinho-conteudo");

    if (!conteudo) {
        return;
    }

    renderizarCarrinho();

    /* Ações dentro da lista (delegação de eventos) */

    conteudo.addEventListener("click", evento => {

        const botao = evento.target.closest("[data-acao]");

        if (!botao) {
            return;
        }

        const indice = Number(botao.getAttribute("data-indice"));

        const acao = botao.getAttribute("data-acao");

        if (acao === "remover") {

            removerDoCarrinho(indice);

            mostrarAviso("Item removido do carrinho.");

        } else if (acao === "mais") {

            alterarQuantidade(indice, 1);

        } else if (acao === "menos") {

            alterarQuantidade(indice, -1);

        }

        renderizarCarrinho();

    });

    /* Limpar carrinho */

    const botaoLimpar = document.getElementById("carrinho-limpar");

    if (botaoLimpar) {

        botaoLimpar.addEventListener("click", () => {

            if (totalPecas() === 0) {
                return;
            }

            const confirmar = window.confirm(
                "Deseja remover todos os itens do carrinho?"
            );

            if (!confirmar) {
                return;
            }

            limparCarrinho();

            renderizarCarrinho();

            mostrarAviso("Carrinho esvaziado.");

        });

    }

    /* Finalizar pedido pelo WhatsApp */

    const botaoFinalizar = document.getElementById("carrinho-finalizar");

    if (botaoFinalizar) {

        botaoFinalizar.addEventListener("click", evento => {

            evento.preventDefault();

            const mensagem = montarMensagemWhatsApp();

            if (!mensagem) {

                mostrarAviso("Seu carrinho está vazio.", "erro");

                return;

            }

            const url =
                "https://wa.me/" + LEGACY_WHATSAPP +
                "?text=" + encodeURIComponent(mensagem);

            window.open(url, "_blank");

        });

    }

}


/* =========================================================
7. MENU LATERAL (DRAWER)
========================================================= */

/* Resolve o destino de uma âncora conforme a página atual.
   Na home usa a âncora direta; nas internas aponta para o index. */

function destino(ancora) {

    return document.getElementById(ancora)
        ? "#" + ancora
        : "index.html#" + ancora;

}


function montarDrawer() {

    const nav = document.querySelector("header nav");

    if (!nav || document.getElementById("legacy-drawer")) {
        return;
    }

    /* Botão de abertura, inserido no início do menu */

    const abrir = document.createElement("button");

    abrir.type = "button";

    abrir.id = "drawer-abrir";

    abrir.className = "drawer-abrir";

    abrir.setAttribute("aria-controls", "legacy-drawer");

    abrir.setAttribute("aria-expanded", "false");

    abrir.setAttribute("aria-label", "Abrir menu");

    abrir.innerHTML = '<span class="drawer-abrir-icone" aria-hidden="true">☰</span> MENU';

    nav.insertBefore(abrir, nav.firstChild);

    /* Fundo escurecido */

    const overlay = document.createElement("div");

    overlay.id = "legacy-overlay";

    overlay.className = "drawer-overlay";

    /* Painel lateral */

    const painel = document.createElement("aside");

    painel.id = "legacy-drawer";

    painel.className = "drawer";

    painel.setAttribute("role", "dialog");

    painel.setAttribute("aria-modal", "true");

    painel.setAttribute("aria-label", "Menu de navegação");

    painel.setAttribute("aria-hidden", "true");

    painel.innerHTML = '' +

        '<div class="drawer-topo">' +

            '<span class="drawer-marca">LEGACY</span>' +

            '<button type="button" class="drawer-fechar" aria-label="Fechar menu">✕</button>' +

        '</div>' +

        '<nav class="drawer-nav">' +

            '<div class="drawer-grupo">' +

                '<span class="drawer-grupo-titulo">Coleções</span>' +

                '<a class="drawer-link" href="' + destino("colecao") + '">Drop 01</a>' +

                '<a class="drawer-link" href="' + destino("essentials") + '">Essentials</a>' +

                '<a class="drawer-link" href="' + destino("feminina") + '">Feminina</a>' +

                '<a class="drawer-link" href="' + destino("acessorios") + '">Acessórios</a>' +

            '</div>' +

            '<div class="drawer-grupo">' +

                '<a class="drawer-link drawer-link-forte" href="guia-tamanhos.html">Guia de Tamanhos</a>' +

                '<a class="drawer-link drawer-link-forte" href="' + destino("sobre") + '">Sobre a Legacy</a>' +

                '<a class="drawer-link drawer-link-forte" href="' + destino("contato") + '">Contato</a>' +

            '</div>' +

            '<div class="drawer-grupo">' +

                '<a class="drawer-link drawer-link-carrinho" href="carrinho.html">' +
                    '🛒 Carrinho <span class="carrinho-contador" data-cart-count>0</span>' +
                '</a>' +

            '</div>' +

        '</nav>' +

        '<div class="drawer-rodape">' +

            '<p>Treine. Supere. Deixe seu legado.</p>' +

        '</div>';

    document.body.appendChild(overlay);

    document.body.appendChild(painel);

    atualizarContador();

    let ultimoFoco = null;

    function abrirDrawer() {

        ultimoFoco = document.activeElement;

        painel.classList.add("aberto");

        overlay.classList.add("visivel");

        painel.setAttribute("aria-hidden", "false");

        abrir.setAttribute("aria-expanded", "true");

        document.body.classList.add("drawer-travado");

        const fechar = painel.querySelector(".drawer-fechar");

        if (fechar) {
            fechar.focus();
        }

    }

    function fecharDrawer() {

        if (!painel.classList.contains("aberto")) {
            return;
        }

        painel.classList.remove("aberto");

        overlay.classList.remove("visivel");

        painel.setAttribute("aria-hidden", "true");

        abrir.setAttribute("aria-expanded", "false");

        document.body.classList.remove("drawer-travado");

        if (ultimoFoco && typeof ultimoFoco.focus === "function") {
            ultimoFoco.focus();
        }

    }

    abrir.addEventListener("click", abrirDrawer);

    /* Fecha ao clicar fora */

    overlay.addEventListener("click", fecharDrawer);

    /* Fecha ao clicar no X */

    painel.querySelector(".drawer-fechar")
        .addEventListener("click", fecharDrawer);

    /* Fecha ao escolher um item */

    painel.querySelectorAll("a.drawer-link").forEach(link => {

        link.addEventListener("click", () => {

            /* Aguarda o salto da âncora antes de fechar */

            setTimeout(fecharDrawer, 120);

        });

    });

    /* Fecha com a tecla Esc */

    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {
            fecharDrawer();
        }

    });

    /* Mantém o foco dentro do painel enquanto aberto */

    painel.addEventListener("keydown", evento => {

        if (evento.key !== "Tab") {
            return;
        }

        const focaveis = painel.querySelectorAll("a[href], button");

        if (focaveis.length === 0) {
            return;
        }

        const primeiro = focaveis[0];

        const ultimo = focaveis[focaveis.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {

            evento.preventDefault();

            ultimo.focus();

        } else if (!evento.shiftKey && document.activeElement === ultimo) {

            evento.preventDefault();

            primeiro.focus();

        }

    });

}


/* =========================================================
8. INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    montarDrawer();

    atualizarContador();

    iniciarPaginaProduto();

    iniciarPaginaCarrinho();

});
