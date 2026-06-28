import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
query,
where,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let pagamentos =
JSON.parse(localStorage.getItem("pagamentos")) || [];

let agendamentos =
JSON.parse(localStorage.getItem("agendamentos")) || [];

let agendamentoSelecionado = null;

/* FIREBASE */

async function carregarAgendamentosFirebase(){

    const snapshot =
    await getDocs(collection(db, "agendamentos"));

    agendamentos = [];

    snapshot.forEach((documento)=>{

        agendamentos.push({
    firebaseId: documento.id,
    ...documento.data()
});

    });

    localStorage.setItem(
        "agendamentos",
        JSON.stringify(agendamentos)
    );

    console.log(
        "Agendamentos carregados:",
        agendamentos.length
    );

}

async function carregarPagamentosFirebase(){

    const snapshot =
    await getDocs(collection(db, "pagamentos"));

    pagamentos = [];

    snapshot.forEach((documento)=>{

       pagamentos.push({
    firebaseId: documento.id,
    ...documento.data()
    });
});

    pagamentos.sort((a,b)=>{

        return new Date(b.data) - new Date(a.data);

    });

    localStorage.setItem(
        "pagamentos",
        JSON.stringify(pagamentos)
    );

    console.log(
        "Pagamentos carregados:",
        pagamentos.length
    );

    return pagamentos;

}

