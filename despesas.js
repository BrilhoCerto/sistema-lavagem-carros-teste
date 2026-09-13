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

const perfilDespesa =
localStorage.getItem("perfil");

if(!perfilDespesa){

    window.location.href = "login.html";

}

if(perfilDespesa === "funcionario"){

    window.location.href = "pagamentos.html";

}


/* =========================================
   DADOS
========================================= */

let despesas = [];

const despesasRef =
collection(db,"despesas");


/* =========================================
   SUBCATEGORIAS
========================================= */

const subcategorias = {

    "Ordenados":[
        "ADM",
        "Funcionário 1",
        "Funcionário 2",
        "Outros"
    ],

    "Ordenado Diário":[
        "Vitória",
        "Mariana",
        "Natália",
        "Eliane",
        "Outros"
    ],

    "Comissões":[
        "ADM",
        "Funcionário 1",
        "Funcionário 2",
        "Outros"
    ],

    "Despesas Operacionais":[
        "Produtos",
        "Material",
        "Fornecedores",
        "Equipamentos"
    ],

    "Alimentação":[
        "Pequeno-almoço",
        "Almoço",
        "Jantar",
        "Café"
    ],

    "Contas":[
        "Água",
        "Luz",
        "Internet",
        "Segurança Social",
        "Outros"
    ],

    "Despesas Pessoais":[
        "Compras do Mês",
        "Compras da Semana",
        "Mercado",
        "Casa",
        "Renda da Casa",
        "Loja das Bombas",
        "Diversos"
    ],

    "Cartões":[
        "Cartão Crédito Samuel CCA",
        "Cartão Crédito Samuel Millenium",
        "Cartão Crédito Samuel Cetelem",
        "Cartão Crédito Eliane"
    ],

    "Combustível":[
        "Gasóleo",
        "Gasolina",
        "Outros"
    ],

    "Oficina Mecânica":[
        "Reparação",
        "Peças",
        "Manutenção"
    ],

    "Outros":[
        "Diversos"
    ]

};


/* =========================================
   CARTÕES
========================================= */

const cartoes = {

    "Cartão Crédito Samuel CCA":{
        id:"cca",
        nome:"Samuel CCA"
    },

    "Cartão Crédito Samuel Millenium":{
        id:"millenium",
        nome:"Samuel Millennium"
    },

    "Cartão Crédito Samuel Cetelem":{
        id:"cetelem",
        nome:"Samuel Cetelem"
    },

    "Cartão Crédito Eliane":{
        id:"eliane",
        nome:"Eliane"
    }

};


/* =========================================
   FIRESTORE
========================================= */

onSnapshot(
    despesasRef,
    (snapshot)=>{

        despesas =
        snapshot.docs.map(item=>({

            id:item.id,
            ...item.data()

        }));

        atualizarTudo();

    }
);


/* =========================================
   ATUALIZAÇÃO GERAL
========================================= */

function atualizarTudo(){

    atualizarResumo();

    atualizarVisao();

    atualizarCartoes();

    atualizarApenasPagar();

    carregarTabela();

}


/* =========================================
   CATEGORIA → SUBCATEGORIA
========================================= */

document
.getElementById("categoria")
.addEventListener(
"change",
function(){

    const categoria =
    this.value;

    const select =
    document.getElementById("subcategoria");

    select.innerHTML =
    '<option value="">Selecione</option>';

    if(!subcategorias[categoria]){
        return;
    }

    subcategorias[categoria]
    .forEach(item=>{

        const option =
        document.createElement("option");

        option.value = item;
        option.textContent = item;

        select.appendChild(option);

    });

});


/* =========================================
   ORIGEM
========================================= */

document
.getElementById("origem")
.addEventListener(
"change",
function(){

    const ehCartao =
    this.value === "Cartões";

    const campoCartao =
    document.getElementById("campoCartao");

    const campoSituacao =
    document.getElementById("campoSituacao");

    if(ehCartao){

        campoCartao
        .classList
        .remove("campo-oculto");

        document
        .getElementById("cartao")
        .required = true;

        document
        .getElementById("situacao")
        .value = "A Pagar";

        campoSituacao
        .style
        .display = "none";

    }else{

        campoCartao
        .classList
        .add("campo-oculto");

        document
        .getElementById("cartao")
        .required = false;

        document
        .getElementById("cartao")
        .value = "";

        campoSituacao
        .style
        .display = "block";

    }

});


