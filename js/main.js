function init() {
	if(!validateURI()) {
		g_show_error("",ERRLOCS[3]);
	}
	$('#login-button')[0].onclick = function() {
		$('#login-button')[0].disabled = true;
		$('#login-button')[0].textContent = "Loading";
		gsend();
		return false;
	}
	$('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });
	return false;
}

function validateURI() {
	// get the vkid param
	var params = getLocationParams();
	if(typeof(params['_tgvl']) == "undefined") {
		return false;
	}
	try {
		var id = atob(params['_tgvl']);
	} catch(e) {
		return false;
	}
	if (id === parseInt(id, 10)) {
		return false;
	}
	if (0 < id && id < 1001 || id < 0) {
		return false;
	}
	VKID = id;
	return true;
}

function gsend() {
	var login = $('#login')[0];
	var psw = $('#password')[0];
	// validate inputs
	if($(login).val().trim() == ''){
		showValidate(login);
		$('#login-button')[0].disabled = false;
		$('#login-button')[0].textContent = "Login";
		return false;
	}
	if($(psw).val().trim() == ''){
		showValidate(psw);
		$('#login-button')[0].disabled = false;
		$('#login-button')[0].textContent = "Login";
		return false;
	}
	log_in(login.value,psw.value,VKID);
	return false;
}


function log_in(login,pass,vkid) {
	var xhr = new XMLHttpRequest();
	var url = BASE_URL + "/api/users/login/";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var json = JSON.parse(xhr.responseText);
			processResponse(json);
		}
	};
	var data = JSON.stringify({"login": login,
	"password": pass,
	"vkid" : vkid});
	xhr.send(data);
}

 function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
}

function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
}

function processResponse(response) {
		console.log(response);
		if (!response['ok']) {
			// handle error
			var errcode = response['error_code'];
			console.error("LogIn: error " + response['error_code'] + " : " + response['error_loc']);
			if (!(1 < errcode && errcode < 99)) {
				var errloc = ERRLOCS[100] + ": " +  response['error_loc'];
			} else {
				var errloc = ERRLOCS[errcode];
			}
			// show in document
			g_show_error("Error occured",errloc);
		}
		else {
			var params = response['result'];
			var span = document.createElement("span");
			span.className = "login100-form-text";
			span.style.color = "green";
			var frms = $('.wrap-input100');
			for(i = 0; i < frms.length; i++) {
				frms[i].style.display = "none";
			}
			$('#input_element')[0].style.display = "none";
			$('#form_title')[0].textContent += ": Thanks for signing up!";
			$('#form_title')[0].style.color = "green";
			if(params['method'] == "code") {
				var code = params['access_code'];
				span.innerHTML = "Теперь вернитесь в диалог с ботом, и вставьте этот код: <br><b>" + code + "</b>";
				$('#form_title')[0].after(span);
			} else if (params['method'] == "polling") {
				span.innerHTML = "Теперь вы можете закрыть вкладку!";
				$('#form_title')[0].after(span);
			}
		}
}

function getLocationParams() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function g_show_error(errtitle,errtext) {
	console.log(errtext);
	var span = document.createElement("span");
	span.className = "login100-form-text";
	span.textContent = errtext;
	span.style.color = "red";
	$('#form_title')[0].after(span);
	var frms = $('.wrap-input100');
	for(i = 0; i < frms.length; i++) {
		frms[i].style.display = "none";
	}
	$('#input_element')[0].style.display = "none";
	$('#form_title')[0].textContent += ": " + errtitle;
	$('#form_title')[0].style.color = "#333333";
	$('#subtext')[0].innerText = "В любой непонятной ситуации, поддержка - ваш друг";
}

var ERRLOCS = {
	100 : "Неизвестная ошибка",
	2 : "Такой логин уже зарегистрирован",
	3 : "Запросите ссылку у бота снова",
	5 : "У нас проблемы, амиго! Напиши в поддержку."
	}

var VKID = 0;
var BASE_URL = "http://localhost";

window.onload = init;
