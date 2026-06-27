/* ========================= */
/* PARTE 1 DE 10 */
/* ========================= */

/* ========================= */
/* LOCAL STORAGE */
/* ========================= */

let contasPagar =
JSON.parse(
localStorage.getItem("contasPagar")
) || [];

/* ========================= */
/* VARIÁVEIS GLOBAIS */
/* ========================= */

let parcelamentoSelecionado = null;

/* ========================= */
/* PERSISTÊNCIA */
/* ========================= */

function guardarDados(){

localStorage.setItem(
"contasPagar",
JSON.stringify(contasPagar)
);

}

function carregarDados(){

contasPagar =
JSON.parse(
localStorage.getItem("contasPagar")
) || [];

}

/* ========================= */
/* UTILITÁRIOS */
/* ========================= */

function gerarId(){

return Date.now().toString();

}

function formatarEuro(valor){

return "€ " +

Number(valor || 0)
.toFixed(2)
.replace(".",",");

}

function obterDataHoje(){

return new Date()
.toISOString()
.split("T")[0];

}

function formatarData(data){

if(!data){
return "";
}

const partes = data.split("-");

return partes[2] + "/" +
partes[1] + "/" +
partes[0];

}

/* ========================= */
/* LOCALIZAR PARCELAMENTO */
/* ========================= */

function procurarParcelamento(id){

return contasPagar.find(

item =>

String(item.id) === String(id)

);

}

/* ========================= */
/* LIMPAR FORMULÁRIO */
/* ========================= */

function limparFormulario(){

const formulario =

document.getElementById(
"formContaPagar"
);

if(formulario){

formulario.reset();

}

parcelamentoSelecionado = null;

const origem =

document.getElementById(
"parcelamentoOrigem"
);

if(origem){

origem.value = "";

}

}

/* ========================= */
/* ATUALIZAÇÃO GERAL */
/* ========================= */

/* ========================= */
/* PARTE 10 DE 10            */
/* FINALIZAÇÃO DO MÓDULO     */
/* ========================= */

function atualizarSistema(){

    carregarDados();

    carregarCards();

    carregarParcelamentos();

    carregarDetalhesParcelamento();

    carregarResumoMes();

    carregarAlertas();

    carregarProximosVencimentos();

    carregarHistorico();

}

/* ========================= */
/* INICIALIZAÇÃO */
/* ========================= */

document.addEventListener(

"DOMContentLoaded",

function(){

carregarDados();

atualizarSistema();

}

);

/* ========================= */
/* FIM PARTE 1 */
/* ========================= */



/* ========================= */
/* PARTE 2 DE 10 */
/* ========================= */

/* ========================= */
/* FORMULÁRIO */
/* ========================= */

const btnNovo =
document.getElementById("btnMostrarFormulario");

const formulario =
document.getElementById("formularioParcelamento");

if(btnNovo){

btnNovo.addEventListener("click",function(){

if(formulario.style.display==="none"){

formulario.style.display="block";

btnNovo.textContent="Cancelar";

}else{

formulario.style.display="none";

btnNovo.textContent="Novo";

limparFormulario();

}

});

}

/* ========================= */
/* CALCULAR VALOR DA PARCELA */
/* ========================= */

function atualizarValorParcela(){

const valorTotal=

parseFloat(
document.getElementById("valorTotal").value
);

const quantidade=

parseInt(
document.getElementById("quantidadeParcelas").value
);

const campo=

document.getElementById("valorParcela");

if(

isNaN(valorTotal)
||

isNaN(quantidade)
||

quantidade<=0

){

campo.value="";

return;

}

const valor=

(valorTotal/quantidade)
.toFixed(2)
.replace(".",",");

campo.value="€ "+valor;

}

document
.getElementById("valorTotal")
.addEventListener(
"input",
atualizarValorParcela
);

document
.getElementById("quantidadeParcelas")
.addEventListener(
"input",
atualizarValorParcela
);

/* ========================= */
/* GERAR PARCELAS */
/* ========================= */

function gerarParcelas(

quantidade,

valorTotal,

primeiroVencimento

){

const parcelas=[];

let data=
new Date(primeiroVencimento);

let restante=
Number(valorTotal);

const valorBase=

Math.floor(

(valorTotal/quantidade)

*100

)/100;

for(

let i=1;

i<=quantidade;

i++

){

let valor;

if(i===quantidade){

valor=

Number(

restante.toFixed(2)

);

}else{

valor=valorBase;

restante-=valor;

}

parcelas.push({

numero:i,

valor,

vencimento:
data
.toISOString()
.split("T")[0],

status:"Pendente",

dataPagamento:null

});

data.setMonth(

data.getMonth()+1

);

}

return parcelas;

}

