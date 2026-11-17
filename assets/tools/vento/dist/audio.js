// Procedural wind and surf. Audio is created only after a user gesture.
export class SailingAudio {
 constructor(){this.enabled=false;this.ctx=null;}
 async toggle(){if(!this.ctx)this.init();if(this.ctx.state==='suspended')await this.ctx.resume();this.enabled=!this.enabled;this.master.gain.setTargetAtTime(this.enabled?.45:0,this.ctx.currentTime,.4);return this.enabled;}
 init(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Audio non supportato in questo browser');this.ctx=new AC();const c=this.ctx;this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
  const buffer=c.createBuffer(2,c.sampleRate*5,c.sampleRate);for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);let b=0;for(let i=0;i<d.length;i++){b=(b+(Math.random()*2-1)*.025)/1.025;d[i]=b*5;}}
  this.noise=c.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;
  this.windFilter=c.createBiquadFilter();this.windFilter.type='bandpass';this.windFilter.frequency.value=800;this.windFilter.Q.value=.45;this.windGain=c.createGain();this.windGain.gain.value=.12;this.noise.connect(this.windFilter);this.windFilter.connect(this.windGain);this.windGain.connect(this.master);
  this.surfFilter=c.createBiquadFilter();this.surfFilter.type='lowpass';this.surfFilter.frequency.value=440;this.surfGain=c.createGain();this.surfGain.gain.value=.16;this.noise.connect(this.surfFilter);this.surfFilter.connect(this.surfGain);this.surfGain.connect(this.master);
  this.lfo=c.createOscillator();this.lfo.frequency.value=.095;const amp=c.createGain();amp.gain.value=.07;this.lfo.connect(amp);amp.connect(this.surfGain.gain);this.lfo.start();this.noise.start();
 }
 update(wind,time){if(!this.ctx||!this.enabled)return;const t=this.ctx.currentTime;this.windGain.gain.setTargetAtTime(.015+(wind/35)**1.35*.48*(1+.1*Math.sin(time*.8)),t,.4);this.windFilter.frequency.setTargetAtTime(220+wind*40,t,.6);}
 pause(paused){if(!this.ctx)return;if(paused)this.ctx.suspend().catch(()=>{});else if(this.enabled)this.ctx.resume().catch(()=>{});}
}
