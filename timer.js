/*
	Minuteur V4
	Author: Stéphane Bascher
	
	Date: 11/12/2015
	Version: 1.0
	Creation of the module
*/


// Global variables
var job,
	CronJob = require('./lib/cron/cron').CronJob,
	moment = require('./lib/moment/moment');


exports.action = function(data, callback){  

	// ? Are you nuts ? leave back home.
	if (data.command === undefined)
		return callback({});
	
	// table of properties
	var _TimerConf = {
		sound: Config.modules.timer['Sound'] || 'rencontre_du_troisieme_type',
		addspeech: Config.modules.timer['addspeech'] || 'false',
	};	
	
	// table of actions
	var tblActions = {
		setTimer: function() {SARAH.remote({'context' : 'lazyTimer'})},
		startTimer: function() {start(data.time, _TimerConf.sound, _TimerConf.addspeech)},
		stopTimer: function() {stop()}
	};
	
	tblActions[data.command]();
	
	// return fucking callback
	callback({});
}


// Start Timer
var start = function (time,sound, addspeech){

	var date = moment().format("YYYY-MM-DD");
	if (moment(date+'T'+time).isValid() == false){
		SARAH.speak("Je n'ai pas compris, recommence s'il te plait.")
		return;
	}
	
	// faisons simple...
	var tbltime = time.split(':'),
		hourToSec = (tbltime[0] != '00') ? parseInt(tbltime[0]) * 360 : 0,
		mnToSec = (tbltime[1] != '00') ? parseInt(tbltime[1]) * 60 : 0,
		secondes = (tbltime[2] != '00') ? hourToSec + mnToSec + parseInt(tbltime[2]) : hourToSec + mnToSec;
	
	if (secondes > 9)
		setjob(secondes,sound, addspeech, function(){
			ttsFormat(tbltime, function(speech) {
				SARAH.speak("taïmeur de " + speech + " démarré.")
			});
		})
	else
		SARAH.speak("Fais un taïmeur de 10 secondes minimum s'il te plait");
}


var stop = function () {

	if (job) {
		console.log('info: timer stoppé');
		job.stop();
		job = null;
		SARAH.speak("Taïmeur stoppé.");
	} else 
		SARAH.speak("Il n'y a pas de taïmeur en cours.");

}


// Start Job
var setjob = function (secs, sound, addspeech,callback) {

	var d = new Date();
	var s = d.getSeconds()+secs;
	d.setSeconds(s);

	if (job) {
		console.log('info: timer précédent stoppé');
		job.stop();
	}
	
	job = new CronJob(d, function(done) {	
		console.log("info: timer de " + secs + " secondes terminé")
		timer_done(sound, addspeech);	
	},null, true);
	
	callback();
}



// End Timer
// Propriété sound du timer.prop
// Propriété addspeech du timer.prop 
var timer_done = function (sound, addspeech) {
	
	job = null;
	SARAH.play("../../../../plugins/timer/lib/sons/" + sound + ".mp3", function() {  
		if ((typeof addspeech === 'boolean' && addspeech == true) || (typeof addspeech === 'string' && addspeech == 'true'))
			SARAH.speak("Taïmeur terminé");
	});	
}



// Formatage du tts
var ttsFormat = function (tbltime,callback){
	
	var timer;
	for (var i=0; i <3; i++){
		var counter = parseInt(tbltime[i]);
		switch(i){
			case 0: if (counter > 0 ) timer = counter + " heure"; break;
			case 1:	if (counter > 0 ) timer = (timer) ? timer + " " + counter + " minute" : counter + " minute"; break;
			case 2:	if (counter > 0 ) timer = (timer) ? timer + " " + counter + " seconde" : counter + " seconde"; break;
		}
	}	
	callback(timer);
}

