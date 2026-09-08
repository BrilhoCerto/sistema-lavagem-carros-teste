import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const COLECAO_FECHAMENTOS = "imo_fechamentos";
const COLECAO_DEPOSITOS = "imo_depositos";

let fechamentos = [];
let depositos = [];


/* =========================================================
   FUNÇÃO AUXILIAR
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   DATA DE HOJE
========================================================= */

function hojeISO() {

    const data = new Date();

    const local = new Date(
        data.getTime() -
        data.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 10);
}


/* =========================================================
   FORMATAÇÃO DE DINHEIRO
========================================================= */

function dinheiro(valor) {

    return new Intl.NumberFormat("pt-PT", {

        style: "currency",

        currency: "EUR"

    }).format(Number(valor) || 0);
}


/* =========================================================
   CONVERTER NÚMERO
========================================================= */

function numero(valor) {

    const n = Number(valor);

    return Number.isFinite(n) ? n : 0;
}


/* =========================================================
   ORDENAR POR DATA
========================================================= */

function ordenarPorData(lista) {

    return [...lista].sort(

        (a, b) =>

            String(b.data || "")
                .localeCompare(
                    String(a.data || "")
                )

    );

}


/* =========================================================
   SEGURANÇA CONTRA HTML
========================================================= */

function escapeHtml(valor) {

    return String(valor ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================================
   CARREGAR DADOS DO FIREBASE
========================================================= */

async function carregarDados() {

    try {

        const [

            snapFechamentos,

            snapDepositos

        ] = await Promise.all([

            getDocs(
                collection(
                    db,
                    COLECAO_FECHAMENTOS
                )
            ),

            getDocs(
                collection(
                    db,
                    COLECAO_DEPOSITOS
                )
            )

        ]);


        fechamentos =
            snapFechamentos.docs.map(

                documento => ({

                    id: documento.id,

                    ...documento.data()

                })

            );


        depositos =
            snapDepositos.docs.map(

                documento => ({

                    id: documento.id,

                    ...documento.data()

                })

            );


        renderizarTudo();


    } catch (erro) {

        console.error(
            "Erro ao carregar IMO:",
            erro
        );

        alert(
            "Não foi possível carregar os dados do IMO."
        );

    }

}


/* =========================================================
   CALCULAR TOTAL DO FORMULÁRIO
========================================================= */

function totalFechamentoDoFormulario() {

    const total =

        numero($("dinheiro").value) +

        numero($("multibanco").value) +

        numero($("mbway").value) +

        numero($("outros").value);


    $("totalFechamento").value =
        dinheiro(total);


    return total;

}


/* =========================================================
   TOTAL DE DINHEIRO DOS FECHAMENTOS
========================================================= */

function totalDinheiroFechamentos() {

    return fechamentos.reduce(

        (soma, item) =>

            soma +
            numero(item.dinheiro),

        0

    );

}


/* =========================================================
   TOTAL DOS DEPÓSITOS
========================================================= */

function totalDepositos() {

    return depositos.reduce(

        (soma, item) =>

            soma +
            numero(item.valor),

        0

    );

}


/* =========================================================
   SALDO DE DINHEIRO
========================================================= */

function saldoDinheiro() {

    return totalDinheiroFechamentos();

}


/* =========================================================
   VALOR DISPONÍVEL PARA DEPÓSITO
========================================================= */

function disponivelParaDeposito() {

    return (

        saldoDinheiro() -

        totalDepositos()

    );

}


/* =========================================================
   RENDERIZAR RESUMO
========================================================= */

function renderizarResumo() {

    const dinheiroTotal =
        saldoDinheiro();

    const depositado =
        totalDepositos();

    const disponivel =
        disponivelParaDeposito();


    $("saldoDinheiro").textContent =
        dinheiro(dinheiroTotal);


    $("totalDepositado").textContent =
        dinheiro(depositado);


    $("totalFechamentos").textContent =
        fechamentos.length;


    $("saldoDinheiroDepositos").textContent =
        dinheiro(dinheiroTotal);


    $("totalDepositadoDepositos").textContent =
        dinheiro(depositado);


    $("disponivelDeposito").textContent =
        dinheiro(disponivel);


    $("disponivelDeposito")
        .classList
        .toggle(
            "valor-negativo",
            disponivel < 0
        );


    $("disponivelDeposito")
        .classList
        .toggle(
            "valor-positivo",
            disponivel >= 0
        );

}


/* =========================================================
   RENDERIZAR FECHAMENTOS
========================================================= */

function renderizarFechamentos() {

    const filtro =
        $("filtroFechamento").value;


    let lista =
        ordenarPorData(fechamentos);


    if (filtro) {

        lista =
            lista.filter(

                item =>
                    item.data === filtro

            );

    }


    const tbody =
        $("tabelaFechamentos");


    if (!lista.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="vazio"
                >

                    Nenhum fechamento encontrado.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =

        lista.map(item => `

            <tr>

                <td>
                    ${escapeHtml(item.data)}
                </td>

                <td>
                    ${numero(item.quantidadeCarros)}
                </td>

                <td>
                    ${dinheiro(item.dinheiro)}
                </td>

                <td>
                    ${dinheiro(item.multibanco)}
                </td>

                <td>
                    ${dinheiro(item.mbway)}
                </td>

                <td>
                    ${dinheiro(item.outros)}
                </td>

                <td>

                    <strong>
                        ${dinheiro(item.total)}
                    </strong>

                </td>

                <td>

                    <button

                        class="btn btn-sm btn-warning acao-btn"

                        data-editar-fechamento="${item.id}"

                    >

                        ✏️ Editar

                    </button>


                    <button

                        class="btn btn-sm btn-danger acao-btn"

                        data-excluir-fechamento="${item.id}"

                    >

                        🗑️ Apagar

                    </button>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   RENDERIZAR DEPÓSITOS
========================================================= */

function renderizarDepositos() {

    const tbody =
        $("tabelaDepositos");


    const lista =
        ordenarPorData(depositos);


    if (!lista.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="vazio"
                >

                    Nenhum depósito registado.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =

        lista.map(item => `

            <tr>

                <td>
                    ${escapeHtml(item.data)}
                </td>

                <td>

                    <strong>
                        ${dinheiro(item.valor)}
                    </strong>

                </td>

                <td>
                    ${escapeHtml(
                        item.observacoes || "-"
                    )}
                </td>

                <td>

                    <button

                        class="btn btn-sm btn-warning acao-btn"

                        data-editar-deposito="${item.id}"

                    >

                        ✏️ Editar

                    </button>


                    <button

                        class="btn btn-sm btn-danger acao-btn"

                        data-excluir-deposito="${item.id}"

                    >

                        🗑️ Apagar

                    </button>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   RENDERIZAR TUDO
========================================================= */

function renderizarTudo() {

    renderizarResumo();

    renderizarFechamentos();

    renderizarDepositos();

}


/* =========================================================
   LIMPAR FORMULÁRIO DE FECHAMENTO
========================================================= */

function limparFormularioFechamento() {

    $("fechamentoId").value = "";

    $("dataFechamento").value =
        hojeISO();

    $("quantidadeCarros").value = "";

    $("dinheiro").value = "0";

    $("multibanco").value = "0";

    $("mbway").value = "0";

    $("outros").value = "0";

    $("observacoesFechamento").value = "";

    $("totalFechamento").value =
        dinheiro(0);


    $("btnSalvarFechamento").textContent =
        "💾 Guardar fechamento";


    $("btnCancelarEdicao")
        .classList
        .add("d-none");

}


/* =========================================================
   EDITAR FECHAMENTO
========================================================= */

function editarFechamento(id) {

    const item =
        fechamentos.find(
            x => x.id === id
        );


    if (!item) return;


    $("fechamentoId").value =
        item.id;


    $("dataFechamento").value =
        item.data || hojeISO();


    $("quantidadeCarros").value =
        numero(
            item.quantidadeCarros
        );


    $("dinheiro").value =
        numero(item.dinheiro);


    $("multibanco").value =
        numero(item.multibanco);


    $("mbway").value =
        numero(item.mbway);


    $("outros").value =
        numero(item.outros);


    $("observacoesFechamento").value =
        item.observacoes || "";


    totalFechamentoDoFormulario();


    $("btnSalvarFechamento").textContent =
        "💾 Guardar alterações";


    $("btnCancelarEdicao")
        .classList
        .remove("d-none");


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   EDITAR DEPÓSITO
========================================================= */

function editarDeposito(id) {

    const item =
        depositos.find(
            x => x.id === id
        );


    if (!item) return;


    $("depositoId").value =
        item.id;


    $("dataDeposito").value =
        item.data || hojeISO();


    $("valorDeposito").value =
        numero(item.valor);


    $("observacoesDeposito").value =
        item.observacoes || "";


    $("btnSalvarDeposito").textContent =
        "💾 Guardar alterações";


    $("btnCancelarEdicaoDeposito")
        .classList
        .remove("d-none");


    document
        .querySelector(
            '[data-tab="depositos"]'
        )
        .click();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   GUARDAR FECHAMENTO
========================================================= */

async function salvarFechamento(event) {

    event.preventDefault();


    const id =
        $("fechamentoId").value;


    const data =
        $("dataFechamento").value;


    const quantidadeCarros =
        Number(
            $("quantidadeCarros").value
        );


    const dinheiroValor =
        numero(
            $("dinheiro").value
        );


    const multibanco =
        numero(
            $("multibanco").value
        );


    const mbway =
        numero(
            $("mbway").value
        );


    const outros =
        numero(
            $("outros").value
        );


    const total =

        dinheiroValor +

        multibanco +

        mbway +

        outros;


    const observacoes =
        $("observacoesFechamento")
            .value
            .trim();


    /* VALIDAÇÕES */

    if (

        !data ||

        !Number.isInteger(
            quantidadeCarros
        ) ||

        quantidadeCarros < 0

    ) {

        alert(
            "Preencha a data e um número válido de carros."
        );

        return;

    }


    if (

        [
            dinheiroValor,
            multibanco,
            mbway,
            outros
        ].some(
            v => v < 0
        )

    ) {

        alert(
            "Os valores não podem ser negativos."
        );

        return;

    }


    /* NÃO PERMITIR DUAS DATAS IGUAIS */

    const duplicado =
        fechamentos.find(

            item =>

                item.data === data &&

                item.id !== id

        );


    if (duplicado) {

        alert(

            "Já existe um fechamento para esta data. " +

            "Edite o fechamento existente."

        );

        return;

    }


    const dados = {

        data,

        quantidadeCarros,

        dinheiro:
            dinheiroValor,

        multibanco,

        mbway,

        outros,

        total,

        observacoes,

        atualizadoEm:
            new Date().toISOString()

    };


    try {

        /* EDITAR */

        if (id) {

            const itemAntigo =
                fechamentos.find(
                    x => x.id === id
                );


            const novoSaldoDisponivel =

                (

                    saldoDinheiro() -

                    numero(
                        itemAntigo?.dinheiro
                    ) +

                    dinheiroValor

                ) -

                totalDepositos();


            if (
                novoSaldoDisponivel < 0
            ) {

                alert(

                    "Esta alteração deixaria " +

                    "o saldo de dinheiro negativo " +

                    "porque já existem depósitos registados."

                );

                return;

            }


            await updateDoc(

                doc(
                    db,
                    COLECAO_FECHAMENTOS,
                    id
                ),

                dados

            );

        }


        /* NOVO */

        else {

            await addDoc(

                collection(
                    db,
                    COLECAO_FECHAMENTOS
                ),

                {

                    ...dados,

                    criadoEm:
                        new Date().toISOString(),

                    utilizador:
                        localStorage.getItem(
                            "utilizador"
                        ) || ""

                }

            );

        }


        limparFormularioFechamento();

        await carregarDados();


        alert(

            id

                ? "Fechamento atualizado com sucesso."

                : "Fechamento guardado com sucesso."

        );


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao guardar o fechamento."
        );

    }

}


/* =========================================================
   APAGAR FECHAMENTO
========================================================= */

async function excluirFechamento(id) {

    const item =
        fechamentos.find(
            x => x.id === id
        );


    if (!item) return;


    const novoSaldo =

        saldoDinheiro() -

        numero(item.dinheiro) -

        totalDepositos();


    if (novoSaldo < 0) {

        alert(

            "Não é possível apagar este fechamento " +

            "porque já existem depósitos que dependem " +

            "do dinheiro acumulado."

        );

        return;

    }


    if (

        !confirm(

            `Apagar o fechamento de ${item.data}?`

        )

    ) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                COLECAO_FECHAMENTOS,
                id
            )

        );


        await carregarDados();


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao apagar o fechamento."
        );

    }

}


/* =========================================================
   LIMPAR FORMULÁRIO DE DEPÓSITO
========================================================= */

function limparFormularioDeposito() {

    $("depositoId").value = "";

    $("dataDeposito").value =
        hojeISO();

    $("valorDeposito").value = "";

    $("observacoesDeposito").value = "";


    $("btnSalvarDeposito").textContent =
        "💾 Guardar depósito";


    $("btnCancelarEdicaoDeposito")
        .classList
        .add("d-none");

}


/* =========================================================
   GUARDAR DEPÓSITO
========================================================= */

async function salvarDeposito(event) {

    event.preventDefault();


    const id =
        $("depositoId").value;


    const data =
        $("dataDeposito").value;


    const valor =
        numero(
            $("valorDeposito").value
        );


    const observacoes =
        $("observacoesDeposito")
            .value
            .trim();


    if (
        !data ||
        valor <= 0
    ) {

        alert(
            "Informe a data e um valor de depósito válido."
        );

        return;

    }


    const depositoAtual =

        id

            ? depositos.find(
                item => item.id === id
            )

            : null;


    const disponivelSemEste =

        saldoDinheiro() -

        totalDepositos() +

        numero(
            depositoAtual?.valor
        );


    if (
        valor > disponivelSemEste
    ) {

        alert(

            `O valor disponível para depósito é ${dinheiro(
                disponivelSemEste
            )}.`

        );

        return;

    }


    const dados = {

        data,

        valor,

        observacoes,

        atualizadoEm:
            new Date().toISOString()

    };


    try {

        /* EDITAR */

        if (id) {

            await updateDoc(

                doc(
                    db,
                    COLECAO_DEPOSITOS,
                    id
                ),

                dados

            );

        }


        /* NOVO */

        else {

            await addDoc(

                collection(
                    db,
                    COLECAO_DEPOSITOS
                ),

                {

                    ...dados,

                    criadoEm:
                        new Date().toISOString(),

                    utilizador:
                        localStorage.getItem(
                            "utilizador"
                        ) || ""

                }

            );

        }


        limparFormularioDeposito();

        await carregarDados();


        alert(

            id

                ? "Depósito atualizado com sucesso."

                : "Depósito registado com sucesso."

        );


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao guardar o depósito."
        );

    }

}


/* =========================================================
   APAGAR DEPÓSITO
========================================================= */

async function excluirDeposito(id) {

    const item =
        depositos.find(
            x => x.id === id
        );


    if (!item) return;


    if (

        !confirm(

            `Apagar o depósito de ${item.data}, ` +

            `no valor de ${dinheiro(item.valor)}?`

        )

    ) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                COLECAO_DEPOSITOS,
                id
            )

        );


        await carregarDados();


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao apagar o depósito."
        );

    }

}


