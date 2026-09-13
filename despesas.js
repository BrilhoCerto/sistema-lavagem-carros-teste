import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================
   ACESSO
========================================= */

const perfilDespesa = localStorage.getItem("perfil");

if (!perfilDespesa) {
    window.location.href = "login.html";
}

if (perfilDespesa === "funcionario") {
    window.location.href = "pagamentos.html";
}


/* =========================================
   DADOS
========================================= */

let despesas = [];

const despesasRef = collection(db, "despesas");


/* =========================================
   SUBCATEGORIAS
========================================= */

const subcategorias = {

    "Ordenados": [
        "ADM",
        "Funcionário 1",
        "Funcionário 2",
        "Outros"
    ],

    "Ordenado Diário": [
        "Vitória",
        "Mariana",
        "Natália",
        "Eliane",
        "Outros"
    ],

    "Comissões": [
        "ADM",
        "Funcionário 1",
        "Funcionário 2",
        "Outros"
    ],

    "Despesas Operacionais": [
        "Produtos",
        "Material",
        "Fornecedores",
        "Equipamentos"
    ],

    "Alimentação": [
        "Pequeno-almoço",
        "Almoço",
        "Jantar",
        "Café"
    ],

    "Contas": [
        "Água",
        "Luz",
        "Internet",
        "Segurança Social",
        "Outros"
    ],

    "Despesas Pessoais": [
        "Compras do Mês",
        "Compras da Semana",
        "Mercado",
        "Casa",
        "Renda da Casa",
        "Loja das Bombas",
        "Diversos"
    ],

    "Cartões": [
        "Cartão Crédito Samuel CCA",
        "Cartão Crédito Samuel Millenium",
        "Cartão Crédito Samuel Cetelem",
        "Cartão Crédito Eliane"
    ],

    "Combustível": [
        "Gasóleo",
        "Gasolina",
        "Outros"
    ],

    "Oficina Mecânica": [
        "Reparação",
        "Peças",
        "Manutenção"
    ],

    "Outros": [
        "Diversos"
    ]

};


/* =========================================
   CARTÕES
========================================= */

const cartoes = {

    "Cartão Crédito Samuel CCA": {
        id: "cca",
        nome: "Samuel CCA"
    },

    "Cartão Crédito Samuel Millenium": {
        id: "millenium",
        nome: "Samuel Millennium"
    },

    "Cartão Crédito Samuel Cetelem": {
        id: "cetelem",
        nome: "Samuel Cetelem"
    },

    "Cartão Crédito Eliane": {
        id: "eliane",
        nome: "Eliane"
    }

};


/* =========================================
   FIRESTORE
   IMPORTANTE:
   firestoreId = ID REAL DO DOCUMENTO
========================================= */

onSnapshot(
    despesasRef,
    (snapshot) => {

        despesas = snapshot.docs.map((docSnap) => {

            return {
                ...docSnap.data(),

                /*
                 * MUITO IMPORTANTE:
                 * Alguns registros antigos possuem um campo
                 * chamado "id" dentro dos dados.
                 *
                 * O Firestore possui outro ID:
                 * docSnap.id
                 *
                 * Por isso usamos exclusivamente firestoreId
                 * para atualizar ou excluir documentos.
                 */

                firestoreId: docSnap.id
            };

        });

        atualizarTudo();

    },
    (error) => {

        console.error(
            "Erro ao carregar despesas:",
            error
        );

    }
);


/* =========================================
   ATUALIZAÇÃO GERAL
========================================= */

function atualizarTudo() {

    atualizarResumo();

    atualizarVisao();

    atualizarCartoes();

    atualizarApenasPagar();

    carregarTabela();

}


/* =========================================
   CATEGORIA → SUBCATEGORIA
========================================= */

const campoCategoria = document.getElementById("categoria");

