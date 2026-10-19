(function(){
  'use strict';
  const R=window.EQRenderer, content=window.EQ_CONTENT, uis=window.EQ_UI;
  const mode=window.EQ_STANDALONE?'hash':'path';
  let route, ui;
  const main=document.getElementById('main');
  const infoDialog=document.getElementById('site-info-dialog');
  let infoState=null;
  let cleanupTeam=()=>{};
  const esc=R.escape;
  const submenuGroups=['services','about','breadcrumb-services','breadcrumb-about'];
  let submenuCloseTimer=null;
  function cancelSubmenuClose(){if(submenuCloseTimer!==null){clearTimeout(submenuCloseTimer);submenuCloseTimer=null;}}
  function closeSubmenu(group,focus=false){
    const toggle=document.querySelector('.'+group+'-toggle');
    const submenu=document.getElementById(group+'-submenu');
    if(toggle)toggle.setAttribute('aria-expanded','false');
    if(submenu)submenu.hidden=true;
    if(focus)toggle?.focus();
  }
  function closeSubmenus(){cancelSubmenuClose();for(const group of submenuGroups)closeSubmenu(group);}
  function openSubmenu(group){
    cancelSubmenuClose();
    for(const other of submenuGroups)if(other!==group)closeSubmenu(other);
    document.querySelector('.'+group+'-toggle')?.setAttribute('aria-expanded','true');
    const submenu=document.getElementById(group+'-submenu');if(submenu)submenu.hidden=false;
  }
  function currentRoute(){return R.parseRoute(mode==='hash'?location.hash:location.pathname+location.search,mode);}
  function openInfo(type,opener){
    if(!infoDialog||!R.infoIds.includes(type))return;
    if(!infoDialog.open){
      infoState={opener:opener||document.activeElement,x:window.scrollX,y:window.scrollY};
      document.body.style.setProperty('--info-page-y',-infoState.y+'px');
      document.body.style.setProperty('--info-scrollbar-gap',Math.max(0,window.innerWidth-document.documentElement.clientWidth)+'px');
      document.body.classList.add('info-open');
    }
    infoDialog.innerHTML=R.renderInfo(uis,route.lang,type,content.company);
    if(!infoDialog.open)infoDialog.showModal();
    infoDialog.querySelector('.info-body').scrollTop=0;
    infoDialog.querySelector('[data-close-info]').focus({preventScroll:true});
  }
  function closeInfo(restore=true){
    if(!infoDialog?.open)return;
    const state=infoState;infoState=null;
    infoDialog.close();
    document.body.classList.remove('info-open');
    document.body.style.removeProperty('--info-page-y');
    document.body.style.removeProperty('--info-scrollbar-gap');
    if(restore&&state){
      if(state.opener?.isConnected)state.opener.focus({preventScroll:true});
      else main.focus({preventScroll:true});
      window.scrollTo({left:state.x,top:state.y,behavior:'instant'});
    }
  }
  infoDialog?.addEventListener('cancel',event=>{event.preventDefault();closeInfo();});
  infoDialog?.addEventListener('click',event=>{
    if(event.target!==infoDialog)return;
    const box=infoDialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeInfo();
  });
  function attachTeam(){
    const track=document.getElementById('team-track');
    const previous=document.getElementById('team-prev'),next=document.getElementById('team-next');
    if(!track||!previous||!next)return;
    const pause=document.getElementById('team-autoplay');
    let autoTimer=null,userPaused=false,hovered=false,focused=false;
    const mobile=()=>window.matchMedia('(max-width: 720px)').matches;
    const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const limit=()=>Math.max(0,track.scrollWidth-track.clientWidth);
    const stopAuto=()=>{if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null;}};
    const canPlay=()=>!mobile()&&!reduced()&&!userPaused&&!hovered&&!focused&&!document.hidden&&limit()>1;
    const schedule=()=>{stopAuto();if(canPlay())autoTimer=setTimeout(()=>{autoTimer=null;if(canPlay()){move(1,true);schedule();}},2800);};
    const sync=()=>{
      if(mobile()){track.scrollLeft=0;track.scrollTop=0;}
      track.tabIndex=mobile()?-1:0;previous.disabled=mobile()||track.scrollLeft<=1;next.disabled=mobile()||track.scrollLeft>=limit()-1;
      if(pause){pause.hidden=mobile()||reduced();pause.textContent=userPaused?ui.resumeTeam:ui.pauseTeam;pause.setAttribute('aria-pressed',String(userPaused));}
      schedule();
    };
    const move=(direction,loop=false)=>{
      if(mobile())return;
      const cards=track.querySelectorAll('.team-member');
      const stride=cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:track.clientWidth;
      const left=loop&&track.scrollLeft>=limit()-1?0:Math.max(0,Math.min(limit(),track.scrollLeft+direction*stride));
      track.scrollTo({left,behavior:reduced()?'instant':'smooth'});
    };
    previous.addEventListener('click',()=>move(-1));
    next.addEventListener('click',()=>move(1));
    pause?.addEventListener('click',()=>{userPaused=!userPaused;sync();});
    track.addEventListener('pointerenter',()=>{hovered=true;stopAuto();});
    track.addEventListener('pointerleave',()=>{hovered=false;schedule();});
    track.addEventListener('focusin',()=>{focused=true;stopAuto();});
    track.addEventListener('focusout',event=>{if(!track.contains?.(event.relatedTarget)){focused=false;schedule();}});
    track.addEventListener('wheel',schedule,{passive:true});
    track.addEventListener('scroll',sync,{passive:true});
    track.addEventListener('keydown',event=>{
      if(mobile()||event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      if(event.key==='ArrowLeft'||event.key==='ArrowRight')move(event.key==='ArrowLeft'?-1:1);
      else track.scrollTo({left:event.key==='Home'?0:limit(),behavior:'instant'});
    });
    const observer=window.ResizeObserver?new window.ResizeObserver(sync):null;
    const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedQuery.addEventListener('change',sync);
    document.addEventListener('visibilitychange',schedule);
    observer?.observe(track);cleanupTeam=()=>{stopAuto();observer?.disconnect();reducedQuery.removeEventListener?.('change',sync);document.removeEventListener?.('visibilitychange',schedule);};
    sync();
  }
  function render({focus=false,keepScroll=false}={}){
    closeInfo(false);
    cleanupTeam();cleanupTeam=()=>{};
    route=currentRoute();
    ui=uis[route.lang];
    const page=R.render(content,uis,route.lang,route.id,{mode,assets:window.EQ_ASSETS||{},query:route.query});
    document.documentElement.lang=page.lang;
    document.title=page.title;
    document.querySelector('meta[name=description]')?.setAttribute('content',page.description);
    document.getElementById('site-header').innerHTML=page.header;
    closeSubmenus();
    main.innerHTML=page.main;
    document.getElementById('site-footer').innerHTML=page.footer;
    attachTeam();
    if(focus)main.focus({preventScroll:true});
    if(!keepScroll)window.scrollTo({top:0,left:0,behavior:'instant'});
    if(route.info){
      const base=mode==='hash'?'#/'+route.lang+'/':R.pathFor(route.lang,'');
      const q=route.query.toString();
      try{history.replaceState(null,'',base+(q?'?'+q:''));}catch{}
      openInfo(route.info,main);
    }
  }
  function navigate(target,{keepScroll=false,focus=true}={}){
    if(mode==='hash'){
      const newHash=target.startsWith('#')?target:'#'+target;
      if(location.hash===newHash){render({keepScroll,focus});return;}
      try{history.pushState(null,'',newHash);}
      catch{location.hash=newHash;return;}
    }else history.pushState(null,'',target);
    render({keepScroll,focus});
  }
  document.addEventListener('click',event=>{
    for(const group of submenuGroups){
      const submenuToggle=event.target.closest('.'+group+'-toggle');
      if(submenuToggle){
        event.preventDefault();
        cancelSubmenuClose();
        const open=submenuToggle.getAttribute('aria-expanded')!=='true';
        for(const other of submenuGroups)if(other!==group)closeSubmenu(other);
        submenuToggle.setAttribute('aria-expanded',String(open));
        const submenu=document.getElementById(group+'-submenu');
        if(submenu)submenu.hidden=!open;
        return;
      }
    }
    for(const group of submenuGroups)if(!event.target.closest('.'+group+'-nav'))closeSubmenu(group);
    if(event.target.closest('[data-close-info]')){event.preventDefault();closeInfo();return;}
    const infoButton=event.target.closest('[data-info]');
    if(infoButton){event.preventDefault();openInfo(infoButton.dataset.info,infoButton);return;}
    const topAction=event.target.closest('[data-scroll-top]');
    if(topAction){
      event.preventDefault();
      document.getElementById('top')?.focus({preventScroll:true});
      window.scrollTo({top:0,left:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      return;
    }
    const companyPause=event.target.closest('[data-company-pause]');
    if(companyPause){
      event.preventDefault();
      const showcase=companyPause.closest('.company-showcase');
      const paused=showcase.dataset.paused!=='true';
      showcase.dataset.paused=String(paused);
      companyPause.setAttribute('aria-pressed',String(paused));
      companyPause.textContent=paused?ui.resumeCompanies:ui.pauseCompanies;
      return;
    }
    const link=event.target.closest('a');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
    if(link.classList.contains('skip-link')){event.preventDefault();main.focus();return;}
    const href=link.getAttribute('href');
    if(!href)return;
    const isLocal=mode==='hash'?href.startsWith('#/'):href.startsWith('/')&&!href.startsWith('//');
    if(isLocal){event.preventDefault();navigate(href,{keepScroll:link.closest('.languages')!==null});}
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(infoDialog?.open)return;
    for(const group of submenuGroups){
      if(document.querySelector('.'+group+'-toggle')?.getAttribute('aria-expanded')==='true'){
        event.preventDefault?.();closeSubmenu(group,true);return;
      }
    }
  });
  document.addEventListener('focusin',event=>{
    for(const group of submenuGroups)if(!event.target.closest('.'+group+'-nav'))closeSubmenu(group);
  });
  document.addEventListener('pointerover',event=>{
    if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    for(const group of submenuGroups){
      const nav=event.target.closest('.'+group+'-nav');
      if(nav&&!nav.contains(event.relatedTarget)){openSubmenu(group);return;}
    }
  });
  document.addEventListener('pointerout',event=>{
    if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    for(const group of submenuGroups){
      const nav=event.target.closest('.'+group+'-nav');
      if(nav&&!nav.contains(event.relatedTarget)){
        cancelSubmenuClose();
        submenuCloseTimer=setTimeout(()=>{submenuCloseTimer=null;closeSubmenu(group);},180);
        return;
      }
    }
  });
  addEventListener('popstate',()=>render({focus:true}));
  if(mode==='hash')addEventListener('hashchange',()=>render({focus:true}));
  window.matchMedia('(max-width: 960px)').addEventListener('change',event=>{
    if(event.matches)return;
    closeSubmenus();
  });
  render();
})();