/* ========================= */
/* CADASTRAR */
/* ========================= */

document

.getElementById("formContaPagar")

.addEventListener(

"submit",

function(e){

e.preventDefault();

const entidade=

document.getElementById("entidade").value;

const descricao=

document.getElementById("descricao").value;

const processo=

document.getElementById("processo").value;

const valorTotal=

parseFloat(
document.getElementById("valorTotal").value
);

const quantidadeParcelas=

parseInt(
document.getElementById("quantidadeParcelas").value
);

const primeiroVencimento=

document.getElementById("primeiroVencimento").value;

const observacoes=

document.getElementById("observacoes").value;

const novo={

id:gerarId(),

entidade,

descricao,

processo,

valorTotal,

quantidadeParcelas,

valorParcela:

Number(

(valorTotal/quantidadeParcelas)

.toFixed(2)

),

primeiroVencimento,

observacoes,

parcelas:

gerarParcelas(

quantidadeParcelas,

valorTotal,

primeiroVencimento

)

};

contasPagar.push(novo);

guardarDados();

alert(

"Parcelamento cadastrado com sucesso."

);

limparFormulario();

formulario.style.display="none";

btnNovo.textContent="Novo";

atualizarSistema();

});

/* ========================= */
/* FIM PARTE 2 */
/* ========================= */

/* ========================= */
/* PARTE 3 DE 10 */
/* ========================= */

/* ========================= */
/* RESUMO DO FORMULÁRIO */
/* ========================= */

function atualizarResumoFormulario(){

const valorTotal =
parseFloat(
document.getElementById("valorTotal")?.value
) || 0;

const quantidade =
parseInt(
document.getElementById("quantidadeParcelas")?.value
) || 0;

const primeiro =
document.getElementById("primeiroVencimento")?.value || "--";

const valorParcela =
quantidade > 0
? valorTotal / quantidade
: 0;

document.getElementById("resumoValorTotal").textContent =
formatarEuro(valorTotal);

document.getElementById("resumoQuantidade").textContent =
quantidade;

document.getElementById("resumoValorParcela").textContent =
formatarEuro(valorParcela);

document.getElementById("resumoPrimeiroVencimento").textContent =
primeiro === "--"
? "--"
: formatarData(primeiro);

}

/* ========================= */
/* EVENTOS DO FORMULÁRIO */
/* ========================= */

[
"valorTotal",
"quantidadeParcelas",
"primeiroVencimento"

].forEach(id=>{

const campo =
document.getElementById(id);

if(campo){

campo.addEventListener(
"input",
atualizarResumoFormulario
);

campo.addEventListener(
"change",
atualizarResumoFormulario
);

}

});

/* ========================= */
/* CARDS */
/* ========================= */

function carregarCards(){

let seguranca = 0;
let iva = 0;
let irc = 0;
let outros = 0;

contasPagar.forEach(item=>{

switch(item.entidade){

case "Segurança Social":
seguranca += item.valorTotal;
break;

case "IVA":
iva += item.valorTotal;
break;

case "IRC":
irc += item.valorTotal;
break;

default:
outros += item.valorTotal;

}

});

document.getElementById("totalSegurancaSocial").textContent =
formatarEuro(seguranca);

document.getElementById("totalIVA").textContent =
formatarEuro(iva);

document.getElementById("totalIRC").textContent =
formatarEuro(irc);

document.getElementById("totalOutros").textContent =
formatarEuro(outros);

}

/* ========================= */
/* LISTA DE PARCELAMENTOS */
/* ========================= */

function carregarParcelamentos(){

const listaHTML =
document.getElementById("listaParcelamentos");

if(!listaHTML){
return;
}

if(contasPagar.length===0){

listaHTML.innerHTML =

'<div class="alert alert-light">' +

'Nenhum parcelamento registado.' +

'</div>';

return;

}

listaHTML.innerHTML = "";

contasPagar.forEach(item=>{

listaHTML.innerHTML +=

'<div class="parcelamento-item" onclick="selecionarParcelamento(\''+

item.id+

'\')">' +

'<h5>' +

item.entidade +

'</h5>' +

'<p><strong>' +

item.descricao +

'</strong></p>' +

'<p>' +

item.quantidadeParcelas +

' parcelas</p>' +

'<p>' +

formatarEuro(item.valorTotal) +

'</p>' +

'</div>';

});

}