if (campoCategoria) {

    campoCategoria.addEventListener(
        "change",
        function () {

            const categoria = this.value;

            const select =
                document.getElementById("subcategoria");

            if (!select) return;

            select.innerHTML =
                '<option value="">Selecione</option>';

            if (!subcategorias[categoria]) {
                return;
            }

            subcategorias[categoria].forEach(
                (item) => {

                    const option =
                        document.createElement("option");

                    option.value = item;

                    option.textContent = item;

                    select.appendChild(option);

                }
            );

        }
    );

}


/* =========================================
   ORIGEM
========================================= */

const campoOrigem =
    document.getElementById("origem");

if (campoOrigem) {

    campoOrigem.addEventListener(
        "change",
        function () {

            const ehCartao =
                this.value === "Cartões";

            const campoCartao =
                document.getElementById("campoCartao");

            const campoSituacao =
                document.getElementById("campoSituacao");

            const selectCartao =
                document.getElementById("cartao");

            const selectSituacao =
                document.getElementById("situacao");


            if (ehCartao) {

                if (campoCartao) {
                    campoCartao.classList.remove(
                        "campo-oculto"
                    );
                }

                if (selectCartao) {
                    selectCartao.required = true;
                }

                if (selectSituacao) {
                    selectSituacao.value = "A Pagar";
                }

                if (campoSituacao) {
                    campoSituacao.style.display = "none";
                }

            } else {

                if (campoCartao) {
                    campoCartao.classList.add(
                        "campo-oculto"
                    );
                }

                if (selectCartao) {
                    selectCartao.required = false;
                    selectCartao.value = "";
                }

                if (campoSituacao) {
                    campoSituacao.style.display = "block";
                }

            }

        }
    );

}


/* =========================================
   FILTRO DE CATEGORIAS
========================================= */

const filtroCategoria =
    document.getElementById("filtroCategoria");

if (filtroCategoria) {

    Object.keys(subcategorias).forEach(
        (categoria) => {

            const option =
                document.createElement("option");

            option.value = categoria;

            option.textContent = categoria;

            filtroCategoria.appendChild(option);

        }
    );

}


/* =========================================
   SALVAR DESPESA
========================================= */

const formDespesa =
    document.getElementById("formDespesa");

if (formDespesa) {

    formDespesa.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            try {

                const agora = new Date();

                const origem =
                    document
                        .getElementById("origem")
                        .value;

                const ehCartao =
                    origem === "Cartões";


                const dataDespesa =
                    document
                        .getElementById("dataDespesa")
                        .value;


                const descricao =
                    document
                        .getElementById("descricao")
                        .value
                        .trim();


                const categoria =
                    document
                        .getElementById("categoria")
                        .value;


                const subcategoria =
                    ehCartao
                        ? document
                            .getElementById("cartao")
                            .value
                        : document
                            .getElementById("subcategoria")
                            .value;


                const valor =
                    Number(
                        document
                            .getElementById("valor")
                            .value
                    );


                if (!valor || valor <= 0) {

                    alert(
                        "Informe um valor válido."
                    );

                    return;

                }


                const situacao =
                    ehCartao
                        ? "A Pagar"
                        : document
                            .getElementById("situacao")
                            .value;


                const novaDespesa = {

                    criadoEm:
                        agora.toISOString(),

                    data:
                        agora
                            .toISOString()
                            .split("T")[0],

                    hora:
                        agora.toLocaleTimeString(
                            "pt-PT",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        ),

                    dataDespesa,

                    descricao,

                    origem,

                    categoria,

                    subcategoria,

                    valor,

                    status:
                        ehCartao
                            ? "Aberto"
                            : situacao,

                    tipo:
                        ehCartao
                            ? "cartao"
                            : "normal",

                    statusCartao:
                        ehCartao
                            ? "Aberto"
                            : "",

                    dataPagamento: "",

                    origemPagamento: "",

                    observacoes:
                        document
                            .getElementById("observacoes")
                            .value
                            .trim()

                };


                await addDoc(
                    despesasRef,
                    novaDespesa
                );


                formDespesa.reset();


                const campoCartao =
                    document.getElementById(
                        "campoCartao"
                    );

                if (campoCartao) {

                    campoCartao.classList.add(
                        "campo-oculto"
                    );

                }


                const campoSituacao =
                    document.getElementById(
                        "campoSituacao"
                    );

                if (campoSituacao) {

                    campoSituacao.style.display =
                        "block";

                }


                const selectCartao =
                    document.getElementById(
                        "cartao"
                    );

                if (selectCartao) {

                    selectCartao.required =
                        false;

                }


                alert(
                    "Despesa registada com sucesso."
                );


                mudarAba("visao");


            } catch (error) {

                console.error(
                    "Erro ao registar despesa:",
                    error
                );

                alert(
                    "Não foi possível registar a despesa."
                );

            }

        }
    );

}


