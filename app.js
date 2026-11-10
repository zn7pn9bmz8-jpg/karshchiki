const letters = [
["А","арбуз","🍉"],["Б","барабан","🥁"],["В","ворона","🐦‍⬛"],["Г","грузовик","🚚"],["Д","дом","🏠"],["Е","ель","🌲"],["Ё","ёжик","🦔"],["Ж","жираф","🦒"],["З","заяц","🐇"],["И","игрушка","🧸"],["Й","йогурт","🥛"],["К","котёнок Котэ","🐱"],["Л","лопата","🪏"],["М","машина","🚗"],["Н","носорог","🦏"],["О","облако","☁️"],["П","профессор","👨‍🏫"],["Р","ракета","🚀"],["С","совушка","🦉"],["Т","трактор","🚜"],["У","улитка","🐌"],["Ф","фонарь","🏮"],["Х","хомяк","🐹"],["Ц","цыплёнок","🐥"],["Ч","черепаха","🐢"],["Ш","шарик","🎈"],["Щ","щенок","🐶"],["Ъ","твёрдый знак","🔤"],["Ы","буква Ы","🔤"],["Ь","мягкий знак","🔤"],["Э","экскаватор","🚜"],["Ю","юла","🌀"],["Я","ягоды","🫐"]
];
const heroes = [
["🚜","Синий Трактор","Главный герой мультсериала — весёлый синий трактор, который путешествует и знакомится с разными животными и машинами."],
["🐱","Котёнок Котэ","Мультяшный котёнок из связанных детских проектов; здесь упомянут как один из знакомых героев."],
["👨‍🏫","Профессор Кислых Щей","Профессор, который появляется в историях и помогает узнавать новое."],
["👦","Паша","Мальчик из эпизодов мультсериала."],
["🦉","Совушка","Маленькая сова из отдельной истории."],
["🚜","Другие тракторы","В историях встречаются тракторы разных цветов."],
["🚛","Грузовики и спецтехника","Мусоровозы, экскаваторы, бульдозеры и другие машины помогают изучать транспорт."],
["🐧","Животные и птицы","В сериях появляются разные звери и птицы: их можно учиться узнавать по названию и голосу."]
];
const alphabet=document.querySelector('#alphabet'), numbergrid=document.querySelector('#numbergrid'), detail=document.querySelector('#detail');
let soundOn=true;
function speak(text){if(!soundOn||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=.86;speechSynthesis.speak(u)}
function show(emoji,title,desc){detail.innerHTML=`<div class="bigemoji">${emoji}</div><div><strong>${title}</strong><p>${desc}</p></div>`;speak(title+'. '+desc)}
letters.forEach(([l,w,e])=>{const b=document.createElement('button');b.className='tile';b.innerHTML=`<span class="letter">${l}</span><span>${e}</span><span class="word">${w}</span>`;b.onclick=()=>show(e,l+' — '+w,'Повтори: '+l+'. '+w+'.');alphabet.append(b)});
for(let n=1;n<=10;n++){const b=document.createElement('button');b.className='tile';const em=['🚜','⭐','🍎','🐥','🚗','🌼','🐱','🎈','🦋','🍓'][n-1];b.innerHTML=`<span class="letter">${n}</span><span style="font-size:25px">${em.repeat(Math.min(n,5))}</span><span class="word">${n} ${n===1?'предмет':n<5?'предмета':'предметов'}</span>`;b.onclick=()=>show(em,String(n),'Посчитай до '+n+'.');numbergrid.append(b)}
heroes.forEach(([e,n,d])=>{const card=document.createElement('article');card.className='hero';card.innerHTML=`<div class="emoji">${e}</div><h3>${n}</h3><p>${d}</p>`;card.onclick=()=>show(e,n,d);heroGrid.append(card)});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById(t.dataset.tab).classList.add('active')});
document.querySelector('#sound').onclick=e=>{soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',String(soundOn));e.currentTarget.textContent=soundOn?'🔊 Звук включён':'🔇 Звук выключен';if(!soundOn&&'speechSynthesis'in window)speechSynthesis.cancel()};
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));