/* SERVIÇOS DO DIA */
function carregarServicosHoje() {

    alert("Entrou em carregarServicosHoje");
    
//console.log("AGENDAMENTOS:", agendamentos);
//console.log("PAGAMENTOS:", pagamentos);
//console.log("HOJE:", hoje);


// Atualiza os dados mais recentes
agendamentos =
JSON.parse(localStorage.getItem("agendamentos")) || [];

    agendamentos.forEach(item => {
    console.log(
        "Data do agendamento:",
        item.data,
        "| Cliente:",
        item.cliente
    );
});
    
pagamentos =
JSON.parse(localStorage.getItem("pagamentos")) || [];

console.log("AGENDAMENTOS:", agendamentos);
console.log("PAGAMENTOS:", pagamentos);
    
const hoje =
new Date()
.toISOString()
.split("T")[0];
  console.log("Hoje:", hoje);


alert(
"Agendamentos: " +
agendamentos.length +
" | Pagamentos: " +
pagamentos.length
); 
    const lista =
    document.getElementById("listaServicosHoje");

    const agendamentosPagos =
new Set(
    pagamentos
    .filter(p => String(p.status || "").startsWith("Pago"))
    .map(p => String(p.agendamentoId))
);

   const servicosPendentes =
agendamentos
.filter(item =>

    !agendamentosPagos.has(
    String(item.id || item.firebaseId)
)

)
.sort((a,b)=>{

        const dataA =
        new Date(a.data + "T" + a.hora);

        const dataB =
        new Date(b.data + "T" + b.hora);

        return dataA - dataB;

    });
    console.log("SERVICOS PENDENTES", servicosPendentes);
    if(servicosPendentes.length === 0){

        lista.innerHTML =
        "<p>Nenhum serviço pendente.</p>";

        return;

    }

    lista.innerHTML = "";

    servicosPendentes.forEach(item=>{

        if(
    !item ||
    !item.cliente ||
    !item.data ||
    !item.hora
){
    return;
}
        lista.innerHTML +=

        '<div class="item-servico" onclick="selecionarAgendamento(\'' +

        item.id +

        '\')">' +

        '<strong>' +

        item.data +

        '</strong> | ' +

        item.hora +

        ' | ' +

        (pagamentos.some(
    p =>
    String(p.agendamentoId) === String(item.id)
    &&
    String(p.status || "").startsWith("Pago")
)
? "🔴 "
: "") +

item.cliente +

        ' | ' +

        item.modelo +

        ' | € ' +

        (item.valor || 0) +

        '</div>';

    });

/*  AGENDAMENTO */

function selecionarAgendamento(id) {

    const item =
    agendamentos.find(
        a => String(a.id) === String(id)
    );

    if (!item) {
        return;
    }

    agendamentoSelecionado = item;

    document.getElementById("cliente").value =
    item.cliente || "";

    document.getElementById("telefone").value =
    item.telefone || "";

    document.getElementById("modelo").value =
    item.modelo || "";

    document.getElementById("servicos").value =
    Array.isArray(item.servicos)
    ? item.servicos.join(", ")
    : "";

    document.getElementById("valor").value =
    item.valor || "";

    }
    /* REGISTAR PAGAMENTO */

document
.getElementById("formPagamento")
.addEventListener("submit", async function(e){

    e.preventDefault();

    if(!agendamentoSelecionado){

        alert("Selecione um cliente da lista.");

        return;

    }

    const valor =
    parseFloat(
        document.getElementById("valor").value
    );

    const formaPagamento =
    document.getElementById("formaPagamento").value;

    const status =
    document.getElementById("status").value;

    const dataRecebimento =
    document.getElementById("dataRecebimento").value
    ||
    new Date()
    .toISOString()
    .split("T")[0];

    if(isNaN(valor) || valor <= 0){

        alert("Informe um valor válido.");

        return;

    }

    if(!formaPagamento){

        alert("Selecione a forma de pagamento.");

        return;

    }

    if(!status){

        alert("Selecione o status.");

        return;

    }

    if(!confirm("Tem certeza que deseja registar este pagamento?")){

        return;

    }

    const pagamento = {

        id: Date.now().toString(),

        agendamentoId:
        String(agendamentoSelecionado.id || agendamentoSelecionado.firebaseId),

        data: dataRecebimento,

        cliente:
        agendamentoSelecionado.cliente,

        telefone:
        agendamentoSelecionado.telefone,

        modelo:
        agendamentoSelecionado.modelo,

        servicos:
        agendamentoSelecionado.servicos,

        valor: valor,

        formaPagamento:
        formaPagamento,

        status:
        status,

        observacoes:
        document.getElementById("observacoes").value

    };
    
    const indicePendente =
    pagamentos.findIndex(
        p =>
        String(p.agendamentoId) ===
        String(agendamentoSelecionado.id)
    );

    if(indicePendente !== -1){

        pagamentos[indicePendente] = pagamento;

    }else{

        pagamentos.push(pagamento);

        await addDoc(
            collection(db, "pagamentos"),
            pagamento
        );

    }

    localStorage.setItem(
        "pagamentos",
        JSON.stringify(pagamentos)
    );

    await carregarPagamentosFirebase();

    await carregarAgendamentosFirebase();

    alert("Pagamento registado com sucesso.");

    document
    .getElementById("formPagamento")
    .reset();

    document.getElementById("cliente").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("servicos").value = "";

    agendamentoSelecionado = null;

    atualizarCards();

    carregarServicosHoje();

    carregarPendentes();

    carregarPagamentosHoje();

    carregarRecebidosMes();

});

/* CARDS */

function atualizarCards(){

    const hoje =
    new Date()
    .toISOString()
    .split("T")[0];

    const mesAtual =
    new Date().getMonth();

    const anoAtual =
    new Date().getFullYear();

    let recebidoHoje = 0;
    let recebidoMes = 0;
    let pendente = 0;
    let recebidoDinheiro = 0;
    let recebidoMbway = 0;
    let recebidoMultibanco = 0;
    let lavagemGratuita = 0;

    pagamentos.forEach(item => {

       const pago =
(item.status || "").startsWith("Pago");

        if(item.data === hoje && pago){

            recebidoHoje += Number(item.valor || 0);

            if(item.formaPagamento === "Dinheiro"){
            recebidoDinheiro += Number(item.valor || 0);
            }

           if(item.formaPagamento === "MB Way Samuel"){
            recebidoMbway += Number(item.valor || 0);
            }

            if(item.formaPagamento === "Multibanco Brilho Certo"){
            recebidoMultibanco += Number(item.valor || 0);
            }

            if(item.formaPagamento === "Lavagem Gratuita"){
            lavagemGratuita += Number(item.valor || 0);
    }

}

        const dataItem =
        new Date(item.data);

        if(
            dataItem.getMonth() === mesAtual &&
            dataItem.getFullYear() === anoAtual &&
            pago
        ){

            recebidoMes += Number(item.valor || 0);

        }

        if(!pago){

            pendente += Number(item.valor || 0);

        }

    });

    document.getElementById("recebidoHoje").textContent =
    "€ " + recebidoHoje.toFixed(2);

    const cardRecebidoMes =
document.getElementById("recebidoMes");

if(cardRecebidoMes){

    cardRecebidoMes.textContent =
    "€ " + recebidoMes.toFixed(2);

}

    document.getElementById("valorPendente").textContent =
    "€ " + pendente.toFixed(2);

    document.getElementById("recebidoDinheiro").textContent =
    "€ " + recebidoDinheiro.toFixed(2);

    document.getElementById("recebidoMbway").textContent =
    "€ " + recebidoMbway.toFixed(2);
    
    document.getElementById("recebidoMultibanco").textContent =
"€ " + recebidoMultibanco.toFixed(2);
    
    document.getElementById("lavagemGratuita").textContent =
"€ " + lavagemGratuita.toFixed(2);
    }
    /* PENDÊNCIAS */

function carregarPendentes(){

    const lista =
    document.getElementById("listaPendentes");
    if(!lista){
        return;
    }
    console.log(pagamentos);
    const pendentes =
    pagamentos.filter(
       p => !(p.status || "").startsWith("Pago")
    );

    if(pendentes.length === 0){

        lista.innerHTML =
        "Nenhuma pendência.";

        return;
    }

    lista.innerHTML = "";

    pendentes.forEach(item => {

        lista.innerHTML +=
        '<div class="item-pendente">' +
        '<strong>' +
        item.cliente +
        '</strong><br>' +
        '€ ' +
        Number(item.valor || 0).toFixed(2) +
        '<br>' +
        '<span class="pendente">' +
        item.status +
        '</span>' +
        '</div>';

    });

}

/* PAGAMENTOS REGISTADOS HOJE */

function carregarPagamentosHoje(){

    const lista =
    document.getElementById(
        "listaPagamentosHoje"
    );
const filtro =
document.getElementById("filtroDataPagamento");

if (filtro && !filtro.dataset.evento) {
    filtro.addEventListener(
        "change",
        carregarPagamentosHoje
    );
    filtro.dataset.evento = "ok";
}
    if(!lista){
        return;
    }

    const hoje =
    new Date()
    .toISOString()
    .split("T")[0];

  const filtroData =
document.getElementById("filtroDataPagamento")?.value;

const hojePagos =
pagamentos.filter(
    p =>
        String(p.status || "").startsWith("Pago")&&
        (!filtroData || p.data === filtroData)
);

console.log("Pagamentos:", pagamentos);
console.log("Hoje pagos:", hojePagos);
    
    if(hojePagos.length === 0){

        lista.innerHTML =
        "Nenhum pagamento registado hoje.";

        return;
    }

    lista.innerHTML = "";

    hojePagos.forEach(item => {

        lista.innerHTML +=
        '<div class="item-pendente">' +
        '<strong>' + item.cliente + '</strong> | ' +
item.modelo + ' | € ' +
item.valor.toFixed(2) + ' | ' +
item.formaPagamento +
'<button onclick="excluirPagamento(\'' + item.id + '\')">🗑️ Excluir</button>' +
'</div><hr>';

    });

}
async function excluirPagamento(id){

    if(!confirm("Deseja realmente apagar este pagamento?")){
        return;
    }
   const pagamentoExcluido =
pagamentos.find(
    p => p.id === id
);

if (pagamentoExcluido && pagamentoExcluido.firebaseId) {
    await deleteDoc(
        doc(db, "pagamentos", pagamentoExcluido.firebaseId)
    );
}

alert(
    pagamentoExcluido.agendamentoId
);
    
    pagamentos = pagamentos.filter(
        p => p.id !== id
    );

    localStorage.setItem(
        "pagamentos",
        JSON.stringify(pagamentos)
    );

    atualizarCards();

    carregarPagamentosHoje();

    carregarPendentes();

}
window.excluirPagamento = excluirPagamento;
function carregarRecebidosMes(){

    const lista =
    document.getElementById(
        "listaRecebidosMes"
    );

    if(!lista){
        return;
    }

    const mesAtual =
    new Date().getMonth();

    const anoAtual =
    new Date().getFullYear();

    const recebidos =
    pagamentos.filter(item => {

        const dataItem =
        new Date(item.data);

        return (
            String(item.status || "").startsWith("Pago")
            &&
            dataItem.getMonth() === mesAtual
            &&
            dataItem.getFullYear() === anoAtual
        );

    });

    if(recebidos.length === 0){

        lista.innerHTML =
        "Nenhum pagamento registado este mês.";

        return;

    }

    lista.innerHTML = "";

    recebidos.forEach(item => {

       lista.innerHTML +=

'<div class="item-pendente">' +

item.data +

' | ' +

item.cliente +

' | ' +

(item.modelo || '') +

' | € ' +

item.valor.toFixed(2) +

'</div>';

    });

}
/* LOGOUT */

function logout(){

if(!confirm("Deseja sair do sistema?")){
return;
}

localStorage.removeItem("perfil");

window.location.href =
"login.html";

}

/* INICIAR */


//alert("JS carregou");   

const btnFiltrar =
document.getElementById("btnFiltrarRecebidos");

if(btnFiltrar){

    btnFiltrar.addEventListener("click", function(){

        const dataInicial =
        document.getElementById("filtroDataInicial").value;
      

        const dataFinal =
        document.getElementById("filtroDataFinal").value;

        const formaPagamento =
        document.getElementById("filtroFormaPagamento").value;

        const lista =
        document.getElementById("listaRecebidosMes");

        let recebidos =
        pagamentos.filter(item => {

            if(!item.status.startsWith("Pago")){
                return false;
            }

            if(
                formaPagamento &&
                item.formaPagamento !== formaPagamento
            ){
                return false;
            }

            if(
                dataInicial &&
                item.data < dataInicial
            ){
                return false;
            }

            if(
                dataFinal &&
                item.data > dataFinal
            ){
                return false;
            }

            return true;

        });

        if(recebidos.length === 0){

            lista.innerHTML =
            "Nenhum resultado encontrado.";

            return;
        }

        lista.innerHTML = "";

        recebidos.forEach(item => {

            lista.innerHTML +=

            '<div class="item-pendente">' +

            item.data +

            ' | ' +

            item.cliente +

            ' | ' +

            item.formaPagamento +

            ' | € ' +

            item.valor.toFixed(2) +

            '</div>';

        });

    });
    
}
async function iniciarSistema(){

    await carregarAgendamentosFirebase();

    await carregarPagamentosFirebase();

    carregarServicosHoje();

    carregarPendentes();

    carregarPagamentosHoje();

    carregarRecebidosMes();

    atualizarCards();

}

iniciarSistema();
window.selecionarAgendamento = selecionarAgendamento;
