$(function () {

	window.WebSocket = window.WebSocket || window.MozWebSocket;

	var connection = new WebSocket("ws://" + window.location.host);
	let start = false;
	let money;
	const TYPE_MONEY = 0;
	const WIN = 1;
	const IWIN = 2;

	connection.onopen = function () {
		$('body').html('<div id="pseudo"><label>Entrez votre pseudo</label><br><input type="text" name="pseudo" placeholder="Votre pseudo" required="required"><br><input type="button" name="sendPseudo" value="Valider"></div>');
		$('input[name = "sendPseudo"]').on('click', function() {
			let data = [0,0, $("input[name = 'pseudo']").val()];
			$('body').html("<div id='uAre'>Votre pseudo est : \" "+$("input[name = 'pseudo']").val()+" \"</div>");
			connection.send(JSON.stringify(data));
		});
	};

	connection.onerror = function (error) {
		console.log(error);
	};

	connection.onmessage = function (message) {

		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('Le json n\'est pas valide: ', message.data);return;
		}

		switch(json[0]) {

			case TYPE_MONEY: 
				if (!start) {
					start = true;

					$('body').html($('body').html()+'<div id="money">Argent : <span id="moneyNb"></span></div><div id="bet"><input type="number" name="bet" placeholder="0" required="required"><br><input type="button" name="sendBet" value="Miser"></div><div id="iwindiv"><input type="button" name="iwin" value="Je gagne"></div>');

					$('input[name = "sendBet"]').on('click', function() {
					if ((parseInt(json[1])-$('input[name = "bet"]').val()) >= 0 && $('input[name = "bet"]').val() > 0) {
							let data = [0,1, $('input[name = "bet"]').val()]; 
							connection.send(JSON.stringify(data));
							$('input[name = "bet"]').val('');
							$('#iwindiv').show();
					}
					});
					$('input[name = "iwin"]').on('click', function() {
						$('#iwindiv').hide();
						connection.send(JSON.stringify([0, 2]));
					});
				}
				$('#moneyNb').html(parseInt(json[1]));
			break;

			case WIN:
				$('body').html($('body').html()+'<div id="winButtons">Est ce que ' + json[1].name + ' a gagné ?<br><input type="button" name="ywin" value="oui"><input type="button" name="nwin" value="non"></div>');
				$("#iwindiv").hide();
				$('input[name = "ywin"]').on('click', function() {
					connection.send(JSON.stringify([0, 3]));
				});
				$('#winButtons input').on('click', function() {
					$('#winButtons').hide();
				});
				break;
			case IWIN:
				$('#moneyNb').html(parseInt($('#moneyNb').html()) + parseInt(json[1]));
				break;
		}
	};
});