$(function () {

	window.WebSocket = window.WebSocket || window.MozWebSocket;

	var connection = new WebSocket("ws://" + window.location.host);
    const TYPE_ADMIN = 2;
    const RESTART = 0;
	connection.onopen = function () {
		$('body').html('<div style="text-align:center;"><label for="adminNumber">Mise de départ pour chaque joueur : </label><br><input type="number" name="adminNumber"><input type="button" value="Valider" style="margin-left:5px;"></div>');
		$('input[type="button"]').on('click', function (){
            if ($('input[type="number"]').val() != '') {
                connection.send(JSON.stringify([TYPE_ADMIN, RESTART, $('input[type="number"]').val()]));
                console.log("Nouvelle mise de départ");
            }
        });
	};

	connection.onerror = function (error) {
		console.log(error);
	};

	connection.onmessage = function (message) {

    };
});