const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const names=['КАРАНТИН','ПОЛТОРАШКА','СИМ 400'];
const savedScore=localStorage.getItem('cehiScore');
let selected=null,busy=false,round=Number(localStorage.getItem('cehiRound')||0),score=(savedScore===null)?68000:Number(savedScore),sound=localStorage.getItem('cehiSound')!=='off',avatar=localStorage.getItem('cehiAvatar')||'🦺',nickname=localStorage.getItem('cehiNickname')||'Игрок',audioCtx=null,engineNodes=[];
const scoreEl=$('#score'),resultEl=$('#result'),forklift=$('#forklift');
function render(){
  scoreEl.textContent=score.toLocaleString('ru-RU');
  $('#roundLabel').textContent='ЗАЕЗД '+String(round+1).padStart(2,'0');
  $('#soundBtn').innerHTML=sound?'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 12h6l8-6v20l-8-6H4z"/><path class="sound-wave" d="M22 11q7 5 0 10M25 7q11 9 0 18"/></svg>':'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 12h6l8-6v20l-8-6H4z"/><path d="m22 12 7 8m0-8-7 8" class="sound-slash"/></svg>'; 
  $('#soundBtn').setAttribute('aria-label',sound?'Звук включён':'Звук выключен');
  $('#avatarMini').innerHTML=avatar.startsWith('data:image/')?`<img src="${avatar}" alt="Аватар">`:avatar;
  $('#avatarPreview').innerHTML=avatar.startsWith('data:image/')?`<img src="${avatar}" alt="Аватар">`:avatar;
  $('#nicknameMini').textContent=nickname;
  $('#nicknameInput').value=nickname==='Игрок'?'':nickname;
}
function getAudio(){audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function tone(freq,duration,type='sine',gain=.035,delay=0){if(!sound)return;try{const ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+duration)}catch(e){}}
function engineStart(){
  if(!sound)return;
  try{
    const ctx=getAudio(),now=ctx.currentTime;
    const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    osc.type='sawtooth';osc.frequency.setValueAtTime(72,now);osc.frequency.linearRampToValueAtTime(98,now+1.1);osc.frequency.linearRampToValueAtTime(78,now+2.65);
    filter.type='lowpass';filter.frequency.value=240;gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.045,now+.18);gain.gain.setValueAtTime(.04,now+2.35);gain.gain.linearRampToValueAtTime(.0001,now+2.8);
    osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+2.85);engineNodes=[osc,gain,filter];
    const rattle=ctx.createOscillator(),rg=ctx.createGain();rattle.type='square';rattle.frequency.value=24;rg.gain.setValueAtTime(.0001,now);rg.gain.linearRampToValueAtTime(.009,now+.2);rg.gain.linearRampToValueAtTime(.0001,now+2.7);rattle.connect(rg);rg.connect(ctx.destination);rattle.start(now);rattle.stop(now+2.75);
  }catch(e){}
}
function fanfare(){if(!sound)return;[659,784,988,1319,1568].forEach((f,i)=>tone(f,.42,'triangle',.055,i*.13));[523,659,784].forEach((f,i)=>tone(f,.55,'sine',.025,.65+i*.06));}
function select(n){if(busy)return;selected=n;$$('.choice').forEach((b,i)=>b.classList.toggle('selected',i===n));$('#selectedNote').textContent='Выбрано: '+names[n];$('#startBtn').disabled=false;tone(520,.08,'sine',.025)}
$$('.choice').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.choice))));
$('#startBtn').addEventListener('click',()=>{
  if(selected===null||busy)return;
  busy=true;$('#startBtn').disabled=true;$$('.choice').forEach(b=>b.disabled=true);
  resultEl.className='result';resultEl.textContent='';$$('.warehouse').forEach(w=>w.classList.remove('target'));
  forklift.style.transition='none';forklift.style.left='3%';forklift.classList.add('moving');void forklift.offsetWidth;forklift.style.transition='left 2.7s cubic-bezier(.22,.7,.2,1)';engineStart();
  const destination=Math.floor(Math.random()*3),left=[3,37,67][destination];setTimeout(()=>{forklift.style.left=left+'%';},60);
  setTimeout(()=>{
    forklift.classList.remove('moving');$$('.warehouse')[destination].classList.add('target');
    const won=destination===selected;score=Math.max(0,score+(won?1000:-100));round++;
    localStorage.setItem('cehiScore',score);localStorage.setItem('cehiRound',round);render();

    resultEl.textContent=won?'ВЫ УГАДАЛИ! +1 000 РУБЛЕЙ':'В ЭТОТ РАЗ НЕ УГАДАЛИ · −100 РУБЛЕЙ';resultEl.classList.add('show');
    if(won)fanfare();else tone(240,.25,'triangle',.04);
    $('#selectedNote').textContent='';$('#startBtn').textContent='СЛЕДУЮЩИЙ ЗАЕЗД →';$('#startBtn').disabled=false;busy=false;
    $$('.choice').forEach(b=>b.disabled=false);selected=null;$$('.choice').forEach(b=>b.classList.remove('selected'));
  },2900);
});
$('#startBtn').addEventListener('click',()=>{if(!busy&&selected===null){$('#startBtn').textContent='ОТПРАВИТЬ ПОГРУЗЧИК →';forklift.style.transition='left .2s';forklift.style.left='3%';$$('.warehouse').forEach(w=>w.classList.remove('target'));$('#selectedNote').textContent='Выберите, куда доедет погрузчик';resultEl.className='result';}});
$('#soundBtn').addEventListener('click',()=>{sound=!sound;localStorage.setItem('cehiSound',sound?'on':'off');render();if(sound)tone(660,.1)});
function openModal(id){$(id).classList.add('open')}function closeModal(id){$(id).classList.remove('open')}
function showProfile(){openModal('#profileModal')}
$('#profileBtn').addEventListener('click',showProfile);$('#profileNameBtn').addEventListener('click',showProfile);$('#closeProfile').addEventListener('click',()=>closeModal('#profileModal'));$('#profileModal').addEventListener('click',e=>{if(e.target.id==='profileModal')closeModal('#profileModal')});
$('#avatarFile').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file||!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas'),max=256,scale=Math.min(1,max/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);avatar=canvas.toDataURL('image/jpeg',.82);render()};img.src=reader.result};reader.readAsDataURL(file)});
$('#saveProfile').addEventListener('click',()=>{const entered=$('#nicknameInput').value.trim();nickname=entered||'Игрок';localStorage.setItem('cehiAvatar',avatar);localStorage.setItem('cehiNickname',nickname);render();closeModal('#profileModal')});
$('#withdrawBtn').addEventListener('click',()=>openModal('#withdrawModal'));$('#closeWithdraw').addEventListener('click',()=>closeModal('#withdrawModal'));$('#okWithdraw').addEventListener('click',()=>closeModal('#withdrawModal'));$('#withdrawModal').addEventListener('click',e=>{if(e.target.id==='withdrawModal')closeModal('#withdrawModal')});
function applyPromo(){const code=$('#promoInput').value.trim();if(!code){$('#promoMessage').textContent='Введите промокод.';return}score+=5000;localStorage.setItem('cehiScore',score);render();$('#promoMessage').textContent='Успешно начислено 5 000 рублей.';$('#promoInput').value='';tone(740,.16,'triangle',.04)}
$('#promoApply').addEventListener('click',applyPromo);$('#promoInput').addEventListener('keydown',e=>{if(e.key==='Enter')applyPromo()});
render();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
