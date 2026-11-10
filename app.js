const letters=[["А", "автобус"], ["Б", "барабан"], ["В", "воробей"], ["Г", "грузовик"], ["Д", "дом"], ["Е", "ель"], ["Ё", "ёжик"], ["Ж", "жираф"], ["З", "заяц"], ["И", "игрушка"], ["Й", "йогурт"], ["К", "котёнок"], ["Л", "лопата"], ["М", "машинка"], ["Н", "носорог"], ["О", "облако"], ["П", "птичка"], ["Р", "ракета"], ["С", "Синий трактор"], ["Т", "трактор"], ["У", "улитка"], ["Ф", "фонарь"], ["Х", "хомяк"], ["Ц", "цыплёнок"], ["Ч", "черепаха"], ["Ш", "шарик"], ["Щ", "щенок"], ["Ъ", "твёрдый знак"], ["Ы", "буква Ы"], ["Ь", "мягкий знак"], ["Э", "экскаватор"], ["Ю", "юла"], ["Я", "ягоды"]];
const cast=[
["Синий трактор","Главный герой мультсериала — синий колёсный трактор с прицепом.","blue-tractor.jpg"],
["Профессор","Профессор — постоянный участник познавательных приключений.","professor.jpg"],
["Котёнок Котэ","Котёнок из музыкальных выпусков и проектов вселенной.","orange-cat.jpg"],
["Кот Фёдор","Кот Фёдор появляется в совместных музыкальных выпусках.","grey-cat.jpg"],
["Красный бульдозер","Строительная машина из серии про бульдозер.","red-bulldozer.jpg"],
["Мусоровоз","Грузовая машина из отдельной серии о вывозе мусора.","garbage-truck.jpg"],
["Экскаватор","Строительная машина с ковшом.","excavator.jpg"],
["Дорожный каток","Машина для укладки и выравнивания дороги.","road-roller.jpg"],
["Полицейская машина","Машина из дорожных приключений.","police-car.jpg"],
["Катерок","Водный друг из серии «Трактор и Катерок».","boat.jpg"],
["Пингвин","Животное-гость из истории про самолёт.","penguin.jpg"],
["Коала","Животное из путешествия на самолёте.","koala.jpg"],
["Обезьянка","Животное из серии о путешествии.","monkey.jpg"],
["Совушка","Птица из колыбельной и выпусков о птицах.","owl.jpg"],
["Овечка","Один из сельских животных, которых трактор встречает в сериях.","sheep.jpg"],
["Фермерские животные","Коровы, свинки, птицы и другие животные из песенок и поездок.","farm-animals.jpg"]
];
const alphabet=document.querySelector('#alphabet'), nums=document.querySelector('#numbergrid'), grid=document.querySelector('#characters'), info=document.querySelector('#info');
let sound=true, voices=[];
function loadVoices(){if('speechSynthesis'in window)voices=speechSynthesis.getVoices();}
if('speechSynthesis'in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
function say(t){if(!sound||!('speechSynthesis'in window))return;speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='ru-RU';u.rate=1.08;u.pitch=1.25;let v=voices.filter(x=>/^ru/i.test(x.lang));u.voice=v.find(x=>/female|google|yandex|milena|alena|irina/i.test(x.name))||v[0]||null;speechSynthesis.speak(u);}
function show(title,desc,img){info.innerHTML=`<img src="${img}" alt=""><div><b>${title}</b><p>${desc}</p></div>`;say(title+'. '+desc);}
letters.forEach(([l,w])=>{let b=document.createElement('button');b.className='letter-card';b.innerHTML=`<span class="letter">${l}</span><span class="word">${w}</span>`;b.onclick=()=>{show(l+' — '+w,'Повтори букву и слово!','assets/blue-tractor.jpg')};alphabet.append(b);});
const countPics=['blue-tractor.jpg','professor.jpg','orange-cat.jpg','grey-cat.jpg','red-bulldozer.jpg','garbage-truck.jpg','excavator.jpg','road-roller.jpg','police-car.jpg','boat.jpg'];
for(let n=1;n<=10;n++){let b=document.createElement('button');b.className='number-card';b.innerHTML=`<strong>${n}</strong><img src="assets/${countPics[n-1]}" alt=""><span class="word">${n} — считаем вместе!</span>`;b.onclick=()=>show(String(n),'Давай посчитаем до '+n+'!','assets/'+countPics[n-1]);nums.append(b);}
cast.forEach(([name,desc,file])=>{let b=document.createElement('button');b.className='character';b.innerHTML=`<img src="assets/${file}" alt="${name}"><div><h3>${name}</h3><p>${desc}</p></div>`;b.onclick=()=>show(name,desc,'assets/'+file);grid.append(b);});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById(t.dataset.tab).classList.add('active');});
document.querySelector('#sound').onclick=e=>{sound=!sound;e.currentTarget.textContent=sound?'🔊 Весёлый голос: включён':'🔇 Голос выключен';if(!sound&&'speechSynthesis'in window)speechSynthesis.cancel();};
