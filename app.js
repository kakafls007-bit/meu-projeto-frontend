// Troque essa URL pela URL pública do backend depois do deploy no Render,
// ex: "https://seu-backend.onrender.com/skins"
const API_URL = "http://localhost:3000/skins";

const formulario = document.querySelector("#form-skin");
const campoId = document.querySelector("#skin-id");
const campoNome = document.querySelector("#nome");
const campoBrawler = document.querySelector("#brawler");
const campoRaridade = document.querySelector("#raridade");
const campoPreco = document.querySelector("#preco");
const campoImagemUrl = document.querySelector("#imagemUrl");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaSkins = document.querySelector("#lista-skins");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function classeRaridade(raridade) {
  const mapa = {
    "Rara": "rara",
    "Super Rara": "super-rara",
    "Épica": "epica",
    "Mítica": "mitica",
    "Lendária": "lendaria",
    "Cromada": "cromada"
  };
  return mapa[raridade] || "rara";
}

function criarCartaoSkin(skin) {
  const cartao = document.createElement("article");
  cartao.className = "skin";

  if (skin.imagemUrl) {
    const imagem = document.createElement("img");
    imagem.src = skin.imagemUrl;
    imagem.alt = skin.nome;
    imagem.className = "skin-imagem";
    cartao.append(imagem);
  }

  const nome = document.createElement("h3");
  nome.textContent = skin.nome;

  const brawler = document.createElement("p");
  brawler.textContent = `Brawler: ${skin.brawler}`;

  const raridade = document.createElement("span");
  raridade.className = `etiqueta-raridade ${classeRaridade(skin.raridade)}`;
  raridade.textContent = skin.raridade;

  const preco = document.createElement("p");
  preco.textContent = `Preço: ${skin.preco != null ? `${skin.preco} gemas` : "Não informado"}`;

  const id = document.createElement("p");
  id.className = "skin-id";
  id.textContent = `ID: ${skin._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-skin";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarSkinParaEdicao(skin._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirSkin(skin._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(nome, raridade, brawler, preco, id, acoes);

  return cartao;
}

function exibirSkins(skins) {
  listaSkins.innerHTML = "";

  if (skins.length === 0) {
    mostrarMensagem("Nenhuma skin cadastrada");
    return;
  }

  skins.forEach((skin) => {
    listaSkins.appendChild(criarCartaoSkin(skin));
  });

  mostrarMensagem(`${skins.length} skin(s) encontrada(s)`);
}

async function listarSkins() {
  try {
    mostrarMensagem("Carregando skins...");
    const skins = await fazerRequisicao(API_URL);
    exibirSkins(skins);
  } catch (erro) {
    listaSkins.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function buscarSkinPorId(id) {
  const skin = await fazerRequisicao(`${API_URL}/${id}`);
  exibirSkins([skin]);
  return skin;
}

async function salvarSkin(evento) {
  evento.preventDefault();

  const skin = {
    nome: campoNome.value.trim(),
    brawler: campoBrawler.value.trim(),
    raridade: campoRaridade.value
  };

  if (campoPreco.value !== "") {
    skin.preco = Number(campoPreco.value);
  }

  if (campoImagemUrl.value.trim() !== "") {
    skin.imagemUrl = campoImagemUrl.value.trim();
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? "PUT" : "POST";

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skin)
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? "Skin atualizada" : "Skin cadastrada");
    await listarSkins();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarSkinParaEdicao(id) {
  try {
    const skin = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = skin._id;
    campoNome.value = skin.nome;
    campoBrawler.value = skin.brawler;
    campoRaridade.value = skin.raridade;
    campoPreco.value = skin.preco ?? "";
    campoImagemUrl.value = skin.imagemUrl ?? "";
    tituloFormulario.textContent = "Editar skin";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoNome.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirSkin(id) {
  const confirmou = window.confirm("Deseja excluir esta skin?");

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    mostrarMensagem("Skin excluída");
    await listarSkins();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Nova skin";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarSkin);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarSkins);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarSkins();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    await buscarSkinPorId(id);
  } catch (erro) {
    listaSkins.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarSkins();
