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
            preco: Number(item.preco) > 0 ? Number(item.preco) : 0,
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


/* Preços em reais. O valor do catálogo tem prioridade; o que
   foi gravado no item só vale para peças fora do catálogo. */

function formatarPreco(valor) {

    return "R$ " + (Math.round(valor * 100) / 100)
        .toFixed(2)
        .replace(".", ",");

}


function precoDoItem(item) {

    const doCatalogo = CATALOGO.find(p => p.nome === item.nome) ||
        CATALOGO.find(p => !p.kit && item.pagina && p.pagina === item.pagina);

    if (doCatalogo && doCatalogo.preco) {
        return doCatalogo.preco;
    }

    return item.preco || 0;

}


/* Valor total em centavos, para evitar erro de ponto flutuante */

function totalCentavos() {

    return lerCarrinho().reduce(
        (soma, item) =>
            soma + Math.round(precoDoItem(item) * 100) * item.quantidade,
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
            preco: Number(produto.preco) > 0 ? Number(produto.preco) : 0,
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

    /* Páginas de produto têm um bloco; a home tem um por kit */

    document.querySelectorAll("[data-produto]").forEach(iniciarBlocoProduto);

}


function iniciarBlocoProduto(bloco) {

    const nome = bloco.getAttribute("data-produto");

    const preco = Number(bloco.getAttribute("data-preco")) || 0;

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
            pagina: pagina,
            preco: preco
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

        const kit = CATALOGO.find(p => p.kit && p.nome === item.nome);

        const composicao = kit
            ? '<span class="carrinho-item-composicao">' + escapar(kit.composicao) + '</span>'
            : '';

        const unitario = precoDoItem(item);

        const valores = unitario > 0
            ? '<span class="carrinho-item-preco">' + formatarPreco(unitario) + '</span>' +
              (item.quantidade > 1
                  ? '<span class="carrinho-item-subtotal">Subtotal: ' +
                    formatarPreco(unitario * item.quantidade) + '</span>'
                  : '')
            : '';

        return '' +
            '<article class="carrinho-item">' +

                '<div class="carrinho-item-imagem">' + imagem + '</div>' +

                '<div class="carrinho-item-info">' +
                    nome +
                    composicao +
                    '<span class="carrinho-item-tamanho">Tamanho ' + escapar(item.tamanho) + '</span>' +
                    valores +
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

        const centavos = totalCentavos();

        rotuloTotal.textContent =
            "Total: " + formatarPreco(centavos / 100) +
            " (" + total + (total === 1 ? " item)" : " itens)");

    }

    atualizarContador();

}


