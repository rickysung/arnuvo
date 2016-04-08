var AUDIO = (function(ns){

	var context = new AudioContext();
	function soundNode(org, freq, len)
	{
	    this.length = len;
	    this.frequncy = freq;
	    this.playsound = function(dest, starttime)
	    {
	    	var t;
	    	if(freq.constructor === Array)
	    	{
	    		t = context.createDynamicsCompressor();
	    		t.connect(dest);
	    		for(var i = 0 ; i<freq.length ; i++)
	    		{
	    			var nd = context.createOscillator();
	    			nd.frequency.value = org * freq[i];
	    			nd.connect(t);
					nd.start(starttime);
					nd.stop(starttime+len);
	    		}
	    	}
	    	else
	    	{
	    		t = context.createOscillator();
	    		t.frequency.value = org * freq;
	    		t.connect(dest);
	    		t.start(starttime);
	    		t.stop(starttime+len);
	    	}
	    	return {player : t, length : length};
	    }
	}
	ns.playsound = function()
	{
		var freqs = [1.0, 1.2, 1.5, 1.2, 1.0, 1.25, 1.2, 1.5, 1.333, 1.666, 2];
		var playsequence = [[440,[1.0,1.2,1.5],1],
					[440,[1.0,1.25,1.5],1],
					[440,[1.0,1.333,1.6666,2],1],
					[440,1.0,1]];
		var origin = 220;
		var timer = 0.3;
		var diff = 1;
		
		var dyn = context.createDynamicsCompressor();
		dyn.connect(context.destination);
		for(var i=0 ; i<playsequence.length ; i++)
		{
			var node = new soundNode(playsequence[i][0], playsequence[i][1], playsequence[i][2]);
			var p = node.playsound(dyn,timer);
			timer+=diff;
		}
	}
	return ns;
})(AUDIO || {});