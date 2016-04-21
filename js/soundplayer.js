var AUDIO = (function(ns){
	var context = new AudioContext();
	var depth = 3;
	function soundNode(org, freq, start, len)
	{
		var starttime = start;
		var length = len;
    var frequncy = freq;
		var playtype;
		function setGainCurve(param, adsr)
		{
			var st = adsr.sustainTime;
			var sp = adsr.sustainlevel.length>0?adsr.sustainlevel[0] : 0;
			var ap = adsr.attackLimit>sp?adsr.attackLimit:sp;
			var at = ap* adsr.attackSlope;
			var sp2 = adsr.sustainlevel.length>0?adsr.sustainlevel[adsr.sustainlevel.length-1] : 0;
			var dt = (ap - sp)*adsr.decaySlope;
			var rt = sp2 * adsr.releaseSlope;
			param.setValueAtTime(0,starttime);
			if(st<at)
			{
				ap = st / adsr.attackLimit;
				at = st;
				dt = 0;
				sp = ap;
				rt = sp * adsr.releaseSlope;
			}
			else if(st<at+dt)
			{
				dt = st-at;
				sp = ap - dt/adsr.decaySlope;
				st = at + dt;
				rt = sp * adsr.releaseSlope;
			}
			param.linearRampToValueAtTime(ap,starttime+at);
			param.linearRampToValueAtTime(sp,starttime+at+dt);
			if(st-at-dt>0)
				param.setValueCurveAtTime(adsr.sustainlevel, starttime+at+dt,(st-at-dt)*0.99);
			param.setTargetAtTime(0,starttime+st,rt * 0.1);
			return st + rt;
		}
    this.playsound = function(dest)
    {
    	var t;
			var adsrObj =
			{
				attackLimit : 1.0,
				attackSlope : 0.01,
				decaySlope : 0.05,
				sustainlevel: new Float32Array([0.6,0.5]),
				sustainTime : 0.1,
				releaseSlope : 0.1
			};
    	if(freq.constructor === Array)
    	{
    		t = context.createDynamicsCompressor();
    		t.connect(dest);
    		for(var i = 0 ; i<freq.length ; i++)
    		{
    			var nd = context.createOscillator();
					var g = context.createGain();
					var reallen =	setGainCurve(g.gain, adsrObj);
    			nd.frequency.value = org * freq[i];
    			nd.connect(g);
					g.connect(t);
					nd.start(starttime);
					nd.stop(starttime+reallen);
    		}
    	}
    	else
    	{
    		t = context.createOscillator();
				var g = context.createGain();
				var reallen = setGainCurve(g.gain, adsrObj);
    		t.frequency.value = org * freq;
    		t.connect(g);
				g.connect(dest);
    		t.start(starttime);
    		t.stop(starttime+reallen);
    	}
    	return {player : t, length : length};
    }
	}
	function createRythm(level, stride, drive, st, fi)
	{
		if(level>depth || fi-st<0.1)
		{
				var t = [];
				t[0] = 440;
				t[1] = 1 * drive/stride;
				t[2] = st;
				t[3] = (fi-st);
				return [t];
		}
		else {
			var s = stride>drive?1:stride/drive;
			var d = stride<drive?1:drive/stride;
			var i;
			var r = [];
			var v = Math.random() * 1.5 + 0.5;
			v *= (stride+drive)/2;
			r = r.concat(createRythm(level+s, stride, v, st, st + (fi-st)/2));
			r = r.concat(createRythm(level+d, v, drive, st + (fi-st)/2, fi));
			return r;
		}
	}
	ns.playsound = function()
	{
		var org = 523;
		var org2 = 330;
		var playsequence = [[org, [1.0,1.25,1.5],1,1],
					[org, [1.0,1.3333,1.66666],2,1],
					[org, [0.9444,1.1215,1.5],3,1],
					[org, [1.0,1.25,1.5],4,1]];
			//		[org, 1.0,4,1],
			//		[org2, 1.333,6,0.5],
			//		[org2, 1.5,8,0.5],
		//			[org2, 2,9,0.5]];
		var timer = 0.3;
		var diff = 10;
		context.close();
		context = new AudioContext();
		var dyn = context.createDynamicsCompressor();
		dyn.connect(context.destination);
		playsequence = createRythm(0,50,20,0,4);
		for(var i=0 ; i<playsequence.length ; i++)
		{
			var node = new soundNode(playsequence[i][0], playsequence[i][1], playsequence[i][2], playsequence[i][3]);
			var p = node.playsound(dyn);
		}
	}

	ns.repeat = function()
	{
		setInterval(ns.playsound,4000);
	}
	return ns;
})(AUDIO || {});
