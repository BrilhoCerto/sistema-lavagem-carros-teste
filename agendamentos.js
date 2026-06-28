import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
query,
where,
deleteDoc,
doc,
updateDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let calendario;

let agendamentos = [];

let agendamentoEditando = null;

let diaSelecionado = null;

async function carregarAgendamentosFirebase() {

    const snapshot =
    await getDocs(collection(db, "agendamentos"));
    agendamentos = [];
    
    console.log("Carregando agendamentos do Firebase...");
    );

   snapshot.forEach((doc) => {

    agendamentos.push(doc.data());

});

    console.log(
        "TOTAL AGENDAMENTOS:",
        agendamentos.length
    );
}


/* HORÁRIOS */

function carregarHorarios(){

const selectHora =
document.getElementById("hora");

selectHora.innerHTML = "";

for(let hora=8; hora<=18; hora++){

for(let minuto of [0,15,30,45]){

if(hora === 18 && minuto === 0){
continue;
}

const horario =
String(hora).padStart(2,'0')
+ ':'
+
String(minuto).padStart(2,'0');

const option =
document.createElement("option");

option.value = horario;
option.textContent = horario;

selectHora.appendChild(option);

}

}

}

/* CALENDÁRIO */

document.addEventListener('DOMContentLoaded', async function(){

await carregarAgendamentosFirebase();

carregarHorarios();

const calendarEl =
document.getElementById('calendar');

calendario =
new FullCalendar.Calendar(calendarEl, {

initialView: 'dayGridMonth',

locale: 'pt',

slotMinTime: '08:00:00',
slotMaxTime: '18:00:00',
scrollTime: '08:00:00',

slotDuration: '00:15:00',
slotLabelInterval: '00:15:00',

slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
},
displayEventTime: false,
allDaySlot: false,

height: 700,

hiddenDays: [0],

headerToolbar: {

left: 'prev,next today',

center: 'title',

right: 'timeGridDay,timeGridWeek,dayGridMonth'

},
eventContent: function(info){

    const view = info.view.type;

    if(view === "dayGridMonth"){

        return {
            html: `
                <div>
                    ${info.event.start.toLocaleTimeString('pt-PT',{
                        hour:'2-digit',
                        minute:'2-digit'
                    })}
                    <br>
                    ${info.event.extendedProps.cliente || 'Sem nome'}
                    <br>
                    ${info.event.extendedProps.modelo || ''}
                </div>
            `
        };

    }

    if(view === "timeGridWeek"){

        return {
            html: `
                <div>
                    ${info.event.extendedProps.cliente || 'Sem nome'}
                    <br>
                    ${info.event.extendedProps.modelo || ''}
                </div>
            `
        };

    }

    return {
        html: `
            <div>
    ${info.event.extendedProps.cliente || 'Sem nome'}
    /
    ${info.event.extendedProps.modelo || ''}
    /
    ${
        Array.isArray(info.event.extendedProps.servicos)
        ? info.event.extendedProps.servicos.join(', ')
        : info.event.extendedProps.servicos || ''
    }
    ${
        info.event.extendedProps.observacoes
        ? ' / Obs: ' + info.event.extendedProps.observacoes
        : ''
    }
</div>
        `
    };

},
eventDidMount: function(info){

info.el.style.backgroundColor = "#dc3545";
info.el.style.borderColor = "#dc3545";
info.el.style.color = "#fff";
const hora = info.el.querySelector('.fc-event-time');

    if(hora){
        hora.style.display = 'none';
    }
},

dateClick: function(info){
selecionarDia(info.dateStr);
},

eventClick: function(info){
abrirAgendamento(info.event.id);
}

});

calendario.render();
await carregarAgendamentosFirebase();
atualizarCalendario();

});

/* SELEÇÃO DE DIA */

function selecionarDia(data){

diaSelecionado = data;

document
.querySelectorAll(".fc-daygrid-day")
.forEach(d=>{

d.classList.remove("fc-day-selecionado");

});

const celulas =
document.querySelectorAll("[data-date='"+data+"']");

celulas.forEach(c=>{

c.classList.add("fc-day-selecionado");

});

mostrarAgendamentosDoDia(data);
limparFormulario();
document
.getElementById("data")
.value = data;

}

/* LISTAGEM DO DIA */