/* ========================= */
/* SELECIONAR PARCELAMENTO */
/* ========================= */

function selecionarParcelamento(id){

parcelamentoSelecionado =
procurarParcelamento(id);

if(!parcelamentoSelecionado){
return;
}

console.log(
"Parcelamento selecionado:",
parcelamentoSelecionado
);

/* Parte 4 preencherá os detalhes */

}

/* ========================= */
/* FIM PARTE 3 */
/* ========================= */


/* ========================= */
/* PARTE 4 DE 10 */
/* ========================= */

/* ========================= */
/* DETALHES DA CONTA */
/* ========================= */

function carregarDetalhesParcelamento(){

const detalhes =
document.getElementById("detalhesParcelamento");

const cronograma =
document.getElementById("cronogramaParcelas");

if(!parcelamentoSelecionado){

detalhes.innerHTML=

'<div class="alert alert-info">'+
'Selecione um parcelamento para visualizar os detalhes.'+
'</div>';

cronograma.innerHTML=

'<div class="alert alert-secondary">'+
'O cronograma será apresentado após selecionar um parcelamento.'+
'</div>';

desabilitarBotoes();

return;

}

const parcelasPagas=

parcelamentoSelecionado.parcelas.filter(

p=>p.dataPagamento

);

const parcelasPendentes=

parcelamentoSelecionado.parcelas.filter(

p=>!p.dataPagamento

);

const saldo=

parcelasPendentes.reduce(

(total,p)=>total+p.valor,

0

);

const proxima=

parcelasPendentes.length

? parcelasPendentes[0].vencimento

: "--";

detalhes.innerHTML=

'<strong>Entidade:</strong> '+parcelamentoSelecionado.entidade+'<br>'+

'<strong>Descrição:</strong> '+parcelamentoSelecionado.descricao+'<br>'+

'<strong>Processo:</strong> '+(parcelamentoSelecionado.processo||"--")+'<br>'+

'<strong>Valor Total:</strong> '+formatarEuro(parcelamentoSelecionado.valorTotal)+'<br>'+

'<strong>Parcelas:</strong> '+

parcelasPagas.length+

' / '+

parcelamentoSelecionado.quantidadeParcelas+

'<br>'+

'<strong>Saldo Restante:</strong> '+

formatarEuro(saldo)+

'<br>'+

'<strong>Próximo Vencimento:</strong> '+

(proxima==="--"

? "--"

: formatarData(proxima));

cronograma.innerHTML="";

parcelamentoSelecionado.parcelas.forEach(parcela=>{

let classe="parcela-avencer";
let icone="🟡";

if(parcela.dataPagamento){

classe="parcela-paga";
icone="✅";

}else{

const hoje=obterDataHoje();

if(parcela.vencimento<hoje){

classe="parcela-atrasada";
icone="🔴";

}

}

cronograma.innerHTML+=

'<div class="parcela-item '+classe+'">'+

'<div>'+

icone+

' Parcela '+parcela.numero+

'</div>'+

'<div>'+

formatarEuro(parcela.valor)+

'</div>'+

'<div>'+

formatarData(parcela.vencimento)+

'</div>'+

'</div>';

});

habilitarBotoes();

}

/* ========================= */
/* BOTÕES */
/* ========================= */

function habilitarBotoes(){

document.getElementById("btnRegistrarPagamento").disabled=false;

document.getElementById("btnEditarParcelamento").disabled=false;

document.getElementById("btnRenegociar").disabled=false;

document.getElementById("btnExcluirParcelamento").disabled=false;

}

function desabilitarBotoes(){

document.getElementById("btnRegistrarPagamento").disabled=true;

document.getElementById("btnEditarParcelamento").disabled=true;

document.getElementById("btnRenegociar").disabled=true;

document.getElementById("btnExcluirParcelamento").disabled=true;

}

/* ========================= */
/* ATUALIZAR SISTEMA */
/* ========================= */


/* ========================= */
/* FIM PARTE 4 */
/* ========================= */


/* ========================= */
/* PARTE 5 DE 10 */
/* ========================= */

/* ========================= */
/* REGISTRAR PAGAMENTO */
/* ========================= */

