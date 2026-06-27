const perfilRelatorio = localStorage.getItem("perfil");

if (!perfilRelatorio) {
    window.location.href = "login.html";
}
if(perfilRelatorio === "funcionario"){
    window.location.href = "pagamentos.html";
}
const pagamentos =
JSON.parse(localStorage.getItem("pagamentos")) || [];

const despesas =
JSON.parse(localStorage.getItem("despesas")) || [];

/* FORMATAR DATA */

function formatarData(data){

    const partes = data.split("-");

    return partes[2] + "/" +
           partes[1] + "/" +
           partes[0];

}

/* FILTRO */

function obterPeriodo(){

    const filtro =
    document.getElementById("filtroPeriodo").value;

    const hoje = new Date();

    let inicio;
    let fim;

    switch(filtro){

        case "hoje":

            inicio = new Date();
            fim = new Date();

        break;

        case "ontem":

            inicio = new Date();
            inicio.setDate(inicio.getDate() - 1);

            fim = new Date(inicio);

        break;

        case "semana":

            inicio = new Date();
            inicio.setDate(
            inicio.getDate() - 7
            );

            fim = new Date();

        break;

        case "mes":

            inicio = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
            );

            fim = new Date();

        break;

        case "ano":

            inicio = new Date(
            hoje.getFullYear(),
            0,
            1
            );

            fim = new Date();

        break;

        case "personalizado":

            const dataInicial =
            document.getElementById(
            "dataInicial"
            ).value;

            const dataFinal =
            document.getElementById(
            "dataFinal"
            ).value;

            if(!dataInicial || !dataFinal){

                alert(
                "Selecione a data inicial e final."
                );

                return null;

            }

            inicio =
            new Date(dataInicial);

            fim =
            new Date(dataFinal);

        break;

        default:

            inicio = new Date();
            fim = new Date();

    }

    inicio.setHours(0,0,0,0);
    fim.setHours(23,59,59,999);

    return {
        inicio,
        fim
    };

}

/* RELATÓRIOS */

function carregarRelatorios(){

    const periodo =
    obterPeriodo();

    if(!periodo){
        return;
    }

    let receitas = 0;
    let despesasTotal = 0;
    let veiculos = 0;

    const tabela =
    document.getElementById(
    "tabelaMovimentos"
    );

    tabela.innerHTML = "";

    pagamentos.forEach(item => {

        const data =
        new Date(item.data);

        const pago =
        item.status &&
        item.status.startsWith("Pago");

        if(
            data >= periodo.inicio
            &&
            data <= periodo.fim
            &&
            pago
        ){

            receitas +=
            Number(item.valor || 0);

            veiculos++;

            tabela.innerHTML += `
            <tr>
                <td>${formatarData(item.data)}</td>
                <td>Receita</td>
                <td>${item.cliente}</td>
                <td>€ ${Number(item.valor).toFixed(2)}</td>
            </tr>
            `;

        }

    });

    despesas.forEach(item => {

        const data =
        new Date(item.data);

        if(
            data >= periodo.inicio
            &&
            data <= periodo.fim
        ){

            despesasTotal +=
            Number(item.valor || 0);

            tabela.innerHTML += `
            <tr>
                <td>${formatarData(item.data)}</td>
                <td>Despesa</td>
                <td>${item.categoria || "Despesa"}</td>
                <td>€ ${Number(item.valor).toFixed(2)}</td>
            </tr>
            `;

        }

    });

    const saldo =
    receitas - despesasTotal;

    document.getElementById("receitaHoje")
    .textContent =
    "€ " + receitas.toFixed(2);

    document.getElementById("despesaHoje")
    .textContent =
    "€ " + despesasTotal.toFixed(2);

    document.getElementById("saldoHoje")
    .textContent =
    "€ " + saldo.toFixed(2);

    document.getElementById("veiculosHoje")
    .textContent =
    veiculos;

    document.getElementById("totalReceitas")
    .textContent =
    "€ " + receitas.toFixed(2);

    document.getElementById("totalDespesas")
    .textContent =
    "€ " + despesasTotal.toFixed(2);

    document.getElementById("saldoPeriodo")
    .textContent =
    "€ " + saldo.toFixed(2);

}

/* EVENTOS */

document
.getElementById("btnAplicarFiltro")
.addEventListener(
"click",
carregarRelatorios
);

document
.getElementById("filtroPeriodo")
.addEventListener(
"change",
carregarRelatorios
);

/* INICIAR */

carregarRelatorios();

function logout(){

if(!confirm("Deseja sair do sistema?")){
return;
}

localStorage.removeItem("perfil");

window.location.href =
"login.html";

}