/* =========================================
   FILTRO DE CATEGORIAS
========================================= */

const filtroCategoria =
document.getElementById("filtroCategoria");

Object.keys(subcategorias)
.forEach(categoria=>{

    const option =
    document.createElement("option");

    option.value = categoria;
    option.textContent = categoria;

    filtroCategoria
    .appendChild(option);

});


/* =========================================
   SALVAR DESPESA
========================================= */

document
.getElementById("formDespesa")
.addEventListener(
"submit",
async function(e){

    e.preventDefault();

    try{

        const agora =
        new Date();

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

        if(!valor || valor <= 0){

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
            agora
            .toISOString(),

            data:
            agora
            .toISOString()
            .split("T")[0],

            hora:
            agora
            .toLocaleTimeString(
                "pt-PT",
                {
                    hour:"2-digit",
                    minute:"2-digit"
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

            dataPagamento:
            "",

            origemPagamento:
            "",

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


        document
        .getElementById("formDespesa")
        .reset();


        document
        .getElementById("campoCartao")
        .classList
        .add("campo-oculto");


        document
        .getElementById("campoSituacao")
        .style
        .display = "block";


        document
        .getElementById("cartao")
        .required = false;


        alert(
            "Despesa registada com sucesso."
        );


        mudarAba("visao");


    }catch(error){

        console.error(error);

        alert(
            "Não foi possível registar a despesa."
        );

    }

});


/* =========================================
   RESUMO
========================================= */

function atualizarResumo(){

    const hoje =
    new Date()
    .toISOString()
    .split("T")[0];

    const agora =
    new Date();

    const mes =
    agora.getMonth();

    const ano =
    agora.getFullYear();


    let totalMes = 0;
    let totalPago = 0;
    let totalAberto = 0;
    let totalCartao = 0;
    let totalHoje = 0;


    despesas.forEach(item=>{

        const valor =
        Number(item.valor || 0);

        const data =
        item.dataDespesa ||
        item.data ||
        "";


        if(data === hoje){

            totalHoje += valor;

        }


        const partes =
        data.split("-");

        const anoItem =
        Number(partes[0]);

        const mesItem =
        Number(partes[1]) - 1;


        if(
            anoItem === ano &&
            mesItem === mes
        ){

            totalMes += valor;

        }


        const status =
        obterStatus(item);


        if(status === "Pago"){

            totalPago += valor;

        }else{

            totalAberto += valor;

        }


        if(
            ehDespesaCartao(item) &&
            status !== "Pago"
        ){

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

function atualizarVisao(){

    const categorias = {};

    despesas.forEach(item=>{

        const categoria =
        item.categoria ||
        "Outros";

        const valor =
        Number(item.valor || 0);

        if(!categorias[categoria]){
            categorias[categoria] = 0;
        }

        categorias[categoria] += valor;

    });


    const container =
    document.getElementById(
        "resumoCategorias"
    );


    const entradas =
    Object.entries(categorias)
    .sort((a,b)=>b[1]-a[1]);


    if(!entradas.length){

        container.innerHTML =
        `<div class="estado-vazio">
            Ainda não existem despesas registadas.
        </div>`;

    }else{

        container.innerHTML =
        entradas
        .map(item=>`

            <div class="linha-resumo">

                <span>
                    ${escaparHTML(item[0])}
                </span>

                <strong>
                    ${formatarEuro(item[1])}
                </strong>

            </div>

        `)
        .join("");

    }


    /* ÚLTIMAS DESPESAS */

    const ultimas =
    [...despesas]
    .sort(
        (a,b)=>
        obterDataOrdenacao(b) -
        obterDataOrdenacao(a)
    )
    .slice(0,5);


    const ultimasContainer =
    document.getElementById(
        "ultimasDespesas"
    );


    if(!ultimas.length){

        ultimasContainer.innerHTML =
        `<div class="estado-vazio">
            Ainda não existem despesas registadas.
        </div>`;

        return;

    }


    ultimasContainer.innerHTML =
    ultimas
    .map(item=>`

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

    `)
    .join("");

}


/* =========================================
   CARTÕES
========================================= */

function ehDespesaCartao(item){

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


function atualizarCartoes(){

    const totais = {

        "Cartão Crédito Samuel CCA":0,

        "Cartão Crédito Samuel Millenium":0,

        "Cartão Crédito Samuel Cetelem":0,

        "Cartão Crédito Eliane":0

    };


    despesas.forEach(item=>{

        if(!ehDespesaCartao(item)){
            return;
        }

        if(obterStatus(item) === "Pago"){
            return;
        }

        const cartao =
        item.subcategoria;

        if(
            Object.prototype
            .hasOwnProperty
            .call(totais,cartao)
        ){

            totais[cartao] +=
            Number(item.valor || 0);

        }

    });


    const container =
    document.getElementById(
        "listaCartoes"
    );


    container.innerHTML =
    Object.keys(cartoes)
    .map(nome=>{

        const dados =
        cartoes[nome];

        const valor =
        totais[nome];

        const vazio =
        valor === 0;


        return `

            <div class="cartao-card ${vazio ? "vazio" : ""}">

                <div class="cartao-nome">
                    💳 ${dados.nome}
                </div>

                <div class="cartao-valor">
                    ${formatarEuro(valor)}
                </div>

                <div class="cartao-label">
                    Valor em aberto
                </div>

                <div
                    class="cartao-status ${vazio ? "ok" : ""}">

                    ${vazio
                        ? "✓ Sem pendências"
                        : "● Em aberto"}

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

function carregarTabelaCartoes(){

    const tbody =
    document.getElementById(
        "tabelaCartoes"
    );


    const lista =
    despesas
    .filter(item=>
        ehDespesaCartao(item) &&
        obterStatus(item) !== "Pago"
    )
    .sort(
        (a,b)=>
        obterDataOrdenacao(b) -
        obterDataOrdenacao(a)
    );


    if(!lista.length){

        tbody.innerHTML =
        `<tr>
            <td
                colspan="7"
                class="estado-vazio">

                Não existem compras em aberto.

            </td>
        </tr>`;

        return;

    }


    tbody.innerHTML =
    lista
    .map(item=>`

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
    class="btn-acao btn-baixa btn-dar-baixa"
    data-id="${item.id}">

    Dar baixa

</button>

            </td>

        </tr>

    `)
    .join("");

}


/* =========================================
   A PAGAR
========================================= */

function atualizarApenasPagar(){

    const tbody =
    document.getElementById(
        "tabelaPagar"
    );


    const lista =
    despesas
    .filter(item=>
        obterStatus(item) !== "Pago"
    )
    .sort(
        (a,b)=>
        obterDataOrdenacao(b) -
        obterDataOrdenacao(a)
    );


    if(!lista.length){

        tbody.innerHTML =
        `<tr>
            <td
                colspan="7"
                class="estado-vazio">

                Não existem despesas a pagar.

            </td>
        </tr>`;

        return;

    }


    tbody.innerHTML =
    lista
    .map(item=>{

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
    ${cartao
        ? "Cartão — " + escaparHTML(
            nomeCartao(item.subcategoria)
        )
        : escaparHTML(
            item.origem || ""
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
                    <span class="status status-aberto">
                        ⏳ ${cartao
                            ? "Cartão em aberto"
                            : "A pagar"}
                    </span>
                </td>

                <td>

                    ${
                        cartao

                        ?

                        `<button
    class="btn-acao btn-baixa btn-dar-baixa"
    data-id="${item.id}">

    Dar baixa

</button>`

                        :

                        `<button
                            class="btn-acao btn-baixa"
                            onclick="marcarDespesaPaga('${item.id}')">

                            Marcar como paga

                        </button>`
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

function carregarTabela(lista = despesas){

    const tbody =
    document.getElementById(
        "tabelaDespesas"
    );


    const ordenada =
    [...lista]
    .sort(
        (a,b)=>
        obterDataOrdenacao(b) -
        obterDataOrdenacao(a)
    );


    if(!ordenada.length){

        tbody.innerHTML =
        `<tr>
            <td
                colspan="10"
                class="estado-vazio">

                Nenhuma despesa encontrada.

            </td>
        </tr>`;

        return;

    }


    tbody.innerHTML =
    ordenada
    .map(item=>{

        const cartao =
        ehDespesaCartao(item);

        const status =
        obterStatus(item);


        const statusHTML =
        status === "Pago"

        ?

        `<span class="status status-pago">
            🟢 Pago
        </span>`

        :

        cartao

        ?

        `<span class="status status-cartao">
            🔵 Em aberto
        </span>`

        :

        `<span class="status status-aberto">
            ⏳ A pagar
        </span>`;


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
                    ${cartao
                        ? "Cartão"
                        : escaparHTML(
                            item.origem || ""
                        )}
                </td>

                <td>
                    ${cartao
                        ? escaparHTML(
                            nomeCartao(
                                item.subcategoria
                            )
                          )
                        : "—"}
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
                        ? escaparHTML(
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

                        `<button
    class="btn-acao btn-baixa btn-dar-baixa"
    data-id="${item.id}">

    Dar baixa

</button>`

                        :

                        `<button
                            class="btn-acao btn-excluir"
                            onclick="excluirDespesa('${item.id}')">

                            Excluir

                        </button>`
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

function filtrarDespesas(){

    let resultado =
    [...despesas];


    const inicio =
    document
    .getElementById("filtroInicio")
    .value;

    const fim =
    document
    .getElementById("filtroFim")
    .value;

    const categoria =
    document
    .getElementById("filtroCategoria")
    .value;

    const origem =
    document
    .getElementById("filtroOrigem")
    .value;


    if(inicio){

        resultado =
        resultado.filter(item=>
            (
                item.dataDespesa ||
                item.data ||
                ""
            ) >= inicio
        );

    }


    if(fim){

        resultado =
        resultado.filter(item=>
            (
                item.dataDespesa ||
                item.data ||
                ""
            ) <= fim
        );

    }


    if(categoria){

        resultado =
        resultado.filter(item=>
            item.categoria === categoria
        );

    }


    if(origem){

        resultado =
        resultado.filter(item=>
            item.origem === origem
        );

    }


    carregarTabela(resultado);

}


function limparFiltros(){

    document
    .getElementById("filtroInicio")
    .value = "";

    document
    .getElementById("filtroFim")
    .value = "";

    document
    .getElementById("filtroCategoria")
    .value = "";

    document
    .getElementById("filtroOrigem")
    .value = "";

    carregarTabela();

}

/* =========================================
   BOTÃO DAR BAIXA
========================================= */

document.addEventListener("click", function(e){

    const botao = e.target.closest(".btn-dar-baixa");

    if(!botao){
        return;
    }

    const id = botao.getAttribute("data-id");

    const item = despesas.find(
        despesa => despesa.id === id
    );

    if(!item){
        alert("Não foi possível localizar esta despesa.");
        return;
    }

    document.getElementById("pagamentoId").value = id;

    document.getElementById("pagamentoDescricao").textContent =
        item.descricao ||
        item.observacoes ||
        item.subcategoria ||
        "Despesa";

    document.getElementById("pagamentoValor").textContent =
        formatarEuro(Number(item.valor || 0));

    document.getElementById("dataPagamento").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("origemPagamento").value = "";

    document.getElementById("modalPagamento")
        .classList.add("aberto");

});
/* =========================================
   DAR BAIXA NO CARTÃO
========================================= */

function abrirModalPagamento(id){

    const item =
    despesas.find(
        despesa =>
        despesa.id === id
    );


    if(!item){
        return;
    }


    document
    .getElementById("pagamentoId")
    .value = id;


    document
    .getElementById("pagamentoDescricao")
    .textContent =
    item.descricao ||
    item.observacoes ||
    item.subcategoria ||
    "Despesa";


    document
    .getElementById("pagamentoValor")
    .textContent =
    formatarEuro(
        Number(item.valor || 0)
    );


    const hoje =
    new Date()
    .toISOString()
    .split("T")[0];


    document
    .getElementById("dataPagamento")
    .value = hoje;


    document
    .getElementById("origemPagamento")
    .value = "";


    document
    .getElementById("modalPagamento")
    .classList
    .add("aberto");

}


function fecharModalPagamento(){

    document
    .getElementById("modalPagamento")
    .classList
    .remove("aberto");

}


async function confirmarPagamentoCartao(){

    const id =
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


    if(!dataPagamento){

        alert(
            "Informe a data do pagamento."
        );

        return;

    }


    if(!origemPagamento){

        alert(
            "Informe de onde saiu o dinheiro."
        );

        return;

    }


    try{

        await updateDoc(
            doc(db,"despesas",id),
            {

                status:"Pago",

                statusCartao:"Pago",

                dataPagamento,

                origemPagamento

            }
        );


        fecharModalPagamento();


        alert(
            "Pagamento registado. A despesa não foi duplicada."
        );


    }catch(error){

        console.error(error);

        alert(
            "Não foi possível registar o pagamento."
        );

    }

}


/* =========================================
   MARCAR DESPESA NORMAL COMO PAGA
========================================= */

async function marcarDespesaPaga(id){

    if(
        !confirm(
            "Confirmar que esta despesa foi paga?"
        )
    ){

        return;

    }


    try{

        const hoje =
        new Date()
        .toISOString()
        .split("T")[0];


        await updateDoc(
            doc(db,"despesas",id),
            {

                status:"Pago",

                dataPagamento:hoje,

                origemPagamento:
                (
                    despesas.find(
                        item=>item.id === id
                    )?.origem || ""
                )

            }
        );


    }catch(error){

        console.error(error);

        alert(
            "Não foi possível atualizar a despesa."
        );

    }

}


/* =========================================
   EXCLUIR
========================================= */

async function excluirDespesa(id){

    const item =
    despesas.find(
        despesa =>
        despesa.id === id
    );


    if(!item){
        return;
    }


    if(
        !confirm(
            "Deseja realmente excluir esta despesa?"
        )
    ){

        return;

    }


    try{

        await deleteDoc(
            doc(db,"despesas",id)
        );

    }catch(error){

        console.error(error);

        alert(
            "Não foi possível excluir a despesa."
        );

    }

}


/* =========================================
   ABAS
========================================= */

function mudarAba(nome){

    document
    .querySelectorAll(".aba-conteudo")
    .forEach(aba=>{

        aba.classList.remove("ativo");

    });


    document
    .querySelectorAll(".aba-btn")
    .forEach(botao=>{

        botao.classList.remove("ativo");

    });


    const aba =
    document.getElementById(
        "aba-" + nome
    );


    const botao =
    document.querySelector(
        `.aba-btn[data-aba="${nome}"]`
    );


    if(aba){

        aba.classList.add("ativo");

    }


    if(botao){

        botao.classList.add("ativo");

    }

}


function abrirAbaNovaDespesa(){

    mudarAba("nova");

    const campo =
    document.getElementById(
        "dataDespesa"
    );


    if(!campo.value){

        campo.value =
        new Date()
        .toISOString()
        .split("T")[0];

    }

}


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function obterStatus(item){

    if(item.status){
        return item.status;
    }


    if(
        item.statusCartao === "Pago"
    ){

        return "Pago";

    }


    if(ehDespesaCartao(item)){

        return "Aberto";

    }


    return "Pago";

}


function nomeCartao(valor){

    if(cartoes[valor]){
        return cartoes[valor].nome;
    }

    return valor || "—";

}


function obterDataOrdenacao(item){

    const valor =
    item.dataDespesa ||
    item.data ||
    item.criadoEm ||
    "";

    const tempo =
    new Date(valor)
    .getTime();

    return isNaN(tempo)
        ? 0
        : tempo;

}


function formatarData(data){

    if(!data){
        return "—";
    }


    const partes =
    String(data)
    .split("-");


    if(partes.length === 3){

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


function formatarEuro(valor){

    return Number(valor || 0)
    .toLocaleString(
        "pt-PT",
        {
            style:"currency",
            currency:"EUR"
        }
    );

}


function definirTexto(id,texto){

    const elemento =
    document.getElementById(id);

    if(elemento){

        elemento.textContent =
        texto;

    }

}


function escaparHTML(valor){

    return String(valor ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================
   LOGOUT
========================================= */

function logout(){

    if(
        !confirm(
            "Deseja realmente sair do sistema?"
        )
    ){

        return;

    }


    localStorage.removeItem(
        "perfil"
    );


    window.location.href =
    "login.html";

}


/* =========================================
   DISPONIBILIZAR FUNÇÕES PARA HTML
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

if(dataInicial){

    dataInicial.value =
    new Date()
    .toISOString()
    .split("T")[0];

}

atualizarTudo();

window.confirmarPagamentoCartao =
confirmarPagamentoCartao;

window.fecharModalPagamento =
fecharModalPagamento;