function registrarPagamento(numeroParcela){

if(!parcelamentoSelecionado){
return;
}

const parcela=

parcelamentoSelecionado.parcelas.find(

p=>p.numero===numeroParcela

);

if(!parcela){
return;
}

if(parcela.dataPagamento){

alert(
"Esta parcela já foi paga."
);

return;

}

const confirmar=

confirm(

"Confirmar pagamento da parcela "+numeroParcela+" ?"

);

if(!confirmar){
return;
}

parcela.dataPagamento=
obterDataHoje();

parcela.valorPago=
parcela.valor;

guardarDados();

atualizarSistema();

}

/* ========================= */
/* RECARREGAR DETALHES */
/* ========================= */

function atualizarSistema(){

carregarDados();

carregarCards();

carregarParcelamentos();

carregarDetalhesParcelamento();

}

/* ========================= */
/* ATUALIZAR CRONOGRAMA */
/* ========================= */

function carregarDetalhesParcelamento(){

const detalhes=

document.getElementById(
"detalhesParcelamento"
);

const cronograma=

document.getElementById(
"cronogramaParcelas"
);

if(!parcelamentoSelecionado){

detalhes.innerHTML=

'<div class="alert alert-info">'+
'Selecione um parcelamento.'+
'</div>';

cronograma.innerHTML=

'<div class="alert alert-secondary">'+
'Nenhuma parcela.'+
'</div>';

desabilitarBotoes();

return;

}

habilitarBotoes();

const pagas=

parcelamentoSelecionado.parcelas.filter(

p=>p.dataPagamento

).length;

const saldo=

parcelamentoSelecionado.parcelas

.filter(

p=>!p.dataPagamento

)

.reduce(

(total,p)=>total+p.valor,

0

);

detalhes.innerHTML=

'<strong>Entidade:</strong> '+

parcelamentoSelecionado.entidade+

'<br>'+

'<strong>Descrição:</strong> '+

parcelamentoSelecionado.descricao+

'<br>'+

'<strong>Parcelas:</strong> '+

pagas+

' / '+

parcelamentoSelecionado.quantidadeParcelas+

'<br>'+

'<strong>Saldo:</strong> '+

formatarEuro(saldo);

cronograma.innerHTML="";

parcelamentoSelecionado.parcelas.forEach(parcela=>{

let classe="parcela-avencer";

let emoji="🟡";

if(parcela.dataPagamento){

classe="parcela-paga";

emoji="✅";

}else if(

parcela.vencimento<obterDataHoje()

){

classe="parcela-atrasada";

emoji="🔴";

}

cronograma.innerHTML+=

'<div class="parcela-item '+classe+'">'+

'<div>'+

emoji+

' Parcela '+

parcela.numero+

'</div>'+

'<div>'+

formatarEuro(parcela.valor)+

'</div>'+

'<div>'+

formatarData(parcela.vencimento)+

'</div>'+

'<div>'+

(!parcela.dataPagamento

?

'<button class="btn btn-success btn-sm" onclick="registrarPagamento('+parcela.numero+')">Pagar</button>'

:

''

)+

'</div>'+

'</div>';

});

}

/* ========================= */
/* DISPONIBILIZAR FUNÇÃO */
/* ========================= */

window.registrarPagamento=
registrarPagamento;

/* ========================= */
/* FIM PARTE 5 */
/* ========================= */


/* ========================= */
/* PARTE 6 DE 10 */
/* ========================= */

/* ========================= */
/* EDITAR CONTA */
/* ========================= */

function editarConta(){

if(!parcelamentoSelecionado){
return;
}

document.getElementById("entidade").value =
parcelamentoSelecionado.entidade;

document.getElementById("descricao").value =
parcelamentoSelecionado.descricao;

document.getElementById("processo").value =
parcelamentoSelecionado.processo || "";

document.getElementById("valorTotal").value =
parcelamentoSelecionado.valorTotal;

document.getElementById("quantidadeParcelas").value =
parcelamentoSelecionado.quantidadeParcelas;

document.getElementById("primeiroVencimento").value =
parcelamentoSelecionado.primeiroVencimento;

document.getElementById("observacoes").value =
parcelamentoSelecionado.observacoes || "";

document.getElementById("parcelamentoOrigem").value =
parcelamentoSelecionado.id;

atualizarValorParcela();

atualizarResumoFormulario();

formulario.style.display = "block";

btnNovo.textContent = "Cancelar";

window.scrollTo({

top: formulario.offsetTop,

behavior: "smooth"

});

}

/* ========================= */
/* ATUALIZAR CONTA */
/* ========================= */

