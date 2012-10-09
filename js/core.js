$(function() {
	var Workspace = Backbone.Router.extend({
	  	routes: {
	    	"":"index",
	    	"start":"start"
	  	},
	  	index: function() {
			$('.step').hide();
			indexView.render();
			$('.index').show();
		},
		start: function() {
			$('.step').hide();
			tournamentView.render();
			$('.tournament').show();
	  	}
	});
	
	var IndexView = Backbone.View.extend({
		initialize: function() {
			var source = $("#player-template").html();
			this.template = Handlebars.compile(source);
			this.render();
		},
		events: {
			'click .add': 'newPlayer',
			'click .start': 'startTournament'
		},
		newPlayer: function(event) {
			var name = $('.new-tournament .player').val();
			if (name.length == 0) {
				alert('enter a name');
				return;
			}
			
			this.addPlayer(name)
		},
		addPlayer: function(name) {
			var player = {name:name};
			this.model.get('players').push(player);
			this.render();	
		},
		startTournament: function() {
			var name = $('.new-tournament .player').val();
			if (name.length > 0) {
				this.addPlayer(name);
			}
			
			this.model.set({name:$('.name').val()});
			
			if (this.model.get('players').length == 0) {
				alert('add players');
				return false;
			}
			
			if (this.model.get('name').length == 0) {
				alert('enter name');
				return false;
			}
			
			tournament.set('ladder', []);
			_.each(tournament.get('players'), function(player) { 
				tournament.get('ladder').push({name:player.name, win:0, loss:0, draw:0, points:0, goalsfor:0, goalsagainst:0});
			});
			
			return true;
		},
	  	render: function() {
			var html = this.template(this.model.toJSON());
			$(this.el).html(html);
	  	}
	});
	
	var TournamentView = Backbone.View.extend({
		initialize: function() {
			var source = $("#tournament-template").html();
			this.template = Handlebars.compile(source);
			this.render();
		},
		events: {
			'click .add': 'addGame'
		},
		addGame: function() {
			var player1name = $('.player1').val();
			var player1 = _.find(this.model.get('ladder'), function(item) {return item.name == player1name});

			var player2name = $('.player2').val();
			var player2 = _.find(this.model.get('ladder'), function(item) {return item.name == player2name});
			
			var score1 = parseInt($('.score1').val());
			var score2 = parseInt($('.score2').val());
		
			if (score1 < score2) {
				player2.win++;
				player2.points += 3;
				player1.loss++;
			}
			
			if (score1 > score2) {
				player1.win++;
				player1.points += 3;
				player2.loss++;
			}
			
			if (score1 == score2) {
				player2.draw++;
				player2.points += 1;
				player1.draw++;
				player1.points += 1;
			}
			
			player2.goalsfor += score2;
			player1.goalsfor += score1;
			player1.goalsagainst += score2;
			player2.goalsagainst += score1;
			
			this.render();
		},
		render: function() {
			var currentLadder = this.model.get('ladder');
			this.model.set('ladder', _.sortBy(currentLadder, function(item){ return -item.points; }));
			
			var html = this.template(this.model.toJSON());
			$(this.el).html(html);
		}
	});
	
	
	var Tournament = Backbone.Model.extend({
		defaults: {
		    players: []
		},
		localStorage: new Store("Tournament")
	});
	
	
	var tournament = new Tournament();
	
	var indexView = new IndexView({el:$('.players'),model:tournament});
	var tournamentView = new TournamentView({el:$('.tournament'), model:tournament});
	
	var workspace = new Workspace();
	Backbone.history.start();
});