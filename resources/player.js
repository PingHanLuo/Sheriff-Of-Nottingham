/*
Author: Robin Luo
Purpose:collection of functions dealing with game logic and player statistics
*/
//constructor
function player(){
	this.money=50;
	this.hand=[];
	this.bag=[];
	this.declared='';
	this.bribe=[];
	this.apple=0;
	this.cheese=0;
	this.bread=0;
	this.chicken=0;
	this.contraband=[];
	//possible actions:
	//sheriff, wait, exchange, store, next
	this.action='wait';
}
//prepares for next round
function softReset(player){
	player.bag=[];
	player.declared='';
	player.bribe=[];
	player.action='next';
}
//sell goods for monetary value
function selloff(good,player){
	if(player.apple==0&&player.cheese==0&&player.bread==0&&player.chicken==0){
		//sell off contraband
		var contraband;
		while(!this.contraband.isEmpty){
			contraband=player.contraband.pop();
			player.money+=contraband.value;
			if(player.money>0){
				break;
			}
		}
	}else{
		if(good=='apple'){
			var amount = Math.ceil(this.money/2);
			player.apple-=amount;
			player.money+=amount*2;
		}else if(good=='cheese'){
			var amount = Math.ceil(this.money/3);
			player.cheese-=amount;
			player.money+=amount*3;
		}else if(good=='bread'){
			var amount = Math.ceil(this.money/3);
			player.bread-=amount;
			player.money+=amount*3;
		}else if(good=='chicken'){
			var amount = Math.ceil(this.money/4);
			player.chicken-=amount;
			player.money+=amount*4;
		}
	}
}
//store goods in bag
function store(player){
	var goods = player.bag;
	var index,card;
	for(var good in goods){
		index = player.hand.find(good);
		if(index){
			card=player.hand.splice(index,1)[0];
			player.bag.push(card);
		}
	}
	player.action='wait';
}
//check smuggler if he is lying
function check(smuggler,sheriff,players,decks){
	var smugglerStats = players[smuggler].game;
	var declared = smugglerStats.declared;
	var sheriffStats = players[sheriff].game;
	var lying=false;
	var penalty=0;
	//forfeit any bribes
	for(var bribe in player.bribe){
		addGood(sheriff,bribe);
	}
	for(var good in smugglerStats.bag){
		if(good.name!=declared){
			//reset penalty to start being incurred to smuggler
			if(!lying){
				penalty=0;
			}
			lying=true;
			//discard the good
			if(decks.leftHeap>decks.rightHeap){
				decks.rightHeap.push(good);
			}else{
				decks.leftHeap.push(good);
			}
			penalty+=good.penalty;
		}else{
			//if player has been consistently truthful add more penalty
			if(!lying){
				penalty+=good.penalty;
			}
		}
		passThrough(smuggler);
		var result;
		if(!lying){
			sheriffStats.money-=penalty;
			smugglerStats.money+=penalty;
			result = 'Tricked again! You lost {penalty} coins for incorrect inspection';
		}else{
			sheriffStats.money+=penalty;
			smugglerStats.money-=penalty;
			result = 'Gotcha! You caught them red handed. Nothing like a good profit';
		}
		return{"result":result};
	}
}
//let the smuggler go through or if checked let the truthful goods pass
function passThrough(player,sheriff){
	for(var bribe in player.bribe){
		addGood(sheriff,bribe);
	}
	var bag = player.bag;
	for(var good in bag){
		addGood(player,good);
	}
	player.softReset();
}
//add turn card into statistic or add contraband to player's contraband list
function addGood(player,good){
	if(good.name=='apple'){
		player.apple++;
	}else if(good.name=='cheese'){
		player.cheese++;
	}else if(good.name=='bread'){
		player.bread++;
	}else if(good.name=='chicken'){
		player.chicken++;
	}else if (good.name=='money'){
		player.money+=good.value;
	}else{
		player.contraband.push(good);
	}
}


function publicInfo(player){
	var details={};
	details.money=player.money;
	details.apple=player.apple;
	details.cheese=player.cheese;
	details.bread=player.bread;
	details.chicken=player.chicken;
	details.contraband=player.contraband.length;
	details.bag=player.bag.length;
	details.declared=player.declared;
	details.action=player.action;
	return details;
}

function take(player,from){
	player.hand.push(from.pop());
}

function discard(player,name,deck){
	for(var i=0;i<player.hand.length;i++){
		if(player.hand[i].name==name){
			break;
		}
	}
	deck.push(player.hand[i]);
	player.hand.splice(i, 1);
}
function next(sheriff,order,players){
	var nextPlayer;
	for(var i=0;i<order.length;i++){
		if(players[order[i]].game.action=='exchange'){
			nextPlayer=order[(i+1)%order.length]
			players[order[i]].game.action='wait';
		}
	}
	if(nextPlayer){
		if(players[nextPlayer].game.action=='sheriff'){
			//allow the sheriff to start
			players[nextPlayer].game.action='sheriff-insp';
		}else{
			players[nextPlayer].game.action='exchange';
		}
	}
}
exports.init=player;
exports.softReset=softReset;
exports.selloff=selloff;
exports.store=store;
exports.publicInfo=publicInfo;
exports.passThrough=passThrough;
exports.take=take;
exports.discard=discard;
exports.check=check;
exports.nextUp=next;