function mostrarAgendamentosDoDia(data){

    const lista =
    document.getElementById("listaDia");

    const pagamentos =
    JSON.parse(localStorage.getItem("pagamentos")) || [];

    const agendamentosDia =
    agendamentos.filter(a => a.data === data);

    const ativos = [];
    const concluidos = [];

    agendamentosDia.forEach(item => {

        const pago =
        pagamentos.some(
            p => String(p.agendamentoId) === String(item.id)
        );

        if(pago){
            concluidos.push(item);
        }else{
            ativos.push(item);
        }

    });

    lista.innerHTML = "";

    /* ATIVOS */

    lista.innerHTML += `
        <h6 class="mt-2 mb-2">
            📅 Agendamentos Ativos
        </h6>
    `;

    if(ativos.length === 0){

        lista.innerHTML += `
            <p>Nenhum agendamento ativo.</p>
        `;

    }else{

        ativos
        .sort((a,b)=>a.hora.localeCompare(b.hora))
        .forEach(item=>{

            lista.innerHTML += `
            <div
            class="agendamento-item"
            onclick="abrirAgendamento('${item.id}')">

                <strong>${item.hora}</strong><br>
                ${item.cliente}<br>
                ${item.modelo}

            </div>
            `;

        });

    }

    /* CONCLUÍDOS */

    lista.innerHTML += `
        <hr>
        <h6 class="mt-3 mb-2 text-success">
            ✅ Agendamentos Concluídos
        </h6>
    `;

    if(concluidos.length === 0){

        lista.innerHTML += `
            <p>Nenhum concluído.</p>
        `;

    }else{

        concluidos
        .sort((a,b)=>a.hora.localeCompare(b.hora))
        .forEach(item=>{

            lista.innerHTML += `
            <div
            class="agendamento-item"
            style="
                border-left:5px solid green;
                opacity:0.8;
            "
            onclick="abrirAgendamento('${item.id}')">

                <strong>✅ ${item.hora}</strong><br>
                ${item.cliente}<br>
                ${item.modelo}

            </div>
            `;

        });

    }

}

/* CALENDÁRIO */

function atualizarCalendario(){

calendario.removeAllEvents();

agendamentos.forEach(item=>{

if (!item.data || !item.hora) {
    console.log("Agendamento inválido:", item);
    return;
}    
    
calendario.addEvent({
    id: item.id,
    title:
(item.cliente || "Sem nome") +
"\n" +
(item.modelo || "") +
"\n" +
(
Array.isArray(item.servicos)
? item.servicos.join(", ")
: item.servicos || ""
) +
(item.observacoes
? "\nObs: " + item.observacoes
: ""),
    start: item.data + "T" + item.hora,

end: item.data && item.hora
    ? new Date(
        new Date(item.data + "T" + item.hora)
        .getTime() + (15 * 60000)
      ).toISOString()
    : null,

    extendedProps: {
        cliente: item.cliente,
        telefone: item.telefone,
        modelo: item.modelo,
        servicos: item.servicos,
        valor: item.valor,
        observacoes: item.observacoes
    }
});

});

}

/* ABRIR AGENDAMENTO */

function abrirAgendamento(id){

const item =
agendamentos.find(a => a.id === id);

if(!item) return;

agendamentoEditando = id;

document
.getElementById("cliente")
.value = item.cliente;

document
.getElementById("telefone")
.value = item.telefone;

document
.getElementById("modelo")
.value = item.modelo;

document
.getElementById("data")
.value = item.data;

document
.getElementById("hora")
.value = item.hora;

document
.getElementById("valor")
.value = item.valor;

document
.getElementById("observacoes")
.value = item.observacoes;

document
.querySelectorAll(
'.servico-item input[type="checkbox"]'
)
.forEach(cb=>{

cb.checked =
Array.isArray(item.servicos) &&
item.servicos.includes(cb.value);

});

document
.getElementById("btnSalvar")
.style.display = "none";

document
.getElementById("btnAtualizar")
.style.display = "block";

}

/* LIMPAR FORMULÁRIO */

function limparFormulario(){

document.getElementById("formAgendamento").reset();

document
.querySelectorAll(
'.servico-item input[type="checkbox"]'
)
.forEach(cb => cb.checked = false);

agendamentoEditando = null;

document
.getElementById("btnSalvar")
.style.display = "block";

document
.getElementById("btnAtualizar")
.style.display = "none";

}

/* CAPTURA SERVIÇOS */

function obterServicos(){

const servicos = [];

document
.querySelectorAll(
'.servico-item input[type="checkbox"]:checked'
)
.forEach(cb => {

servicos.push(cb.value);

});

return servicos;

}

/* VERIFICA DUPLICIDADE */

function horarioOcupado(data,hora,idIgnorar=null){

return agendamentos.some(a =>

a.data === data
&&
a.hora === hora
&&
a.id !== idIgnorar

);

}

/* SALVAR NOVO */

document
.getElementById("formAgendamento")
.addEventListener("submit", async function(e){

e.preventDefault();

const cliente =
document.getElementById("cliente").value;

const telefone =
document.getElementById("telefone").value;

const modelo =
document.getElementById("modelo").value;

const data =
document.getElementById("data").value;

const hora =
document.getElementById("hora").value;

const valor =
document.getElementById("valor").value;

const observacoes =
document.getElementById("observacoes").value;

const servicos =
obterServicos();

if(
    !cliente.trim() ||
    !telefone.trim() ||
    !modelo.trim() ||
    !data ||
    !hora ||
    servicos.length === 0 ||
    !valor ||
    parseFloat(valor) <= 0
){

    alert("Preencha todos os campos obrigatórios.");
    return;

}

    
/* DUPLICIDADE */

if(horarioOcupado(data,hora)){

alert(
"Este horário já possui um agendamento."
);

return;

}

const novo = {

id: Date.now().toString(),

cliente,
telefone,
modelo,
data,
hora,
valor,
observacoes,
servicos

};

agendamentos.push(novo);
  
await addDoc(collection(db, "agendamentos"), novo);

localStorage.setItem(
"agendamentos",
JSON.stringify(agendamentos)
);

atualizarCalendario();

mostrarAgendamentosDoDia(data);

alert("Agendamento criado com sucesso.");

formularioAlterado = false;

limparFormulario();
});