/* =========================================================
   CONFIGURAR ABAS
========================================================= */

function configurarAbas() {

    document
        .querySelectorAll(".tab-btn")
        .forEach(

            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        const tab =
                            botao.dataset.tab;


                        document
                            .querySelectorAll(
                                ".tab-btn"
                            )
                            .forEach(
                                b =>
                                    b.classList
                                        .remove(
                                            "ativo"
                                        )
                            );


                        document
                            .querySelectorAll(
                                ".tab-content"
                            )
                            .forEach(
                                c =>
                                    c.classList
                                        .remove(
                                            "ativo"
                                        )
                            );


                        botao.classList
                            .add("ativo");


                        $(`tab-${tab}`)
                            .classList
                            .add("ativo");

                    }
                );

            }

        );

}


/* =========================================================
   CONFIGURAR EVENTOS
========================================================= */

function configurarEventos() {


    /* ATUALIZA TOTAL AUTOMATICAMENTE */

    [

        "dinheiro",

        "multibanco",

        "mbway",

        "outros"

    ].forEach(

        id => {

            $(id).addEventListener(

                "input",

                totalFechamentoDoFormulario

            );

        }

    );


    /* FILTRO */

    $("filtroFechamento")
        .addEventListener(

            "change",

            renderizarFechamentos

        );


    /* FORMULÁRIO FECHAMENTO */

    $("formFechamento")
        .addEventListener(

            "submit",

            salvarFechamento

        );


    /* FORMULÁRIO DEPÓSITO */

    $("formDeposito")
        .addEventListener(

            "submit",

            salvarDeposito

        );


    /* CANCELAR EDIÇÃO */

    $("btnCancelarEdicao")
        .addEventListener(

            "click",

            limparFormularioFechamento

        );


    $("btnCancelarEdicaoDeposito")
        .addEventListener(

            "click",

            limparFormularioDeposito

        );


    /* AÇÕES FECHAMENTOS */

    $("tabelaFechamentos")
        .addEventListener(

            "click",

            event => {

                const editar =
                    event.target.closest(
                        "[data-editar-fechamento]"
                    );


                const excluir =
                    event.target.closest(
                        "[data-excluir-fechamento]"
                    );


                if (editar) {

                    editarFechamento(
                        editar.dataset
                            .editarFechamento
                    );

                }


                if (excluir) {

                    excluirFechamento(
                        excluir.dataset
                            .excluirFechamento
                    );

                }

            }

        );


    /* AÇÕES DEPÓSITOS */

    $("tabelaDepositos")
        .addEventListener(

            "click",

            event => {

                const editar =
                    event.target.closest(
                        "[data-editar-deposito]"
                    );


                const excluir =
                    event.target.closest(
                        "[data-excluir-deposito]"
                    );


                if (editar) {

                    editarDeposito(
                        editar.dataset
                            .editarDeposito
                    );

                }


                if (excluir) {

                    excluirDeposito(
                        excluir.dataset
                            .excluirDeposito
                    );

                }

            }

        );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

configurarAbas();

configurarEventos();

limparFormularioFechamento();

limparFormularioDeposito();

carregarDados();