/* =========================================
   RESUMO
========================================= */

function atualizarResumo() {

    const agora = new Date();

    const hoje =
        agora
            .toISOString()
            .split("T")[0];

    const mes =
        agora.getMonth();

    const ano =
        agora.getFullYear();


    let totalMes = 0;

    let totalPago = 0;

    let totalAberto = 0;

    let totalCartao = 0;

    let totalHoje = 0;


    despesas.forEach((item) => {

        const valor =
            Number(item.valor || 0);

        const data =
            item.dataDespesa ||
            item.data ||
            "";


        if (data === hoje) {

            totalHoje += valor;

        }


        const partes =
            data.split("-");

        const anoItem =
            Number(partes[0]);

        const mesItem =
            Number(partes[1]) - 1;


        if (
            anoItem === ano &&
            mesItem === mes
        ) {

            totalMes += valor;

        }


        const status =
            obterStatus(item);


        if (status === "Pago") {

            totalPago += valor;

        } else {

            totalAberto += valor;

        }


        if (
            ehDespesaCartao(item) &&
            status !== "Pago"
        ) {

            totalCartao += valor;

        }

    });


    definirTexto(
        "despesasMes",
        formatarEuro(totalMes)
    );

    definirTexto(
        "despesasPagas",
        formatarEuro(totalPago)
    );

    definirTexto(
        "despesasAbertas",
        formatarEuro(totalAberto)
    );

    definirTexto(
        "totalCartoes",
        formatarEuro(totalCartao)
    );

    definirTexto(
        "despesasHoje",
        "Hoje: " +
        formatarEuro(totalHoje)
    );

}


/* =========================================
   VISÃO GERAL
========================================= */

function atualizarVisao() {

    const categorias = {};


    despesas.forEach((item) => {

        const categoria =
            item.categoria ||
            "Outros";

        const valor =
            Number(item.valor || 0);


        if (!categorias[categoria]) {

            categorias[categoria] = 0;

        }


        categorias[categoria] += valor;

    });


    const container =
        document.getElementById(
            "resumoCategorias"
        );


    if (!container) return;


    const entradas =
        Object.entries(categorias)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (!entradas.length) {

        container.innerHTML =
            `
            <div class="estado-vazio">
                Ainda não existem despesas registadas.
            </div>
            `;

    } else {

        container.innerHTML =
            entradas
                .map(
                    (item) => `
                        <div class="linha-resumo">

                            <span>
                                ${escaparHTML(item[0])}
                            </span>

                            <strong>
                                ${formatarEuro(item[1])}
                            </strong>

                        </div>
                    `
                )
                .join("");

    }


    /* ÚLTIMAS DESPESAS */

    const ultimas =
        [...despesas]
            .sort(
                (a, b) =>
                    obterDataOrdenacao(b) -
                    obterDataOrdenacao(a)
            )
            .slice(0, 5);


    const ultimasContainer =
        document.getElementById(
            "ultimasDespesas"
        );


    if (!ultimasContainer) return;


    if (!ultimas.length) {

        ultimasContainer.innerHTML =
            `
            <div class="estado-vazio">
                Ainda não existem despesas registadas.
            </div>
            `;

        return;

    }


    ultimasContainer.innerHTML =
        ultimas
            .map(
                (item) => `
                    <div class="linha-resumo">

                        <span>
                            ${escaparHTML(
                                item.descricao ||
                                item.observacoes ||
                                item.subcategoria ||
                                "Despesa"
                            )}
                        </span>

                        <strong>
                            ${formatarEuro(
                                Number(item.valor || 0)
                            )}
                        </strong>

                    </div>
                `
            )
            .join("");

}


