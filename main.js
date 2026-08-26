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
  const dropdownParents = document.querySelectorAll('.has-dropdown');

  function forceMobileDropdown(menu){
    if(!menu) return;
    if(window.innerWidth <= 900){
      menu.style.setProperty('position', 'static', 'important');
      menu.style.setProperty('left', 'auto', 'important');
      menu.style.setProperty('right', 'auto', 'important');
      menu.style.setProperty('top', 'auto', 'important');
      menu.style.setProperty('transform', 'none', 'important');
      menu.style.setProperty('translate', 'none', 'important');
      menu.style.setProperty('margin', '0', 'important');
      menu.style.setProperty('padding', '2px 0 6px 16px', 'important');
      menu.style.setProperty('width', '100%', 'important');
      menu.style.setProperty('min-width', '0', 'important');
      menu.style.setProperty('max-width', '100%', 'important');
      menu.style.setProperty('box-sizing', 'border-box', 'important');
    } else {
      ['position','left','right','top','transform','translate','margin','padding',
       'width','min-width','max-width','box-sizing'].forEach(function(prop){
        menu.style.removeProperty(prop);
      });
    }
  }

  dropdownParents.forEach(function(parent){
    forceMobileDropdown(parent.querySelector('.dropdown'));
  });

  window.addEventListener('resize', function(){
    dropdownParents.forEach(function(parent){
      forceMobileDropdown(parent.querySelector('.dropdown'));
    });
  });

  if(burger && links){
    burger.addEventListener('click', function(){
      links.classList.toggle('open');
      dropdownParents.forEach(function(parent){
        forceMobileDropdown(parent.querySelector('.dropdown'));
      });
    });
  }

  document.querySelectorAll('.has-dropdown > a').forEach(function(a){
    a.addEventListener('click', function(e){
      if(window.innerWidth <= 900){
        e.preventDefault();
        const parent = a.parentElement;
        const menu = parent.querySelector('.dropdown');
        parent.classList.toggle('open');
        forceMobileDropdown(menu);

        if(parent.classList.contains('open') && menu){
          menu.style.setProperty('display', 'block', 'important');
          menu.style.setProperty('opacity', '1', 'important');
          menu.style.setProperty('visibility', 'visible', 'important');
        } else if(menu){
          menu.style.removeProperty('display');
          menu.style.removeProperty('opacity');
          menu.style.removeProperty('visibility');
        }
      }
    });
  });

  // Close both the Services submenu and hamburger menu after a service is selected.
  document.querySelectorAll('.dropdown a').forEach(function(a){
    a.addEventListener('click', function(){
      dropdownParents.forEach(function(parent){
        parent.classList.remove('open');
        const menu = parent.querySelector('.dropdown');
        if(menu){
          menu.style.removeProperty('display');
          menu.style.removeProperty('opacity');
          menu.style.removeProperty('visibility');
        }
      });
      if(links) links.classList.remove('open');
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


// Precise service anchor scrolling: line up each service at its emoji/title row
(function(){
  const ids = ['roadside','flat-tire','oil-change','balancing','alignment','maintenance'];

  function scrollToService(hash, smooth){
    const id = (hash || '').replace('#','');
    if(!ids.includes(id)) return false;
    const target = document.getElementById(id);
    if(!target) return false;
    const header = document.querySelector('header');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 14;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
    return true;
  }

  // Correct the browser's default hash position after the page has laid out.
  if(location.hash){
    window.addEventListener('load', function(){
      requestAnimationFrame(function(){ scrollToService(location.hash, false); });
    });
  }

  // Handle service links clicked while already on services.html.
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href*="services.html#"], a[href^="#"]');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');
    if(hashIndex < 0) return;
    const hash = href.slice(hashIndex);
    const id = hash.slice(1);
    if(!ids.includes(id)) return;

    const onServicesPage = /(^|\/)services\.html$/.test(location.pathname) || location.pathname.endsWith('/services');
    if(onServicesPage){
      e.preventDefault();
      history.pushState(null, '', hash);
      scrollToService(hash, true);
      document.querySelector('.nav-links')?.classList.remove('open');
      document.querySelectorAll('.has-dropdown').forEach(function(el){
        el.classList.remove('open');

        // Desktop dropdowns are also shown by :hover. After a service is
        // selected, hide the menu immediately and keep it hidden until the
        // pointer leaves the Services nav item so it doesn't stay stuck open.
        const menu = el.querySelector('.dropdown');
        if(menu){
          menu.style.display = 'none';
          const restore = function(){
            menu.style.removeProperty('display');
            el.removeEventListener('mouseleave', restore);
          };
          el.addEventListener('mouseleave', restore);
        }
      });
    }
  });
})();
