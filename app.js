const letters=[
["А","автобус","🚌"],["Б","барабан","🥁"],["В","воробей","🐦"],["Г","грузовик","🚚"],["Д","дом","🏠"],["Е","ель","🌲"],["Ё","ёжик","🦔"],["Ж","жираф","🦒"],["З","заяц","🐇"],["И","игрушка","🧸"],["Й","йогурт","🥛"],["К","котёнок","🐱"],["Л","лопата","🪏"],["М","машинка","🚗"],["Н","носорог","🦏"],["О","облако","☁️"],["П","птичка","🐤"],["Р","ракета","🚀"],["С","Синий трактор","🚜"],["Т","трактор","🚜"],["У","улитка","🐌"],["Ф","фонарик","🏮"],["Х","хомяк","🐹"],["Ц","цыплёнок","🐥"],["Ч","черепаха","🐢"],["Ш","шарик","🎈"],["Щ","щенок","🐶"],["Ъ","твёрдый знак","🔤"],["Ы","буква Ы","🔤"],["Ь","мягкий знак","🔤"],["Э","экскаватор","🚜"],["Ю","юла","🌀"],["Я","ягоды","🫐"]];
const friends=[
["🚜","Синий трактор","Главный герой. Поёт песенки, ездит в гости и знакомит малышей с окружающим миром."],
["👨‍🔬","Профессор","Профессор — один из постоянных персонажей приключений Синего трактора."],
["🐱","Котёнок Котэ","Котёнок появляется в совместных музыкальных и познавательных выпусках."],
["🐈","Кот Фёдор","Кот Фёдор встречается в музыкальных проектах и совместных выпусках."],
["🎤","Кукутики","Детский музыкальный проект, связанный с общей вселенной и совместными выпусками."],
["🚿","Поливалка","Машина-помощница; появляется среди знакомых машин мультсериала."],
["🚚","Грузовик","Перевозит грузы и встречается в дорожных и рабочих приключениях."],
["🚛","Мусоровоз","Машина, которая помогает узнавать, как вывозят мусор."],
["🚜","Экскаватор","Строительная машина с большим ковшом."],
["🚜","Бульдозер","Мощная машина для строительных работ."],
["🚒","Пожарная машина","Специальная машина, которая приезжает на помощь."],
["🚓","Полицейский грузовик","Герой дорожных приключений."],
["🚜","Каток","Дорожная машина с большим валиком."],
["🚤","Катерок","Водный транспорт из отдельного приключения."],
["✈️","Самолёт","Летательный аппарат из серий о транспорте."],
["🤖","Робот","Механический герой из нескольких приключений."],
["🐦","Птички","В сериях появляются разные птицы: воробьи, гуси, петухи и другие."],
["🦉","Совушка","Сова из колыбельной и серий о птицах."],
["🐧","Пингвин","Один из животных-гостей в приключениях."],
["🐨","Коала","Животное из выпуска о самолётах и путешествиях."],
["🐒","Обезьянка","Животное-гость в приключениях Синего трактора."],
["🐜","Муравей","Один из героев серии о насекомых."],
["🦋","Бабочка","Насекомое из познавательной серии."],
["🦗","Кузнечик","Насекомое из музыкального выпуска."],
["🐍","Змея","Гость отдельной серии второго сезона."],
["🦔","Ёжик","Животное из мира Синего трактора."],
["🕳️","Крот","Герой отдельной серии."],
["🎅","Дед Мороз","Новогодний персонаж праздничных выпусков."]
];
let sound=true,voices=[];
function loadVoices(){if(!('speechSynthesis'in window))return;voices=speechSynthesis.getVoices();}
if('speechSynthesis'in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
function say(text){if(!sound||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=1.03;u.pitch=1.24;u.volume=1;const ru=voices.filter(v=>/^ru(-|_)/i.test(v.lang));const preferred=ru.find(v=>/female|woman|google|yandex|irina|milena|alena|katya/i.test(v.name))||ru[0];if(preferred)u.voice=preferred;speechSynthesis.speak(u);}
function show(emoji,title,desc){document.querySelector('#detail').innerHTML=`<div class="big">${emoji}</div><div><b>${title}</b><p>${desc}</p></div>`;say(title+'. '+desc);}
const alphabet=document.querySelector('#alphabet');
letters.forEach(([l,w,e])=>{const b=document.createElement('button');b.className='tile';b.innerHTML=`<span class="letter">${l}</span><span class="pic">${e}</span><span class="word">${w}</span>`;b.onclick=()=>show(e,l+' — '+w,'Давай повторим: '+l+' '+w+'!');alphabet.append(b);});
const nums=document.querySelector('#numbergrid'), emojis=['🚜','⭐','🍎','🐥','🚗','🌼','🐱','🎈','🦋','🍓'];for(let n=1;n<=10;n++){let b=document.createElement('button');b.className='tile';b.innerHTML=`<span class="letter">${n}</span><span class="pic">${emojis.slice(0,Math.min(n,5)).join('')}</span><span class="word">${n} ${n===1?'предмет':n<5?'предмета':'предметов'}</span>`;b.onclick=()=>show(emojis[n-1],String(n),'Считаем до '+n+'!');nums.append(b);}
const fg=document.querySelector('#friendgrid');friends.forEach(([e,n,d])=>{let b=document.createElement('button');b.className='friend';b.innerHTML=`<span class="pic">${e}</span><h3>${n}</h3><p>${d}</p>`;b.onclick=()=>show(e,n,d);fg.append(b);});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById(t.dataset.tab).classList.add('active');});
document.querySelector('#sound').onclick=e=>{sound=!sound;e.currentTarget.textContent=sound?'🔊 Весёлый голос: вкл.':'🔇 Голос выключен';if(!sound&&'speechSynthesis'in window)speechSynthesis.cancel();};
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));