/* =========================================
   IDENTIFICAR CARTÃO
========================================= */

function ehDespesaCartao(item) {

    return (
        item.origem === "Cartões" ||

        item.tipo === "cartao" ||

        (
            item.categoria === "Cartões" &&
            String(
                item.subcategoria || ""
            ).startsWith("Cartão Crédito")
        )
    );

}


/* =========================================
   CARTÕES
========================================= */

function atualizarCartoes() {

    const totais = {

        "Cartão Crédito Samuel CCA": 0,

        "Cartão Crédito Samuel Millenium": 0,

        "Cartão Crédito Samuel Cetelem": 0,

        "Cartão Crédito Eliane": 0

    };


    despesas.forEach((item) => {

        if (!ehDespesaCartao(item)) {
            return;
        }


        if (obterStatus(item) === "Pago") {
            return;
        }


        const cartao =
            item.subcategoria;


        if (
            Object.prototype.hasOwnProperty
                .call(
                    totais,
                    cartao
                )
        ) {

            totais[cartao] +=
                Number(item.valor || 0);

        }

    });


    const container =
        document.getElementById(
            "listaCartoes"
        );


    if (!container) return;


    container.innerHTML =
        Object.keys(cartoes)
            .map((nome) => {

                const dados =
                    cartoes[nome];

                const valor =
                    totais[nome];

                const vazio =
                    valor === 0;


                return `
                    <div class="cartao-card ${vazio ? "vazio" : ""}">

                        <div class="cartao-nome">
                            💳 ${escaparHTML(dados.nome)}
                        </div>

                        <div class="cartao-valor">
                            ${formatarEuro(valor)}
                        </div>

                        <div class="cartao-label">
                            Valor em aberto
                        </div>

                        <div class="cartao-status ${vazio ? "ok" : ""}">

                            ${
                                vazio
                                    ? "✓ Sem pendências"
                                    : "● Em aberto"
                            }

                        </div>

                    </div>
                `;

            })
            .join("");


    carregarTabelaCartoes();

}


/* =========================================
   TABELA DE CARTÕES
========================================= */