function montarMensagemWhatsApp() {

    const itens = lerCarrinho();

    if (itens.length === 0) {
        return "";
    }

    const linhas = itens.map(item => {

        const kit = CATALOGO.find(p => p.kit && p.nome === item.nome);

        const unitario = precoDoItem(item);

        const valor = unitario > 0
            ? " - " + formatarPreco(unitario * item.quantidade)
            : "";

        return item.quantidade + "x " + item.nome + valor + "\n" +
            "Tamanho: " + item.tamanho +
            (kit ? "\nInclui: " + kit.composicao : "");

    });

    const mensagem =
        "Olá! Gostaria de fazer um pedido:\n\n" +
        linhas.join("\n\n") + "\n\n" +
        "Total: " + formatarPreco(totalCentavos() / 100);

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

    const cabecalho = document.querySelector("header");

    const nav = document.querySelector("header nav");

    if (!cabecalho || !nav || document.getElementById("legacy-drawer")) {
        return;
    }

    /* Botão de abertura, à esquerda da logo no cabeçalho */

    const abrir = document.createElement("button");

    abrir.type = "button";

    abrir.id = "drawer-abrir";

    abrir.className = "drawer-abrir";

    abrir.setAttribute("aria-controls", "legacy-drawer");

    abrir.setAttribute("aria-expanded", "false");

    abrir.setAttribute("aria-label", "Abrir menu");

    abrir.innerHTML = '<span class="drawer-abrir-icone" aria-hidden="true">☰</span> MENU';

    cabecalho.insertBefore(abrir, cabecalho.firstChild);

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
8. RECOMENDADOS PARA VOCÊ
========================================================= */

/* Catálogo único do site. "oculto" marca páginas que ainda
   existem mas foram substituídas e não devem ser sugeridas. */

const CATALOGO = [

    { nome: "Berserk", pagina: "berserk.html", imagem: "camisa 1.jpeg", colecao: "drop01", preco: 89.90 },
    { nome: "Bulking", pagina: "bulking.html", imagem: "camisa 3.jpeg", colecao: "drop01", preco: 89.90 },
    { nome: "One More Rep", pagina: "onemorerep.html", imagem: "camisa 4.jpeg", colecao: "drop01", preco: 89.90 },
    { nome: "Gym Study Sleep Repeat", pagina: "gymstudy.html", imagem: "camisa 2.jpeg", colecao: "drop01", preco: 89.90 },
    { nome: "Warrior", pagina: "warrior.html", imagem: "camisa 5.jpeg", colecao: "drop01", preco: 89.90 },
    { nome: "Disciplina", pagina: "disciplina.html", imagem: "camisa disciplina.jpeg", colecao: "drop01", preco: 89.90 },

    { nome: "Essential Off White", pagina: "essential-off.html", imagem: "camisa tradicional off.jpeg", colecao: "essentials", preco: 89.90 },
    { nome: "Essential Preta", pagina: "essential-preta.html", imagem: "camisa tradicional preto.jpeg", colecao: "essentials", preco: 89.90 },

    { nome: "Strong Girls Off White", pagina: "feminina-1.html", imagem: "cropped strong girls off.jpeg", colecao: "feminina", preco: 89.90 },
    { nome: "Strong Girls Preta", pagina: "feminina-2.html", imagem: "cropped strong girls preta.jpeg", colecao: "feminina", preco: 89.90 },

    { nome: "Strap Oficial Legacy", pagina: "strap-legacy.html", imagem: "strap legacy.jpeg", colecao: "acessorios", preco: 39.90 },

    { nome: "Tradicional Off", pagina: "tradicionaloff.html", imagem: "camisa tradicional off.jpeg", colecao: "essentials", preco: 89.90, oculto: true },
    { nome: "Tradicional Preta", pagina: "tradicionalpreto.html", imagem: "camisa tradicional preto.jpeg", colecao: "essentials", preco: 89.90, oculto: true },

    /* Kits: entram no mesmo carrinho e são sugeridos de forma dirigida
       (ver escolherRecomendados), nunca no rodízio comum. */

    { nome: "Starter Legacy", pagina: "index.html#kits", imagem: "camisa 1.jpeg", colecao: "kits", preco: 119.90, kit: true, publico: "masculino", composicao: "1x Camiseta Oversized + 1x Strap Oficial Legacy" },
    { nome: "Legacy Feminine", pagina: "index.html#kits", imagem: "cropped strong girls off.jpeg", colecao: "kits", preco: 119.90, kit: true, publico: "feminino", composicao: "1x Camiseta Cropped + 1x Strap Oficial Legacy" }

];

const RECOMENDADOS_QTD = 4;

/* Ordem usada para complementar com outras coleções */

const ORDEM_COMPLEMENTO = ["essentials", "acessorios", "feminina", "drop01"];


/* Monta a lista: primeiro vizinhos da mesma coleção, depois uma
   peça de cada outra coleção, e por fim o que restar. */

function escolherRecomendados(atual) {

    const sugeriveis = CATALOGO.filter(p =>
        !p.oculto && !p.kit && p.pagina !== atual.pagina
    );

    const escolhidos = [];

    const juntar = item => {

        if (item && escolhidos.length < RECOMENDADOS_QTD &&
            !escolhidos.includes(item)) {

            escolhidos.push(item);

        }

    };

    /* Kit do mesmo público (na página do Strap, os dois kits) e o
       Strap Oficial vêm primeiro; depois uma peça da mesma coleção */

    const publico = atual.colecao === "feminina" ? "feminino" : "masculino";

    CATALOGO.filter(p =>
        p.kit && (atual.colecao === "acessorios" || p.publico === publico)
    ).forEach(juntar);

    sugeriveis.filter(p => p.colecao === "acessorios").forEach(juntar);

    const limiteMesma = escolhidos.length + 1;

    const mesma = sugeriveis.filter(p => p.colecao === atual.colecao);

    if (mesma.length > 0) {

        const todas = CATALOGO.filter(p => p.colecao === atual.colecao);

        const inicio = Math.max(0, todas.findIndex(p => p.pagina === atual.pagina));

        for (let i = 1; i <= todas.length && escolhidos.length < limiteMesma; i++) {

            const candidato = todas[(inicio + i) % todas.length];

            if (mesma.includes(candidato)) {
                juntar(candidato);
            }

        }

    }

    /* Uma peça de cada outra coleção, em rodízio */

    const outras = ORDEM_COMPLEMENTO.filter(c => c !== atual.colecao);

    const deslocamento = Math.max(0,
        CATALOGO.findIndex(p => p.pagina === atual.pagina)
    );

    let rodada = 0;

    while (escolhidos.length < RECOMENDADOS_QTD && rodada < 4) {

        let acrescentou = false;

        outras.forEach(colecao => {

            if (escolhidos.length >= RECOMENDADOS_QTD) {
                return;
            }

            const doGrupo = sugeriveis.filter(p => p.colecao === colecao);

            if (doGrupo.length === 0) {
                return;
            }

            /* O deslocamento faz cada página sugerir uma peça
               diferente das coleções vizinhas */

            let disponivel = null;

            for (let i = 0; i < doGrupo.length; i++) {

                const candidato = doGrupo[(deslocamento + rodada + i) % doGrupo.length];

                if (!escolhidos.includes(candidato)) {
                    disponivel = candidato;
                    break;
                }

            }

            if (disponivel) {
                juntar(disponivel);
                acrescentou = true;
            }

        });

        if (!acrescentou) {
            break;
        }

        rodada++;

    }

    /* Completa com qualquer peça restante */

    sugeriveis.forEach(juntar);

    return escolhidos;

}


function montarRecomendados() {

    const bloco = document.querySelector("[data-produto]");

    const detalhe = document.querySelector("section.produto-detalhe");

    if (!bloco || !detalhe || document.getElementById("recomendados")) {
        return;
    }

    const pagina = bloco.getAttribute("data-pagina");

    let atual = CATALOGO.find(p => !p.kit && p.pagina === pagina);

    if (!atual) {

        atual = {
            pagina: pagina,
            colecao: "drop01"
        };

    }

    const lista = escolherRecomendados(atual);

    if (lista.length === 0) {
        return;
    }

    const secao = document.createElement("section");

    secao.id = "recomendados";

    secao.className = "recomendados";

    secao.innerHTML = '' +

        '<div class="section-title">' +

            '<span>VOCÊ TAMBÉM PODE GOSTAR</span>' +

            '<h2>RECOMENDADOS PARA VOCÊ</h2>' +

        '</div>' +

        '<div class="recomendados-trilha">' +

            lista.map(item =>

                '<a href="' + escapar(item.pagina) + '" class="produto">' +

                    '<img src="' + escapar(item.imagem) + '" alt="' + escapar(item.nome) + '" loading="lazy">' +

                    '<div class="produto-info">' +

                        '<h3>' + escapar(item.nome) + '</h3>' +

                        '<p class="produto-preco">' + formatarPreco(item.preco) + '</p>' +

                    '</div>' +

                '</a>'

            ).join("") +

        '</div>';

    detalhe.insertAdjacentElement("afterend", secao);

}


/* =========================================================
9. INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    montarDrawer();

    atualizarContador();

    iniciarPaginaProduto();

    iniciarPaginaCarrinho();

    montarRecomendados();

});
