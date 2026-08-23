(function(){
  "use strict";

  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if(hasGSAP){
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  }

  /* ---------- fecha en portada ---------- */
  var dateEl = document.getElementById('hero-date');
  if(dateEl){
    dateEl.textContent = new Date().toLocaleDateString('es-ES', {year:'numeric', month:'long'});
  }

  /* ---------- scroll progress bar (global) ---------- */
  var progressBar = document.getElementById('scroll-progress');
  function updateProgressBarFallback(){
    if(!progressBar) return;
    var h = document.documentElement;
    var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = pct + '%';
  }
  if(hasGSAP){
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function(self){
        if(progressBar) progressBar.style.width = (self.progress * 100) + '%';
      }
    });
  } else {
    window.addEventListener('scroll', updateProgressBarFallback, { passive:true });
  }

  /* ---------- case blocks (accordion, click-based, works in both modes) ---------- */
  document.querySelectorAll('.case-block').forEach(function(block){
    block.addEventListener('click', function(){
      block.classList.toggle('open');
    });
  });

  /* ---------- quiz ---------- */
  document.querySelectorAll('.quiz-step').forEach(function(step){
    var opts = step.querySelectorAll('.q-opt');
    var feedback = step.querySelector('.q-feedback');
    opts.forEach(function(opt){
      opt.addEventListener('click', function(){
        if(step.classList.contains('answered')) return;
        step.classList.add('answered');
        var isCorrect = opt.getAttribute('data-correct') === 'true';
        opt.classList.add(isCorrect ? 'chosen-right' : 'chosen-wrong');
        opts.forEach(function(o){
          o.classList.add('disabled');
          if(o !== opt && o.getAttribute('data-correct') === 'true'){
            o.classList.add('chosen-right');
          }
        });
        if(feedback) feedback.classList.add('show');

        if(step.getAttribute('data-qid') === '3'){
          var dx = document.getElementById('dx-reveal');
          if(dx) setTimeout(function(){ dx.classList.add('show'); }, 500);
        }
      });
    });
  });

  /* ---------- comparison table rows ---------- */
  document.querySelectorAll('.cmp-row').forEach(function(row){
    row.addEventListener('click', function(){
      var idx = row.getAttribute('data-detail');
      var detail = document.getElementById('detail-' + idx);
      if(detail) detail.classList.toggle('show');
    });
  });

  /* ---------- flashcards ---------- */
  document.querySelectorAll('.flip-card').forEach(function(card){
    card.addEventListener('click', function(){
      card.classList.toggle('flipped');
    });
  });

  /* ================================================================
     GSAP-powered choreography
     ================================================================ */
  var pinnedTriggers = [];   // ScrollTrigger instances that pin a section
  var revealTriggers = [];   // simple fade/slide-in triggers

  function initSimpleReveals(){
    if(!hasGSAP){
      // graceful fallback: plain IntersectionObserver, no motion library
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { threshold:0.15 });
      document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
      return;
    }
    document.querySelectorAll('.reveal').forEach(function(el){
      var st = ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: function(){ el.classList.add('in'); },
        onEnterBack: function(){ el.classList.add('in'); }
      });
      revealTriggers.push(st);
    });
  }

  function initHeroParallax(){
    if(!hasGSAP) return;
    gsap.to('#hero .wrap', {
      y: 60,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  function initLabsPin(){
    if(!hasGSAP) return null;
    var section = document.getElementById('labs');
    var cards = gsap.utils.toArray('#lab-grid .lab-card');
    var countEl = document.getElementById('labs-pin-count');
    var barEl = document.getElementById('labs-pin-bar');
    var stepLen = 200;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=' + (cards.length * stepLen),
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        onUpdate: function(self){
          var visible = Math.min(cards.length, Math.ceil(self.progress * cards.length));
          if(countEl) countEl.textContent = visible + ' / ' + cards.length;
          if(barEl) barEl.style.width = (self.progress * 100) + '%';
        }
      }
    });

    cards.forEach(function(card, i){
      var pos = i * stepLen / 1000;
      tl.fromTo(card, { opacity:0, y:70, scale:0.9 }, { opacity:1, y:0, scale:1, duration:0.5, ease:'power2.out' }, pos);

      var target = parseFloat(card.getAttribute('data-target'));
      var decimals = parseInt(card.getAttribute('data-decimals') || '0', 10);
      var counterEl = card.querySelector('.counter');
      var barSpan = card.querySelector('.lab-bar > span');
      var fill = card.getAttribute('data-fill') || '82%';

      if(counterEl && !isNaN(target)){
        var obj = { v: 0 };
        tl.to(obj, {
          v: target, duration:0.55, ease:'power1.out',
          onUpdate: function(){
            counterEl.textContent = decimals > 0 ? obj.v.toFixed(decimals) : Math.round(obj.v);
          }
        }, pos + 0.05);
      }
      if(barSpan){
        tl.fromTo(barSpan, { width:'0%' }, { width: fill, duration:0.55, ease:'power1.out' }, pos + 0.05);
      }
    });

    pinnedTriggers.push(tl.scrollTrigger);
    return tl.scrollTrigger;
  }

  function initPathoPin(){
    if(!hasGSAP) return null;
    var section = document.getElementById('patho');
    var barEl = document.getElementById('patho-pin-bar');
    var lineTtp = document.getElementById('line-ttp');
    var lineAhus = document.getElementById('line-ahus');
    var dotsTtp = document.querySelectorAll('#svg-ttp .flow-dot');
    var dotsAhus = document.querySelectorAll('#svg-ahus .flow-dot');
    var stepsTtp = document.querySelectorAll('.patho-panel.ttp .patho-steps li');
    var stepsAhus = document.querySelectorAll('.patho-panel.ahus .patho-steps li');

    gsap.set([stepsTtp, stepsAhus], { opacity:0.25 });
    gsap.set([dotsTtp, dotsAhus], { opacity:0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=1400',
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        onUpdate: function(self){
          if(barEl) barEl.style.width = (self.progress * 100) + '%';
        }
      }
    });

    tl.fromTo([lineTtp, lineAhus], { strokeDashoffset:400 }, { strokeDashoffset:0, duration:1, ease:'power1.inOut' }, 0);
    tl.to([dotsTtp, dotsAhus], { opacity:1, duration:0.2 }, 0.85);

    var allSteps = [];
    stepsTtp.forEach(function(li, i){ allSteps.push({el:li, pos: 0.15 + i*0.18}); });
    stepsAhus.forEach(function(li, i){ allSteps.push({el:li, pos: 0.15 + i*0.18}); });
    allSteps.forEach(function(item){
      tl.to(item.el, { opacity:1, duration:0.2 }, item.pos);
    });

    pinnedTriggers.push(tl.scrollTrigger);
    return tl.scrollTrigger;
  }

  function killPinned(){
    pinnedTriggers.forEach(function(st){ st.kill(); });
    pinnedTriggers = [];
    gsap.set('#lab-grid .lab-card', { clearProps:'all' });
    gsap.set(['#line-ttp', '#line-ahus'], { clearProps:'all' });
    gsap.set('.patho-steps li', { clearProps:'all' });
    document.querySelectorAll('#lab-grid .lab-card .counter').forEach(function(c){
      var card = c.closest('.lab-card');
      var target = parseFloat(card.getAttribute('data-target'));
      var decimals = parseInt(card.getAttribute('data-decimals') || '0', 10);
      c.textContent = decimals > 0 ? target.toFixed(decimals) : Math.round(target);
    });
    document.querySelectorAll('#lab-grid .lab-bar > span').forEach(function(span, i){
      span.style.width = span.closest('.lab-card').getAttribute('data-fill') || '82%';
    });
    var countEl = document.getElementById('labs-pin-count');
    if(countEl) countEl.textContent = '8 / 8';
    var labsBar = document.getElementById('labs-pin-bar');
    if(labsBar) labsBar.style.width = '100%';
    var pathoBar = document.getElementById('patho-pin-bar');
    if(pathoBar) pathoBar.style.width = '100%';
  }

  /* Pinning assumes the wide-screen layouts (multi-column lab grid,
     side-by-side patho panels). Below that breakpoint the stacked
     content is taller than the viewport and would get clipped inside
     a pinned 100vh section, so on narrow screens we skip pinning
     entirely and let the normal .reveal fade-ins handle it instead. */
  var PIN_BREAKPOINT = 820;

  function initPinnedSections(){
    if(!hasGSAP) return;
    if(window.innerWidth < PIN_BREAKPOINT) return;
    initLabsPin();
    initPathoPin();
  }

  initSimpleReveals();
  initHeroParallax();
  initPinnedSections();

  if(hasGSAP){
    var resizeTimer = null;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){
        var isNarrow = window.innerWidth < PIN_BREAKPOINT;
        var hasPins = pinnedTriggers.length > 0;
        if(isNarrow && hasPins){
          killPinned();
        } else if(!isNarrow && !hasPins && !document.body.classList.contains('presentation-mode')){
          initPinnedSections();
        }
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  /* ---------- section navigation (dots + keyboard) ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.slide'));
  var nav = document.getElementById('progress-nav');
  var dotButtons = [];

  sections.forEach(function(sec, i){
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', sec.getAttribute('data-title') || ('Sección ' + (i+1)));
    btn.title = sec.getAttribute('data-title') || '';
    btn.addEventListener('click', function(){
      jumpTo(sec);
    });
    nav.appendChild(btn);
    dotButtons.push(btn);
  });

  function jumpTo(target){
    if(hasGSAP){
      gsap.to(window, { duration:1, scrollTo:{ y: target, autoKill:true }, ease:'power2.inOut' });
    } else {
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  }

  function currentIndex(){
    var mid = window.scrollY + window.innerHeight / 2;
    var idx = 0;
    sections.forEach(function(sec, i){
      if(sec.offsetTop <= mid) idx = i;
    });
    return idx;
  }

  function updateDots(){
    var idx = currentIndex();
    dotButtons.forEach(function(b, i){
      b.classList.toggle('active', i === idx);
    });
  }
  updateDots();
  window.addEventListener('scroll', throttle(updateDots, 100), { passive:true });

  function throttle(fn, wait){
    var last = 0;
    return function(){
      var now = Date.now();
      if(now - last >= wait){ last = now; fn(); }
    };
  }

  function goToRelative(delta){
    var idx = currentIndex();
    var next = Math.min(Math.max(idx + delta, 0), sections.length - 1);
    jumpTo(sections[next]);
  }

  window.addEventListener('keydown', function(e){
    if(['ArrowDown','ArrowRight','PageDown'].indexOf(e.key) !== -1){
      e.preventDefault(); goToRelative(1);
    } else if(['ArrowUp','ArrowLeft','PageUp'].indexOf(e.key) !== -1){
      e.preventDefault(); goToRelative(-1);
    } else if(e.key === ' '){
      e.preventDefault(); goToRelative(1);
    }
  });

  /* ---------- presentation mode toggle ----------
     Pinned scrollytelling (labs / patho) is a "free mode" feature: in
     presentation mode we tear it down so each section behaves as a plain
     full-screen slide (content already revealed), better suited to
     projecting live and advancing with the keyboard. */
  var modeBtn = document.getElementById('btn-mode');
  modeBtn.addEventListener('click', function(){
    var on = document.body.classList.toggle('presentation-mode');
    modeBtn.classList.toggle('on', on);
    modeBtn.textContent = on ? 'Modo libre' : 'Modo presentación';

    if(!hasGSAP) return;

    if(on){
      killPinned();
    } else {
      initPinnedSections();
    }
    setTimeout(function(){ ScrollTrigger.refresh(); }, 60);
  });

})();
