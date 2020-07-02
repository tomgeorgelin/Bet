const TYPE_SCREEN = 1;

$(function () {
	window.WebSocket = window.WebSocket || window.MozWebSocket;

	var connection = new WebSocket("ws://" + window.location.host);

	connection.onopen = function () {
		connection.send(JSON.stringify([TYPE_SCREEN]));
	};

	connection.onerror = function (error) {
		console.log(error);
	};

	connection.onmessage = function (message) {
		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('Le json ne doit pas être valide: ', message.data);
			return;
		}

		$('#potMoney').html(json[0]);
		$('#names').html('');
		players = json[1];
		players.sort((a, b) => b.money - a.money);
		players.forEach((e, index) => {
			if (index%2 == 0) {
				$('#names').append($("<div style='background-color:#1f5241;' class='result'><span id='resultIndex'>"+(index+1)+"</span>"+"<span id='resultName'>"+e.name+"</span>"+"<span id='resultMoney'>"+e.money+"</span>"+"</div>"));
			}
			else {
				$('#names').append($("<div class='result'><span id='resultIndex'>"+(index+1)+"</span>"+"<span id='resultName'>"+e.name+"</span>"+"<span id='resultMoney'>"+e.money+"</span>"+"</div>"));
			}
		});
	};
});