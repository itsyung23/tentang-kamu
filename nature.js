// Lapisan dekorasi: burung, kupu-kupu, bunga, dan butir cahaya.
// Semua elemen tidak menerima klik dan mengikuti tombol jeda.
(() => {
  'use strict';
  if (window.MEMORY_CONFIG?.natureAnimation === false) return;
  const layer = document.getElementById('nature');
  const sprites = [
    ['bird',12,64,27,-4], ['bird',39,43,35,-19], ['bird',65,49,40,-28],
    ['butterfly',34,54,38,-8], ['butterfly',59,45,45,-26],
    ['butterfly',78,62,52,-13], ['butterfly',48,37,59,-39]
  ];
  sprites.forEach(([kind,top,size,duration,delay],index) => {
    const flight = document.createElement('span');
    flight.className = `nature-flight ${kind}-flight${index===2 || index===6 ? ' extra-nature' : ''}`;
    flight.style.cssText = `--top:${top}%;--size:${size}px;--time:${duration}s;--delay:${delay}s`;
    const sprite = document.createElement('span');
    sprite.className = `nature-sprite ${kind}`;
    flight.append(sprite);
    layer.append(flight);
  });
  for (let index=0;index<6;index++) {
    const flower = document.createElement('span');
    flower.className = `flower-drift${index>3 ? ' extra-nature' : ''}`;
    flower.style.cssText = `--left:${5+index*17}%;--size:${28+index%3*11}px;--time:${30+index*5}s;--delay:${-index*7-3}s;--turn:${index%2===0 ? 260 : -300}deg`;
    const sprite = document.createElement('span');
    sprite.className = `nature-sprite flower ${index%2===0 ? 'daisy' : 'cosmos'}`;
    flower.append(sprite);
    layer.append(flower);
  }
  for (let index=0;index<14;index++) {
    const light = document.createElement('span');
    light.className = `sun-speck${index>7 ? ' extra-nature' : ''}`;
    light.style.cssText = `--left:${(index*37+9)%98}%;--time:${12+index%5*3}s;--delay:${-index*3}s;--size:${3+index%3}px`;
    layer.append(light);
  }
  const syncVisibility = () => document.body.classList.toggle('page-hidden',document.hidden);
  document.addEventListener('visibilitychange',syncVisibility);
  syncVisibility();

  // Dekorasi menghilang lembut saat melintasi foto atau teks agar tetap terbaca.
  const decorations=[...layer.querySelectorAll('.nature-flight,.flower-drift')];
  let lastCheck=0;
  function avoidContent(time){
    if(!document.hidden && time-lastCheck>100){
      lastCheck=time;
      const protectedAreas=[...document.querySelectorAll('.dedication,.topbar,.bottom-note')]
        .map(element=>element.getBoundingClientRect());
      document.querySelectorAll('.photo-drift .phrase-drift').forEach(element=>{
        const textRange=document.createRange();
        textRange.selectNodeContents(element);
        protectedAreas.push(...textRange.getClientRects());
      });
      decorations.forEach(element=>{
        const rect=element.getBoundingClientRect();
        const overlap=protectedAreas.some(area=>rect.right>area.left-6 && rect.left<area.right+6 && rect.bottom>area.top-6 && rect.top<area.bottom+6);
        element.classList.toggle('behind-content',overlap);
      });
    }
    requestAnimationFrame(avoidContent);
  }
  requestAnimationFrame(avoidContent);
})();
