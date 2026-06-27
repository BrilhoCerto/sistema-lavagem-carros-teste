const perfil =
localStorage.getItem("perfil");

const utilizador =
localStorage.getItem("utilizador");

/* GESTOR */

function isGestor(){

return perfil === "gestor";

}

/* ADMINISTRADOR */

function isAdministrador(){

return perfil === "administrador";

}

/* FUNCIONÁRIO */

function isFuncionario(){

return perfil === "funcionario";

}

/* CONTROLO DE ACESSO */

function semPermissao(){

alert(
"Ação não permitida.\n\nSolicite autorização ao Gestor."
);

return false;

}

/* MENU DINÂMICO */

function aplicarPermissoesMenu(){

const perfil =
localStorage.getItem("perfil");

/* FUNCIONÁRIO */

if(perfil === "funcionario"){

document
.querySelectorAll(".menu-restrito")
.forEach(item => {

item.style.display = "none";

});

}

/* ADMINISTRADOR */

if(perfil === "administrador"){

document
.querySelectorAll(".menu-funcionario")
.forEach(item => {

item.style.display = "none";

});

}

}
