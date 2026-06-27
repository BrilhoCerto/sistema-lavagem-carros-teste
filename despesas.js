const perfilDespesa =
localStorage.getItem("perfil");

if(!perfilDespesa){

window.location.href =
"login.html";

}
if(perfil === "funcionario"){
    window.location.href = "pagamentos.html";
}
let despesas =
JSON.parse(
localStorage.getItem("despesas")
) || [];

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
function(e){

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

observacoes:
document.getElementById("observacoes").value

};

despesas.push(novaDespesa);

localStorage.setItem(
"despesas",
JSON.stringify(despesas)
);

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
function excluirDespesa(id){

if(!confirm("Deseja excluir esta despesa?")){
return;
}

despesas = despesas.filter(
item => item.id != id
);

localStorage.setItem(
"despesas",
JSON.stringify(despesas)
);

carregarTabela();
atualizarCards();

}
/* INICIALIZAÇÃO */

carregarTabela();

atualizarCards();