/* ATUALIZAR */

document
.getElementById("btnAtualizar")
.addEventListener("click", async function(){

if(!agendamentoEditando){
return;
}

const cliente =
document.getElementById("cliente").value;

const telefone =
document.getElementById("telefone").value;

const modelo =
document.getElementById("modelo").value;

const data =
document.getElementById("data").value;

const hora =
document.getElementById("hora").value;

const valor =
document.getElementById("valor").value;

const observacoes =
document.getElementById("observacoes").value;

const servicos =
obterServicos();

/* CAMPOS OBRIGATÓRIOS */

if(
    !cliente ||
    !telefone ||
    !modelo ||
    !data ||
    !hora ||
    !valor ||
    servicos.length === 0
){

    alert("Preencha todos os campos obrigatórios.");

    return;
}
    
/* DUPLICIDADE */

if(
horarioOcupado(
data,
hora,
agendamentoEditando
)
){

alert(
"Já existe um agendamento nesse horário."
);

return;

}

const indice =
agendamentos.findIndex(
a => a.id === agendamentoEditando
);

if(indice === -1){
return;
}
const q = query(
    collection(db, "agendamentos"),
    where("id", "==", agendamentoEditando)
);

const snapshot = await getDocs(q);

if (snapshot.empty) {
    alert("Agendamento não encontrado.");
    return;
}

const documento = snapshot.docs[0];

await updateDoc(documento.ref, {
    cliente,
    telefone,
    modelo,
    data,
    hora,
    valor,
    observacoes,
    servicos
});
    
agendamentos[indice] = {

id: agendamentoEditando,

cliente,
telefone,
modelo,
data,
hora,
valor,
observacoes,
servicos

};

localStorage.setItem(
"agendamentos",
JSON.stringify(agendamentos)
);

atualizarCalendario();

mostrarAgendamentosDoDia(data);

alert("Agendamento atualizado.");
formularioAlterado = false;
limparFormulario();

});

/* EXCLUIR */

async function excluirAgendamento(){

if(!agendamentoEditando){
return;
}

if(
!confirm(
"Deseja apagar este agendamento?"
)
){
return;
}

try{
console.log("ID para apagar:", agendamentoEditando);
const q = query(
collection(db,"agendamentos"),
where("id","==",agendamentoEditando)
);

const snapshot = await getDocs(q);
console.log("Documentos encontrados:", snapshot.size);
for(const documento of snapshot.docs){

await deleteDoc(
doc(db,"agendamentos",documento.id)
);

}

agendamentos =
agendamentos.filter(
a => a.id !== agendamentoEditando
);

localStorage.setItem(
"agendamentos",
JSON.stringify(agendamentos)
);

atualizarCalendario();

if(diaSelecionado){
mostrarAgendamentosDoDia(diaSelecionado);
}

alert("Agendamento removido.");
formularioAlterado = false;
limparFormulario();

}catch(erro){

console.error(erro);
alert("Erro ao apagar agendamento.");

}

}
if(localStorage.getItem("perfil") === "funcionario"){

    const despesas =
    document.getElementById("menuDespesas");

    if(despesas){
        despesas.style.display = "none";
    }

    const relatorios =
    document.getElementById("menuRelatorios");

    if(relatorios){
        relatorios.style.display = "none";
    }

}
 let formularioAlterado = false;

document.querySelectorAll(
"input, select, textarea"
).forEach(campo => {

    campo.addEventListener(
        "change",
        () => {
            formularioAlterado = true;
        }
    );

});

window.addEventListener(
    "beforeunload",
    function(e){

        if(formularioAlterado){

            e.preventDefault();
            e.returnValue = "";

        }

    }
);
 function confirmarSaida(destino){

    if(formularioAlterado){

        const sair = confirm(
            "Existem alterações não salvas. Deseja sair mesmo assim?"
        );

        if(!sair){
            return;
        }

    }

    location.href = destino;

}
window.confirmarSaida = confirmarSaida;
window.excluirAgendamento = excluirAgendamento;

function logout(){

if(!confirm("Deseja sair do sistema?")){
return;
}

localStorage.removeItem("perfil");

window.location.href =
"login.html";

}
window.logout = logout;

console.log("FUNÇÃO EXCLUIR REGISTRADA");