function carregarTabelaCartoes() {

    const tbody =
        document.getElementById(
            "tabelaCartoes"
        );


    if (!tbody) return;


    const lista =
        despesas
            .filter(
                (item) =>
                    ehDespesaCartao(item) &&
                    obterStatus(item) !== "Pago"
            )
            .sort(
                (a, b) =>
                    obterDataOrdenacao(b) -
                    obterDataOrdenacao(a)
            );


    if (!lista.length) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="7"
                    class="estado-vazio">

                    Não existem compras em aberto.

                </td>

            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        lista
            .map((item) => {

                return `
                    <tr>

                        <td>
                            ${formatarData(
                                item.dataDespesa ||
                                item.data
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.descricao ||
                                item.observacoes ||
                                "Despesa"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                nomeCartao(
                                    item.subcategoria
                                )
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.categoria || ""
                            )}
                        </td>

                        <td>

                            <strong>
                                ${formatarEuro(
                                    Number(item.valor || 0)
                                )}
                            </strong>

                        </td>

                        <td>

                            <span class="status status-cartao">
                                🔵 Em aberto
                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-acao btn-baixa btn-dar-baixa"
                                data-id="${escaparHTML(item.firestoreId)}"
                                data-valor="${Number(item.valor || 0)}"
                                data-descricao="${encodeURIComponent(
                                    item.descricao ||
                                    item.observacoes ||
                                    item.subcategoria ||
                                    "Despesa"
                                )}"
                                onclick="window.abrirModalPagamento(this)"
                            >
                                Dar baixa
                            </button>

                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================
   A PAGAR
========================================= */

function atualizarApenasPagar() {

    const tbody =
        document.getElementById(
            "tabelaPagar"
        );


    if (!tbody) return;


    const lista =
        despesas
            .filter(
                (item) =>
                    obterStatus(item) !== "Pago"
            )
            .sort(
                (a, b) =>
                    obterDataOrdenacao(b) -
                    obterDataOrdenacao(a)
            );


    if (!lista.length) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="7"
                    class="estado-vazio">

                    Não existem despesas a pagar.

                </td>

            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        lista
            .map((item) => {

                const cartao =
                    ehDespesaCartao(item);


                return `
                    <tr>

                        <td>
                            ${formatarData(
                                item.dataDespesa ||
                                item.data
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.descricao ||
                                item.observacoes ||
                                "Despesa"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.categoria || ""
                            )}
                        </td>

                        <td>

                            ${
                                cartao
                                    ? "Cartão — " +
                                      escaparHTML(
                                          nomeCartao(
                                              item.subcategoria
                                          )
                                      )
                                    : escaparHTML(
                                          item.origem || ""
                                      )
                            }

                        </td>

                        <td>

                            <strong>
                                ${formatarEuro(
                                    Number(item.valor || 0)
                                )}
                            </strong>

                        </td>

                        <td>

                            <span class="status status-aberto">

                                ⏳
                                ${
                                    cartao
                                        ? "Cartão em aberto"
                                        : "A pagar"
                                }

                            </span>

                        </td>

                        <td>

                            ${
                                cartao

                                    ?

                                    `
                                    <button
                                        type="button"
                                        class="btn-acao btn-baixa btn-dar-baixa"
                                        data-id="${escaparHTML(item.firestoreId)}"
                                        data-valor="${Number(item.valor || 0)}"
                                        data-descricao="${encodeURIComponent(
                                            item.descricao ||
                                            item.observacoes ||
                                            item.subcategoria ||
                                            "Despesa"
                                        )}"
                                        onclick="window.abrirModalPagamento(this)"
                                    >
                                        Dar baixa
                                    </button>
                                    `

                                    :

                                    `
                                    <button
                                        type="button"
                                        class="btn-acao btn-baixa"
                                        onclick="window.marcarDespesaPaga('${escaparHTML(item.firestoreId)}')"
                                    >
                                        Marcar como paga
                                    </button>
                                    `
                            }

                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================
   HISTÓRICO
========================================= */

function carregarTabela(
    lista = despesas
) {

    const tbody =
        document.getElementById(
            "tabelaDespesas"
        );


    if (!tbody) return;


    const ordenada =
        [...lista]
            .sort(
                (a, b) =>
                    obterDataOrdenacao(b) -
                    obterDataOrdenacao(a)
            );


    if (!ordenada.length) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="10"
                    class="estado-vazio">

                    Nenhuma despesa encontrada.

                </td>

            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        ordenada
            .map((item) => {

                const cartao =
                    ehDespesaCartao(item);

                const status =
                    obterStatus(item);


                let statusHTML;


                if (status === "Pago") {

                    statusHTML =
                        `
                        <span class="status status-pago">
                            🟢 Pago
                        </span>
                        `;

                } else if (cartao) {

                    statusHTML =
                        `
                        <span class="status status-cartao">
                            🔵 Em aberto
                        </span>
                        `;

                } else {

                    statusHTML =
                        `
                        <span class="status status-aberto">
                            ⏳ A pagar
                        </span>
                        `;

                }


                const pagamento =
                    item.dataPagamento
                        ? formatarData(
                              item.dataPagamento
                          )
                        : "—";


                return `
                    <tr>

                        <td>
                            ${formatarData(
                                item.dataDespesa ||
                                item.data
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.descricao ||
                                item.observacoes ||
                                "Despesa"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.categoria || ""
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.subcategoria || ""
                            )}
                        </td>

                        <td>

                            ${
                                cartao
                                    ? "Cartão"
                                    : escaparHTML(
                                          item.origem || ""
                                      )
                            }

                        </td>

                        <td>

                            ${
                                cartao
                                    ? escaparHTML(
                                          nomeCartao(
                                              item.subcategoria
                                          )
                                      )
                                    : "—"
                            }

                        </td>

                        <td>

                            <strong>
                                ${formatarEuro(
                                    Number(item.valor || 0)
                                )}
                            </strong>

                        </td>

                        <td>
                            ${statusHTML}
                        </td>

                        <td>

                            ${
                                item.dataPagamento

                                    ?

                                    escaparHTML(
                                        pagamento +
                                        (
                                            item.origemPagamento
                                                ? " • " +
                                                  item.origemPagamento
                                                : ""
                                        )
                                    )

                                    : "—"
                            }

                        </td>

                        <td>

                            ${
                                cartao &&
                                status !== "Pago"

                                    ?

                                    `
                                    <button
                                        type="button"
                                        class="btn-acao btn-baixa btn-dar-baixa"
                                        data-id="${escaparHTML(item.firestoreId)}"
                                        data-valor="${Number(item.valor || 0)}"
                                        data-descricao="${encodeURIComponent(
                                            item.descricao ||
                                            item.observacoes ||
                                            item.subcategoria ||
                                            "Despesa"
                                        )}"
                                        onclick="window.abrirModalPagamento(this)"
                                    >
                                        Dar baixa
                                    </button>
                                    `

                                    :

                                    `
                                    <button
                                        type="button"
                                        class="btn-acao btn-excluir"
                                        onclick="window.excluirDespesa('${escaparHTML(item.firestoreId)}')"
                                    >
                                        Excluir
                                    </button>
                                    `
                            }

                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================
   FILTROS
========================================= */

function filtrarDespesas() {

    let resultado =
        [...despesas];


    const inicio =
        document
            .getElementById("filtroInicio")
            ?.value || "";


    const fim =
        document
            .getElementById("filtroFim")
            ?.value || "";


    const categoria =
        document
            .getElementById("filtroCategoria")
            ?.value || "";


    const origem =
        document
            .getElementById("filtroOrigem")
            ?.value || "";


    if (inicio) {

        resultado =
            resultado.filter(
                (item) =>
                    (
                        item.dataDespesa ||
                        item.data ||
                        ""
                    ) >= inicio
            );

    }


    if (fim) {

        resultado =
            resultado.filter(
                (item) =>
                    (
                        item.dataDespesa ||
                        item.data ||
                        ""
                    ) <= fim
            );

    }


    if (categoria) {

        resultado =
            resultado.filter(
                (item) =>
                    item.categoria === categoria
            );

    }


    if (origem) {

        resultado =
            resultado.filter(
                (item) =>
                    item.origem === origem
            );

    }


    carregarTabela(resultado);

}


function limparFiltros() {

    const filtroInicio =
        document.getElementById(
            "filtroInicio"
        );

    const filtroFim =
        document.getElementById(
            "filtroFim"
        );

    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        );

    const filtroOrigem =
        document.getElementById(
            "filtroOrigem"
        );


    if (filtroInicio) {
        filtroInicio.value = "";
    }

    if (filtroFim) {
        filtroFim.value = "";
    }

    if (filtroCategoria) {
        filtroCategoria.value = "";
    }

    if (filtroOrigem) {
        filtroOrigem.value = "";
    }


    carregarTabela();

}


/* =========================================
   ABRIR MODAL DE PAGAMENTO
========================================= */

function abrirModalPagamento(botao) {

    /*
     * Aqui o data-id agora contém exclusivamente
     * o firestoreId real.
     */

    const firestoreId =
        botao.getAttribute("data-id");


    const valor =
        Number(
            botao.getAttribute("data-valor") || 0
        );


    const descricaoCodificada =
        botao.getAttribute(
            "data-descricao"
        ) || "";


    let descricao =
        "Despesa";


    try {

        descricao =
            decodeURIComponent(
                descricaoCodificada
            ) || "Despesa";

    } catch (error) {

        console.error(error);

    }


    /*
     * Verificação de segurança.
     */

    if (!firestoreId) {

        alert(
            "Não foi possível identificar esta despesa."
        );

        return;

    }


    document
        .getElementById("pagamentoId")
        .value = firestoreId;


    document
        .getElementById("pagamentoDescricao")
        .textContent = descricao;


    document
        .getElementById("pagamentoValor")
        .textContent =
        formatarEuro(valor);


    document
        .getElementById("dataPagamento")
        .value =
        new Date()
            .toISOString()
            .split("T")[0];


    document
        .getElementById("origemPagamento")
        .value = "";


    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (!modal) {

        alert(
            "A janela de pagamento não foi encontrada na página."
        );

        return;

    }


    modal.classList.add("aberto");

}


/* =========================================
   FECHAR MODAL
========================================= */

function fecharModalPagamento() {

    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (!modal) return;


    modal.classList.remove(
        "aberto"
    );

}


/* =========================================
   CONFIRMAR PAGAMENTO DO CARTÃO
========================================= */

async function confirmarPagamentoCartao() {

    /*
     * Este valor agora é SEMPRE o firestoreId.
     */

    const firestoreId =
        document
            .getElementById("pagamentoId")
            .value;


    const dataPagamento =
        document
            .getElementById("dataPagamento")
            .value;


    const origemPagamento =
        document
            .getElementById("origemPagamento")
            .value;


    if (!firestoreId) {

        alert(
            "Não foi possível identificar a despesa."
        );

        return;

    }


    /*
     * Confere se a despesa existe
     * na lista carregada.
     */

    const item =
        despesas.find(
            (despesa) =>
                String(
                    despesa.firestoreId
                ) ===
                String(firestoreId)
        );


    if (!item) {

        alert(
            "A despesa não foi encontrada. Atualize a página e tente novamente."
        );

        console.error(
            "firestoreId não encontrado:",
            firestoreId
        );

        return;

    }


    if (!dataPagamento) {

        alert(
            "Informe a data do pagamento."
        );

        return;

    }


    if (!origemPagamento) {

        alert(
            "Informe de onde saiu o dinheiro."
        );

        return;

    }


    try {

        /*
         * ATENÇÃO:
         *
         * Aqui NÃO usamos item.id.
         *
         * Usamos exclusivamente:
         *
         * firestoreId
         */

        await updateDoc(
            doc(
                db,
                "despesas",
                firestoreId
            ),
            {

                status: "Pago",

                statusCartao: "Pago",

                dataPagamento:

                    dataPagamento,

                origemPagamento:

                    origemPagamento

            }
        );


        fecharModalPagamento();


        alert(
            "Pagamento registado. A despesa não foi duplicada."
        );


    } catch (error) {

        console.error(
            "ERRO AO DAR BAIXA:",
            error
        );


        alert(
            "Não foi possível registar o pagamento."
        );

    }

}


/* =========================================
   MARCAR DESPESA NORMAL COMO PAGA
========================================= */

async function marcarDespesaPaga(
    firestoreId
) {

    if (!firestoreId) {

        alert(
            "Não foi possível identificar a despesa."
        );

        return;

    }


    const item =
        despesas.find(
            (despesa) =>
                String(
                    despesa.firestoreId
                ) ===
                String(firestoreId)
        );


    if (!item) {

        alert(
            "A despesa não foi encontrada. Atualize a página e tente novamente."
        );

        return;

    }


    if (
        !confirm(
            "Confirmar que esta despesa foi paga?"
        )
    ) {

        return;

    }


    try {

        const hoje =
            new Date()
                .toISOString()
                .split("T")[0];


        await updateDoc(
            doc(
                db,
                "despesas",
                firestoreId
            ),
            {

                status: "Pago",

                dataPagamento: hoje,

                origemPagamento:
                    item.origem || ""

            }
        );


    } catch (error) {

        console.error(
            "Erro ao marcar despesa como paga:",
            error
        );


        alert(
            "Não foi possível atualizar a despesa."
        );

    }

}


/* =========================================
   EXCLUIR DESPESA
========================================= */

async function excluirDespesa(
    firestoreId
) {

    if (!firestoreId) {

        alert(
            "Não foi possível identificar a despesa."
        );

        return;

    }


    /*
     * Procuramos usando firestoreId.
     */

    const item =
        despesas.find(
            (despesa) =>
                String(
                    despesa.firestoreId
                ) ===
                String(firestoreId)
        );


    if (!item) {

        alert(
            "A despesa não foi encontrada."
        );

        return;

    }


    if (
        !confirm(
            "Deseja realmente excluir esta despesa?"
        )
    ) {

        return;

    }


    try {

        /*
         * Exclusão usando o ID REAL
         * do documento Firestore.
         */

        await deleteDoc(
            doc(
                db,
                "despesas",
                firestoreId
            )
        );


    } catch (error) {

        console.error(
            "Erro ao excluir despesa:",
            error
        );


        alert(
            "Não foi possível excluir a despesa."
        );

    }

}


/* =========================================
   ABAS
========================================= */

function mudarAba(nome) {

    document
        .querySelectorAll(".aba-conteudo")
        .forEach(
            (aba) => {

                aba.classList.remove(
                    "ativo"
                );

            }
        );


    document
        .querySelectorAll(".aba-btn")
        .forEach(
            (botao) => {

                botao.classList.remove(
                    "ativo"
                );

            }
        );


    const aba =
        document.getElementById(
            "aba-" + nome
        );


    const botao =
        document.querySelector(
            `.aba-btn[data-aba="${nome}"]`
        );


    if (aba) {

        aba.classList.add(
            "ativo"
        );

    }


    if (botao) {

        botao.classList.add(
            "ativo"
        );

    }

}


function abrirAbaNovaDespesa() {

    mudarAba("nova");


    const campo =
        document.getElementById(
            "dataDespesa"
        );


    if (
        campo &&
        !campo.value
    ) {

        campo.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }

}


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function obterStatus(item) {

    if (item.status) {

        return item.status;

    }


    if (
        item.statusCartao === "Pago"
    ) {

        return "Pago";

    }


    if (
        ehDespesaCartao(item)
    ) {

        return "Aberto";

    }


    return "Pago";

}


function nomeCartao(valor) {

    if (cartoes[valor]) {

        return cartoes[valor].nome;

    }


    return valor || "—";

}


function obterDataOrdenacao(item) {

    const valor =
        item.dataDespesa ||
        item.data ||
        item.criadoEm ||
        "";


    const tempo =
        new Date(valor).getTime();


    return isNaN(tempo)
        ? 0
        : tempo;

}


function formatarData(data) {

    if (!data) {

        return "—";

    }


    const partes =
        String(data).split("-");


    if (
        partes.length === 3
    ) {

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }


    return data;

}


function formatarEuro(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR"
        }
    );

}


function definirTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    if (
        !confirm(
            "Deseja realmente sair do sistema?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        "perfil"
    );


    window.location.href =
        "login.html";

}


/* =========================================
   DISPONIBILIZAR FUNÇÕES PARA O HTML
========================================= */

window.mudarAba =
    mudarAba;

window.abrirAbaNovaDespesa =
    abrirAbaNovaDespesa;

window.filtrarDespesas =
    filtrarDespesas;

window.limparFiltros =
    limparFiltros;

window.abrirModalPagamento =
    abrirModalPagamento;

window.fecharModalPagamento =
    fecharModalPagamento;

window.confirmarPagamentoCartao =
    confirmarPagamentoCartao;

window.marcarDespesaPaga =
    marcarDespesaPaga;

window.excluirDespesa =
    excluirDespesa;

window.logout =
    logout;


/* =========================================
   INICIALIZAÇÃO
========================================= */

const dataInicial =
    document.getElementById(
        "dataDespesa"
    );


if (dataInicial) {

    dataInicial.value =
        new Date()
            .toISOString()
            .split("T")[0];

}


atualizarTudo();