function atualizarConta(){

const id =
document.getElementById("parcelamentoOrigem").value;

if(!id){
return false;
}

const conta =
procurarParcelamento(id);

if(!conta){
return false;
}

conta.entidade =
document.getElementById("entidade").value;

conta.descricao =
document.getElementById("descricao").value;

conta.processo =
document.getElementById("processo").value;

conta.valorTotal =
parseFloat(
document.getElementById("valorTotal").value
);

conta.quantidadeParcelas =
parseInt(
document.getElementById("quantidadeParcelas").value
);

conta.primeiroVencimento =
document.getElementById("primeiroVencimento").value;

conta.observacoes =
document.getElementById("observacoes").value;

conta.valorParcela =
Number(
(
conta.valorTotal /
conta.quantidadeParcelas
).toFixed(2)
);

const novasParcelas = gerarParcelas(
    conta.quantidadeParcelas,
    conta.valorTotal,
    conta.primeiroVencimento
);

conta.parcelas =
preservarPagamentos(
    conta.parcelas,
    novasParcelas
);

guardarDados();

parcelamentoSelecionado = conta;

atualizarSistema();

limparFormulario();

formulario.style.display = "none";

btnNovo.textContent = "Novo";

alert(
"Conta atualizada com sucesso."
);

return true;

}

/* ========================= */
/* SUBMIT */
/* ========================= */

document
.getElementById("formContaPagar")
.addEventListener(
"submit",
function(e){

const origem =
document.getElementById("parcelamentoOrigem").value;

if(!origem){
return;
}

e.preventDefault();

atualizarConta();

});

/* ========================= */
/* BOTÃO EDITAR */
/* ========================= */

document
.getElementById("btnEditarParcelamento")
.addEventListener(
"click",
editarConta
);

/* ========================= */
/* FIM PARTE 6 */
/* ========================= */


/* ========================= */
/* PARTE 7 DE 10 */
/* ========================= */

/* ========================= */
/* EXCLUIR CONTA */
/* ========================= */

function excluirConta(){

if(!parcelamentoSelecionado){
return;
}

const confirmar = confirm(

"Tem certeza que deseja excluir esta conta?\n\nEsta ação não poderá ser desfeita."

);

if(!confirmar){
return;
}

const indice = contasPagar.findIndex(

item => item.id === parcelamentoSelecionado.id

);

if(indice === -1){
return;
}

contasPagar.splice(indice,1);

guardarDados();

parcelamentoSelecionado = null;

limparFormulario();

atualizarSistema();

alert("Conta excluída com sucesso.");

}

/* ========================= */
/* PRESERVAR PAGAMENTOS */
/* ========================= */

function preservarPagamentos(parcelasAntigas, parcelasNovas){

parcelasNovas.forEach(nova=>{

const antiga = parcelasAntigas.find(

p=>p.numero===nova.numero

);

if(!antiga){
return;
}

if(antiga.dataPagamento){

nova.dataPagamento = antiga.dataPagamento;

nova.valorPago = antiga.valorPago;

}

});

return parcelasNovas;

}

/* ========================= */
/* BOTÃO EXCLUIR */
/* ========================= */

document
.getElementById("btnExcluirParcelamento")
.addEventListener(

"click",

excluirConta

);

/* ========================= */
/* FIM PARTE 7 */
/* ========================= */

/* ========================= */
/* PARTE 8 DE 10 */
/* ========================= */

/* ========================= */
/* RESUMO DO MÊS */
/* ========================= */

function carregarResumoMes(){

let totalMes = 0;
let totalPago = 0;
let saldoAberto = 0;

const hoje = new Date();

const mes = hoje.getMonth();
const ano = hoje.getFullYear();

contasPagar.forEach(conta=>{

conta.parcelas.forEach(parcela=>{

const data =
new Date(parcela.vencimento);

if(

data.getMonth()===mes &&
data.getFullYear()===ano

){

totalMes += parcela.valor;

}

if(parcela.dataPagamento){

totalPago += parcela.valor;

}else{

saldoAberto += parcela.valor;

}

});

});

document.getElementById(
"valorMes"
).textContent =
formatarEuro(totalMes);

document.getElementById(
"saldoTotal"
).textContent =
formatarEuro(totalPago+saldoAberto);

document.getElementById(
"totalPago"
).textContent =
formatarEuro(totalPago);

document.getElementById(
"saldoAberto"
).textContent =
formatarEuro(saldoAberto);

}

