// Theme toggle (session-only, no persistence storage)
(function(){
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if(toggle){
    toggle.addEventListener('click', function(){
      const isDark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', isDark ? 'light' : 'dark');
      if(colorSchemeMeta){ colorSchemeMeta.setAttribute('content', isDark ? 'light' : 'dark'); }
      toggle.querySelector('.knob').textContent = isDark ? '\u2600' : '\u263D';
      toggle.setAttribute('aria-pressed', String(!isDark));
    });
  }
})();

// Split-word text reveal
(function(){
  function wrapWords(el){
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    let i = 0;
    nodes.forEach(function(node){
      if(node.nodeType === Node.TEXT_NODE){
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach(function(part){
          if(part.trim() === ''){
            el.appendChild(document.createTextNode(part));
          } else {
            const outer = document.createElement('span');
            outer.className = 'word';
            const inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.textContent = part;
            inner.style.setProperty('--i', i++);
            outer.appendChild(inner);
            el.appendChild(outer);
          }
        });
      } else {
        const outer = document.createElement('span');
        outer.className = 'word';
        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.appendChild(node.cloneNode(true));
        inner.style.setProperty('--i', i++);
        outer.appendChild(inner);
        el.appendChild(outer);
      }
    });
  }
  document.querySelectorAll('.split-text').forEach(wrapWords);
})();

// Video autoplay on scroll into view (like an Instagram/Twitter feed) + mute toggle
(function(){
  function tryPlay(video){
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    const p = video.play();
    if(p && p.catch){ p.catch(function(){}); }
  }

  const videos = document.querySelectorAll('.js-shop-video');

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        const video = entry.target;
        if(entry.isIntersecting){
          tryPlay(video);
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });
    videos.forEach(function(video){ io.observe(video); });
  } else {
    // No IntersectionObserver support: just play everything on load.
    videos.forEach(function(video){
      if(video.readyState >= 2){ tryPlay(video); }
      else { video.addEventListener('loadeddata', function(){ tryPlay(video); }, { once:true }); }
    });
  }

  // If autoplay is blocked entirely (rare, even when muted), retry on first user interaction.
  videos.forEach(function(video){
    const retry = function(){
      if(video.paused){ video.play().catch(function(){}); }
    };
    document.addEventListener('touchstart', retry, { passive:true });
    document.addEventListener('click', retry);
  });

  document.querySelectorAll('.js-mute-toggle').forEach(function(btn){
    const video = btn.closest('.video-frame').querySelector('.js-shop-video');
    if(!video) return;
    btn.addEventListener('click', function(){
      video.muted = !video.muted;
      btn.innerHTML = video.muted ? '&#128264; Sound Off' : '&#128266; Sound On';
      btn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    });
  });
})();

// Mobile nav
(function(){
  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if(burger && links){
    burger.addEventListener('click', function(){
      links.classList.toggle('open');
    });
  }
  document.querySelectorAll('.has-dropdown > a').forEach(function(a){
    a.addEventListener('click', function(e){
      if(window.innerWidth <= 900){
        e.preventDefault();
        a.parentElement.classList.toggle('open');
      }
    });
  });
})();

// Scroll reveal
(function(){
  const items = document.querySelectorAll('.reveal, .reveal-stagger');
  function showIfInView(el){
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight && rect.bottom > 0){
      el.classList.add('is-visible');
      return true;
    }
    return false;
  }
  if(!('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  items.forEach(function(el){
    // Reveal anything already in the initial viewport immediately,
    // instead of waiting on the observer's first callback.
    if(!showIfInView(el)){
      io.observe(el);
    }
  });
})();
