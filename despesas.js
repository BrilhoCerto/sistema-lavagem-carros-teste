import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const perfilDespesa =
localStorage.getItem("perfil");

if(!perfilDespesa){

window.location.href =
"login.html";

}
if(perfilDespesa === "funcionario"){
    window.location.href = "pagamentos.html";
}
let despesas = [];

const despesasRef = collection(db, "despesas");

onSnapshot(despesasRef, (snapshot) => {

    despesas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    carregarTabela();
    atualizarCards();
    atualizarCartoes();

});

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

"Cartões":[
"Cartão Crédito Samuel CCA",
"Cartão Crédito Samuel Millenium",
"Cartão Crédito Samuel Cetelem",
"Cartão Crédito Eliane"
],

"Outros":[
"Diversos"
]

};

/* CARREGAR CATEGORIAS */

document
.getElementById("categoria")
.addEventListener(
"change",
function(){

const categoria =
this.value;

const select =
document.getElementById(
"subcategoria"
);

select.innerHTML =
'<option value="">Selecione</option>';

if(!subcategorias[categoria]){
    alert("Categoria não encontrada: " + categoria);
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

}
);

/* FILTRO CATEGORIA */

const filtroCategoria =
document.getElementById(
"filtroCategoria"
);

Object.keys(subcategorias)
.forEach(cat=>{

const option =
document.createElement("option");

option.value = cat;
option.textContent = cat;

filtroCategoria.appendChild(option);

});

/* SALVAR */

document
.getElementById("formDespesa")
.addEventListener(
"submit",
async function(e){

e.preventDefault();

const agora =
new Date();

const data =
agora.toISOString().split("T")[0];

const hora =
agora.toLocaleTimeString(
"pt-PT",
{
hour:'2-digit',
minute:'2-digit'
}
);

const novaDespesa = {

id: Date.now(),

data,

hora,

dataDespesa:
document.getElementById("dataDespesa").value,

origem:
document.getElementById("origem").value,

categoria:
document.getElementById("categoria").value,

subcategoria:
document.getElementById("subcategoria").value,

valor:
parseFloat(
document.getElementById("valor").value
),

tipo:   
document.getElementById("origem").value === "Cartões"
? "cartao"
: "normal",

statusCartao:
document.getElementById("origem").value === "Cartões"
? "Aberto"
: "",

observacoes:
document.getElementById("observacoes").value

};

await addDoc(despesasRef, novaDespesa);

document
.getElementById("formDespesa")
.reset();

carregarTabela();

atualizarCards();

alert(
"Despesa registada com sucesso."
);

}
);

/* CARREGAR TABELA */

function carregarTabela(lista = despesas){

const tbody =
document.getElementById(
"tabelaDespesas"
);

tbody.innerHTML = "";

lista
.sort((a,b)=>
new Date(b.data) -
new Date(a.data)
)
.forEach(item=>{

tbody.innerHTML += `

<tr>

<td>${item.dataDespesa || item.data}</td>

<td>${item.origem}</td>

<td>${item.categoria}</td>

<td>${item.subcategoria}</td>

<td>€ ${item.valor.toFixed(2)}</td>

<td>${item.observacoes || ''}</td>
<td>
<button onclick="excluirDespesa('${item.id}')">
Excluir
</button>
</td>
</tr>

`;

});

}

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

let totalHoje = 0;
let totalMes = 0;

despesas.forEach(item=>{

if(item.data === hoje){

totalHoje += item.valor;

}

const data =
new Date(item.data);

if(
data.getMonth() === mesAtual
&&
data.getFullYear() === anoAtual
){

totalMes += item.valor;

}

});

document
.getElementById("despesasHoje")
.textContent =
"€ " + totalHoje.toFixed(2);

document
.getElementById("despesasMes")
.textContent =
"€ " + totalMes.toFixed(2);

document
.getElementById("saldoMes")
.textContent =
"€ " + (-totalMes).toFixed(2);

}

function atualizarCartoes(){

let totais = {

cca: 0,
millenium: 0,
cetelem: 0,
eliane: 0

};

despesas.forEach(item => {

if(
item.origem !== "cartao"
||
item.statusCartao === "Pago"
){
return;
}

const valor =
Number(item.valor || 0);

if(
item.subcategoria ===
"Cartão Crédito Samuel CCA"
){
totais.cca += valor;
}

if(
item.subcategoria ===
"Cartão Crédito Samuel Millenium"
){
totais.millenium += valor;
}

if(
item.subcategoria ===
"Cartão Crédito Samuel Cetelem"
){
totais.cetelem += valor;
}

if(
item.subcategoria ===
"Cartão Crédito Eliane"
){
totais.eliane += valor;
}

});

document
.getElementById("cartaoCCA")
.textContent =
"€ " + totais.cca.toFixed(2);

document
.getElementById("cartaoMillenium")
.textContent =
"€ " + totais.millenium.toFixed(2);

document
.getElementById("cartaoCetelem")
.textContent =
"€ " + totais.cetelem.toFixed(2);

document
.getElementById("cartaoEliane")
.textContent =
"€ " + totais.eliane.toFixed(2);

}

/* FILTROS */

function filtrarDespesas(){

let resultado =
[...despesas];

const inicio =
document.getElementById(
"filtroInicio"
).value;

const fim =
document.getElementById(
"filtroFim"
).value;

const categoria =
document.getElementById(
"filtroCategoria"
).value;

const origem =
document.getElementById(
"filtroOrigem"
).value;

if(inicio){

resultado =
resultado.filter(
d => d.data >= inicio
);

}

if(fim){

resultado =
resultado.filter(
d => d.data <= fim
);

}

if(categoria){

resultado =
resultado.filter(
d => d.categoria === categoria
);

}

if(origem){

resultado =
resultado.filter(
d => d.origem === origem
);

}

carregarTabela(resultado);

}

/* LOGOUT */

function logout(){

    if(!confirm("Deseja realmente sair do sistema?")){
        return;
    }

    localStorage.removeItem(
    "perfil"
    );

    window.location.href =
    "login.html";

}
async function excluirDespesa(id){

    if(!confirm("Deseja excluir esta despesa?")){
        return;
    }

    await deleteDoc(
        doc(db, "despesas", id)
    );

}
window.excluirDespesa = excluirDespesa;

/* INICIALIZAÇÃO */

carregarTabela();

atualizarCards();