/* ========================= */
/* FILTROS */
/* ========================= */

function aplicarFiltros(){

const entidade =
document.getElementById(
"filtroEntidade"
).value;

const pesquisa =
document.getElementById(
"pesquisa"
).value
.toLowerCase();

const competencia =
document.getElementById(
"competencia"
).value;

let lista =
contasPagar;

if(entidade){

lista = lista.filter(

c=>c.entidade===entidade

);

}

if(pesquisa){

lista = lista.filter(

c=>

c.descricao
.toLowerCase()
.includes(pesquisa)

);

}

if(competencia){

lista = lista.filter(conta=>{

return conta.parcelas.some(

parcela=>

parcela.vencimento.startsWith(
competencia
)

);

});

}

carregarParcelamentos(lista);

}

/* ========================= */
/* EVENTOS DOS FILTROS */
/* ========================= */

[

"filtroEntidade",

"competencia",

"pesquisa"

]

.forEach(id=>{

const campo =
document.getElementById(id);

if(campo){

campo.addEventListener(

"input",

aplicarFiltros

);

campo.addEventListener(

"change",

aplicarFiltros

);

}

});

/* ========================= */
/* AJUSTE */
/* ========================= */



/* ========================= */
/* FIM PARTE 8 */
/* ========================= */


/* ========================= */
/* PARTE 9 DE 10 */
/* ALERTAS AUTOMÁTICOS */
/* ========================= */

function carregarAlertas(){

const lista =
document.getElementById("listaAlertas");

if(!lista){
return;
}

let html = "";

const hoje = obterDataHoje();

const limite = new Date();

limite.setMonth(
limite.getMonth()+1
);

contasPagar.forEach(conta=>{

conta.parcelas.forEach(parcela=>{

if(parcela.dataPagamento){
return;
}

const vencimento =
new Date(parcela.vencimento);

let classe = "";

let titulo = "";

if(parcela.vencimento < hoje){

classe = "danger";

titulo = "🔴 Em atraso";

}else if(vencimento <= limite){

classe = "warning";

titulo = "🟡 Vence em breve";

}else{

return;

}

html += `

<div class="alert alert-${classe} mb-2">

<strong>${titulo}</strong><br>

${conta.entidade}<br>

Parcela ${parcela.numero}<br>

<strong>${formatarEuro(parcela.valor)}</strong><br>

Vencimento:
${formatarData(parcela.vencimento)}

</div>

`;

});

});

if(html===""){

html = `

<div class="alert alert-success">

✅ Nenhum alerta financeiro.

</div>

`;

}

lista.innerHTML = html;

}

/* ========================= */
/* PRÓXIMOS VENCIMENTOS */
/* ========================= */

function carregarProximosVencimentos(){

const lista =
document.getElementById(
"listaVencimentos"
);

if(!lista){
return;
}

let parcelas = [];

contasPagar.forEach(conta=>{

conta.parcelas.forEach(parcela=>{

if(!parcela.dataPagamento){

parcelas.push({

entidade:conta.entidade,

numero:parcela.numero,

valor:parcela.valor,

vencimento:parcela.vencimento

});

}

});

});

parcelas.sort(

(a,b)=>

new Date(a.vencimento)

-

new Date(b.vencimento)

);

let html="";

parcelas.forEach(item=>{

html += `

<div class="card-dashboard mb-2">

<strong>${item.entidade}</strong><br>

Parcela ${item.numero}<br>

${formatarEuro(item.valor)}<br>

${formatarData(item.vencimento)}

</div>

`;

});

if(html===""){

html = `

<div class="alert alert-success">

Nenhum vencimento pendente.

</div>

`;

}

lista.innerHTML = html;

}

/* ========================= */
/* HISTÓRICO */
/* ========================= */

function carregarHistorico(){

const lista =
document.getElementById(
"historicoFinanceiro"
);

if(!lista){
return;
}

let html="";

contasPagar.forEach(conta=>{

conta.parcelas.forEach(parcela=>{

if(parcela.dataPagamento){

html += `

<div class="card-dashboard mb-2">

<strong>${conta.entidade}</strong><br>

Parcela ${parcela.numero}<br>

Pagamento:
${formatarData(parcela.dataPagamento)}<br>

${formatarEuro(parcela.valorPago)}

</div>

`;

}

});

});

if(html===""){

html = `

<div class="alert alert-light">

Nenhum pagamento registado.

</div>

`;

}

lista.innerHTML = html;

}



