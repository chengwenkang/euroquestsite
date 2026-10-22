(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EQRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';
  const serviceIds=['business-development','sports-venues','acquisitions','sourcing-projects','creative-production'];
  const categoryIds=['business','sports','sale','acquisition','sourcing','creative','partner','collaboration','careers'];
  const categoryByService={'business-development':'business',acquisitions:'acquisition','sourcing-projects':'sourcing','creative-production':'creative','sports-venues':'sports'};
  const imageByService={'business-development':'thumb-market-v2.webp',acquisitions:'thumb-acquisition-v3.webp','sourcing-projects':'supply-map-en.svg','creative-production':'thumb-creative.webp','sports-venues':'sports-court.svg'};
  const products=[
    {id:'bathroom-pod',image:'modular-building.webp',category:'modular',name:{en:'Modular buildings & integrated units',pt:'Construção modular e unidades integradas',zh:'模块化建筑与集成单元'},description:{en:'From complete modular buildings and prefabricated room units to integrated bathrooms and building components, with supplier and project coordination around your requirements',pt:'De edifícios modulares completos e módulos espaciais a instalações sanitárias integradas e componentes de construção, com coordenação de fornecedores e projetos de acordo com os requisitos',zh:'涵盖整体模块化建筑、预制空间模块、整体卫浴及建筑构件，按项目需求协调供应商、技术资料与交付安排'}},
    {id:'industrial',image:'sourcing.webp',category:'industry',name:{en:'Industrial equipment & components',pt:'Equipamentos e componentes industriais',zh:'工业装备与部件'},description:{en:'Connect with suppliers of industrial equipment and precision components, as well as manufacturing partners for your project',pt:'Ligação a fornecedores de equipamentos industriais e componentes de precisão, bem como a parceiros de fabrico para o projeto',zh:'围绕项目需求，对接工业设备、精密部件及制造合作资源'}},
    {id:'interiors',image:'bathroom-interior.jpg',category:'modular',stock:true,name:{en:'Bathroom & interior products',pt:'Produtos para casas de banho e interiores',zh:'卫浴与室内配套'},description:{en:'Bathroom products and interior supply coordination for hotels, residential and commercial spaces',pt:'Produtos sanitários e coordenação de fornecimentos para hotéis, habitações e espaços comerciais',zh:'围绕酒店、住宅及商业空间，对接卫浴产品与配套供应资源'}},
    {id:'animation',image:'creative.webp',category:'creative',name:{en:'Video & animation production',pt:'Produção de vídeo e animação',zh:'视频与动画制作'},description:{en:'Production coordination for brand video, animation and multilingual content',pt:'Coordenação de produção de vídeo de marca, animação e conteúdos multilingues',zh:'围绕品牌视频、动画与跨语种内容协调制作需求'}}
  ];
  const escape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines = value=>escape(value).replace(/\n/g,'<br>');
  function protectChineseTerms(markup){
    let literal=false;
    return markup.split(/(<[^>]*>)/g).map(part=>{
      if(part.startsWith('<')){
        if(/^<(textarea|pre|script|style|option)\b/i.test(part))literal=true;
        else if(/^<\/(textarea|pre|script|style|option)\b/i.test(part))literal=false;
        return part;
      }
      return literal?part:part.replace(/中国区业务总监|项目合作伙伴|主要创始人|联合创始人|国际市场|中国市场|合作伙伴|合作方向|合作方|项目协作|项目伙伴|专业团队|供应商|合作/g,term=>'<span class="keep-together">'+term+'</span>');
    }).join('');
  }

  const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const diagonal='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const icons=[
    '<circle cx="16" cy="16" r="11"/><path d="m21 11-3 7-7 3 3-7 7-3Z"/>',
    '<path d="M5 11h20l-5-5M27 21H7l5 5M25 11l-5 5M7 21l5-5"/>',
    '<path d="m11 20-2 2a6 6 0 0 1-8-8l6-6a6 6 0 0 1 8 0m6 4 2-2a6 6 0 0 1 8 8l-6 6a6 6 0 0 1-8 0M10 22l12-12"/>',
    '<rect x="3" y="5" width="26" height="22" rx="3"/><path d="m13 11 8 5-8 5V11Z"/>'
  ];
  const workflowIcons={
    target:'<circle cx="32" cy="32" r="23"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="5"/><path d="m32 32 23-23m-1 1-8-1 1 8"/>',
    search:'<rect x="9" y="9" width="30" height="40" rx="3"/><path d="M16 18h15M16 25h10M16 34h7"/><circle cx="40" cy="37" r="12"/><path d="m49 46 9 10M35 37h10m-5-5v10"/>',
    conversation:'<path d="M8 11h35a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H25L13 49V39H8a5 5 0 0 1-5-5V16a5 5 0 0 1 5-5Z"/><path d="M49 26h7a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-2v8L43 51H32M14 22h24M14 29h16"/>',
    checklist:'<rect x="13" y="10" width="38" height="48" rx="4"/><rect x="23" y="5" width="18" height="10" rx="3" fill="#fcfaf6"/><path d="m21 28 3 3 6-7m-9 19 3 3 6-7M35 28h9M35 43h9"/>',
    advisors:'<circle cx="32" cy="17" r="8"/><circle cx="12" cy="27" r="6"/><circle cx="52" cy="27" r="6"/><path d="M18 52V40a14 14 0 0 1 28 0v12H18ZM3 53v-9a9 9 0 0 1 14-8M61 53v-9a9 9 0 0 0-14-8M28 36l4 5 4-5m-4 5v10"/>',
    clipboard:'<rect x="12" y="9" width="40" height="49" rx="4"/><rect x="22" y="5" width="20" height="10" rx="3" fill="#fcfaf6"/><path d="M23 26h20M23 36h20M23 46h13M18 26h0M18 36h0M18 46h0"/>',
    technical:'<rect x="5" y="9" width="31" height="44" rx="3"/><path d="M12 18h16M12 26h10M12 35h9M40 24l4-3 5 2 4-1 4 5-1 4 3 4-1 6-4 2-2 5-6 1-3-3-5-1-3-5 1-5-2-4 3-5 3-2Z"/><circle cx="46" cy="35" r="6"/>',
    calendar:'<rect x="7" y="13" width="49" height="44" rx="4"/><path d="M7 25h49M19 7v12M44 7v12m-25 22 8 8 15-16"/>',
    storyboard:'<rect x="5" y="12" width="54" height="41" rx="3"/><path d="M5 24h54M22 24v29M41 24v29M12 18h6M28 18h6M45 18h6m-18 15 5 5-5 5V33Z"/>',
    production:'<rect x="5" y="9" width="54" height="37" rx="3"/><path d="M24 55h16M32 46v9m-6-36 14 9-14 9V19Z"/>',
    delivery:'<path d="M6 18V9h20l8 9h24v36H6V18Z"/><circle cx="35" cy="36" r="12"/><path d="m29 36 4 4 9-10"/>'
  };
  const routeAliases={'products':'sourcing-projects','product/bathroom-pod':'sourcing-projects','product/industrial':'sourcing-projects','product/interiors':'sourcing-projects','product/animation':'creative-production'};
  const infoIds=['privacy','credits'];
  const knownRoutes=['','services',...serviceIds,'sectors','partners','about','team','contact'];
  function pathFor(lang,id=''){
    const prefix=lang==='en'?'':lang+'/';
    return '/'+prefix+(id?id+'/':'');
  }
  function parseRoute(input,mode='hash'){
    const raw=String(input||'').replace(/^#/,'');
    const [path,q='']=raw.split('?');
    const bits=path.split('/').filter(Boolean);
    let lang='en';
    if(['en','pt','zh'].includes(bits[0]))lang=bits.shift();
    const id=bits.join('/');
    return {lang,id:infoIds.includes(id)?'':routeAliases[id]||id,info:infoIds.includes(id)?id:'',query:new URLSearchParams(q)};
  }
  function render(data, uis, lang='en', id='', options={}){
    if(!['en','pt','zh'].includes(lang)) lang='en';
    id=infoIds.includes(id)?'':routeAliases[id]||id;
    const u=uis[lang], pages=data.pages[lang], query=new URLSearchParams(options.query||'');
    const mode=options.mode||'hash', assets=options.assets||{};
    const img=name=>assets[name]||'/assets/'+name;
    const serviceImage=pid=>pid==='sourcing-projects'?'supply-map-'+lang+'.svg':imageByService[pid];
    const href=(page='',params={},l=lang)=>{
      const q=new URLSearchParams(params).toString();
      return (mode==='hash'?'#/'+l+'/'+page:pathFor(l,page))+(q?'?'+q:'');
    };
    const button=(label,page='contact',params={},secondary=false)=>`<a class="button${secondary?' button-outline':''}" href="${escape(href(page,params))}"><span>${escape(label)}</span>${arrow}</a>`;
    const textLink=(label,page,params={})=>`<a class="text-link" href="${escape(href(page,params))}"><span class="link-label">${escape(label)}</span>${arrow}</a>`;
    const number=n=>String(n+1).padStart(2,'0');
    const icon=i=>`<svg class="service-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[i]}</svg>`;
    const figure=(name,alt,cls='',eager=false)=>`<figure class="photo ${cls}"><img src="${escape(img(name))}" alt="${escape(alt)}" width="1536" height="1024" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}></figure>`;
    const categoryMenu=(group,category,header=false)=>{
      const children=category==='services'?serviceIds:['partners','team','sectors'];
      const selected=id===category||children.includes(id);
      const label=header?u.nav[category==='services'?0:1]:u[category];
      const linkClass=header?` class="${category}-overview${selected?' is-current':''}"`:'';
      return `<div class="${group}-nav${header?'':' breadcrumb-parent'}"><a${linkClass} href="${href(category)}"${id===category?' aria-current="page"':''}>${header?`<span>${escape(label)}</span>`:escape(label)}</a><button class="${group}-toggle${selected?' is-current':''}" id="${group}-toggle" type="button" aria-expanded="false" aria-controls="${group}-submenu" aria-label="${escape(category==='about'?u.aboutNavigation:u.services)}"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><ul class="${group}-submenu" id="${group}-submenu" hidden>${children.map(p=>`<li><a href="${href(p)}"${id===p?' aria-current="page"':''}><span>${escape(category==='services'?pages[p].title:u[p])}</span>${arrow}</a></li>`).join('')}</ul></div>`;
    };
    const breadcrumb=(label,parent)=>{
      if(!label&&!parent)return '';
      const index=!parent&&['services','about'].includes(id);
      return `<nav class="breadcrumb" aria-label="${escape(u.breadcrumbLabel)}"><a href="${href()}">${escape(u.home)}</a>${parent?`<span aria-hidden="true">/</span>${categoryMenu('breadcrumb-'+parent,parent)}`:''}${label?`<span aria-hidden="true">/</span>${index?categoryMenu('breadcrumb-'+id,id):`<span aria-current="page">${escape(label)}</span>`}`:''}</nav>`;
    };
    const pageHero=(label,heading,intro,parent='')=>`${breadcrumb(parent||label!==heading?label:'',parent)}<section class="page-hero"><h1>${lines(heading)}</h1>${intro?`<p class="lead">${lines(intro)}</p>`:''}</section>`;
    const pageTitle=()=>id==='credits'?u.sources:pages[id]?.title||u[id];
    const navGroup=['services',...serviceIds];
    const active=navGroup.includes(id)?'services':['about','team','sectors','partners'].includes(id)?'about':'';
    const servicesNavigation=categoryMenu('services','services',true);
    const aboutNavigation=categoryMenu('about','about',true);
    const previewBar=mode==='hash'?`<div class="preview-bar"><div class="container preview-inner"><span class="preview-status"><i aria-hidden="true"></i>${escape(u.preview)}</span><span class="preview-note">${escape(u.previewNote)}</span></div></div>`:'';
    const header=`${previewBar}
      <a href="#main" class="skip-link">${escape(u.skip)}</a>
      <header class="site-header" id="top" tabindex="-1"><div class="container header-inner">
        <a class="brand" href="${href()}" aria-label="EUROQUEST · ${escape(u.home)}"><img src="${escape(img('logo.png'))}" alt="EUROQUEST" width="2161" height="728">${lang==='zh'?'<span class="brand-chinese">欧远事务所</span>':''}</a>
        <nav class="desktop-nav" id="site-navigation" aria-label="${escape(u.navigation)}">${servicesNavigation}${aboutNavigation}<div class="languages" role="group" aria-label="${escape(u.languages)}">${[['en','EN','English'],['pt','PT','Português'],['zh','中文','中文']].map(([l,label,title])=>`<a href="${escape(href(id,Object.fromEntries(query),l))}" lang="${l==='pt'?'pt-PT':l==='zh'?'zh-CN':'en'}" hreflang="${l}" aria-label="${title}"${l===lang?' aria-current="true"':''}>${label}</a>`).join('')}</div></nav>
        <div class="header-actions">${id==='contact'?`<span class="header-contact" aria-current="page">${escape(u.talk)}</span>`:`<a class="header-contact" href="${href('contact')}">${escape(u.talk)}${diagonal}</a>`}</div>
      </div></header>`;
    const footer=`<footer class="site-footer"><div class="container footer-simple"><span>${escape(u.copyright)}</span><nav aria-label="${escape(u.footerLegal)}">${infoIds.map(type=>`<button class="footer-info" type="button" data-info="${type}" aria-haspopup="dialog" aria-controls="site-info-dialog">${escape(type==='credits'?u.sources:u.privacy)}</button>`).join('')}</nav><button class="back-top" type="button" data-scroll-top aria-label="${escape(u.backTop)}" title="${escape(u.backTop)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14M12 20V8m-5 5 5-5 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${escape(u.backTop)}</span></button></div></footer>`;
    const sportsSolutions=p=>`<section class="sourcing-products sports-solutions"><h2>${escape(p.solutionsHeading)}</h2><div class="sports-grid">${p.solutions.map(([t,s],i)=>`<article><span class="card-number">${number(i)}</span><h3>${escape(t)}</h3><p>${escape(s)}</p></article>`).join('')}</div></section>`;
    const sourcingProducts=()=>`<section class="sourcing-products" aria-labelledby="sourcing-products-heading"><h2 id="sourcing-products-heading">${escape(u.sourcingProductsHeading)}</h2><div class="sourcing-product-grid">${products.filter(p=>p.id!=='animation').map(p=>`<article data-product="${p.id}">${figure(p.image,p.name[lang])}<div class="sourcing-product-copy"><h3>${escape(p.name[lang])}</h3>${p.id==='bathroom-pod'?`<ul class="plain-list modular-scope-items">${u.modularScopeItems.map(item=>`<li>${escape(item)}</li>`).join('')}</ul>`:`<p>${escape(p.description[lang])}</p>`}</div></article>`).join('')}</div></section>`;
    const scopeCopy=copy=>`<div class="scope-copy">${copy.split('\n').filter(Boolean).map(paragraph=>`<p>${escape(paragraph)}</p>`).join('')}</div>`;
    const workflow=p=>`<figure class="workflow-figure"><ol class="workflow" aria-label="${escape(u.workHeading)}">${p.workflow.map(([title,detail,kind],i)=>`<li class="workflow-step"><div class="workflow-art"><span class="workflow-number">${number(i)}</span><svg class="workflow-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${workflowIcons[kind]}</svg></div><div class="workflow-copy"><h3>${escape(title)}</h3><p>${escape(detail)}</p></div>${i<3?'<svg class="workflow-connector" viewBox="0 0 40 20" fill="none" aria-hidden="true"><path d="M1 10h36m-8-7 8 7-8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</li>`).join('')}</ol></figure>`;
    const serviceList=(withImage=false)=>`<div class="${withImage?'service-cards':'service-grid'}">${serviceIds.map((p,i)=>withImage?`<a class="service-card" href="${href(p)}"><figure><img src="${escape(img(serviceImage(p)))}" alt="${escape(pages[p].title)}" loading="lazy" width="1536" height="1024"></figure><div class="service-card-copy"><span class="card-number">${number(i)}</span><h2><span class="service-card-title">${escape(pages[p].title)}</span>${diagonal}</h2><p>${escape(pages[p].short)}</p></div></a>`:`<a class="service-entry" href="${href(p)}"><div class="service-entry-top"><span class="card-number">${number(i)}</span><span class="service-thumbnail"><img src="${escape(img(serviceImage(p)))}" alt="${escape(pages[p].title)}" width="512" height="512" loading="lazy"></span>${diagonal}</div><h3>${escape(pages[p].title)}</h3><p>${escape(pages[p].short)}</p></a>`).join('')}</div>`;
    const personName=person=>person.name[lang].split('｜').map((part,i)=>`<span class="person-name-part">${i?'｜':''}${escape(part)}</span>`).join('');
    const memberCard=person=>`<article class="person-card team-member" data-member="${escape(person.id)}">${person.photo?`<figure class="team-photo"><img src="${escape(img(person.photo))}" alt="${escape(person.name[lang])}" width="${person.photoWidth}" height="${person.photoHeight}" loading="eager" decoding="async"></figure>`:`<div class="person-initials" aria-hidden="true">${escape(person.initials)}</div>`}<div class="person-copy"><h2>${personName(person)}</h2>${person.role?.[lang]?`<p class="person-role">${escape(person.role[lang])}</p>`:''}${person.intro?.[lang]?`<p>${escape(person.intro[lang])}</p>`:''}<div class="person-contact-links"><a href="mailto:${escape(person.email)}"><span>${escape(person.email)}</span>${diagonal}</a>${person.whatsapp?`<a href="https://wa.me/${escape(person.whatsapp)}" target="_blank" rel="noopener noreferrer"><span>WhatsApp <span class="person-phone">${escape(person.phoneDisplay)}</span></span>${diagonal}</a>`:''}${person.phone?`<a href="tel:+${escape(person.phone)}"><span>${escape(u.phone)} <span class="person-phone">${escape(person.phoneDisplay)}</span></span>${diagonal}</a>`:''}${person.wechat?`<p class="person-wechat"><span>${escape(u.wechat)}</span><span class="wechat-id">${escape(person.wechat)}</span></p>`:''}</div></div></article>`;
    function home(){return `<section class="home-hero container"><div class="hero-copy"><h1>${lines(u.hero)}</h1><p class="hero-intro">${escape(u.heroIntro)}</p></div><div class="hero-image-wrap">${figure('hero.webp',u.illustration,'hero-photo',true)}</div></section>
      <section class="section container home-service-section"><div class="section-heading"><h2>${escape(u.homeServicesHeading)}</h2></div>${serviceList()}</section>`;}
    function services(){const p=pages.services;return `<div class="container">${pageHero(u.services,p.heading,'')}${serviceList(true)}</div>`;}
    function service(){const p=pages[id],n=serviceIds.indexOf(id);return `<div class="container">${breadcrumb(p.title,'services')}<section class="service-hero" data-service="${escape(id)}"><div class="service-hero-copy"><h1>${lines(p.heading)}</h1><p class="lead">${lines(p.intro)}</p></div>${figure(serviceImage(id),p.title,'service-hero-photo',true)}</section>${id==='sourcing-projects'?sourcingProducts():''}${id==='sports-venues'?sportsSolutions(p):''}<section class="section process-section"><div class="section-heading"><div><h2>${escape(u.workHeading)}</h2></div></div>${workflow(p)}</section><section class="deliverable-section"><div><h2>${escape(u.deliverables)}</h2><ul class="check-list">${p.deliverables.map(v=>`<li>${escape(v)}</li>`).join('')}</ul></div><div><h2>${escape(u.inputs)}</h2><ul class="plain-list">${p.inputs.map(v=>`<li>${escape(v)}</li>`).join('')}</ul></div></section><aside class="scope-note"><h2>${escape(u.scope)}</h2>${scopeCopy(p.boundary)}</aside></div>`;}
    function sectors(){const p=pages.sectors;return `<div class="container">${pageHero(u.sectors,p.heading,p.intro,'about')}<div class="sector-grid">${p.items.map(([title,description,service],i)=>`<article${service==='creative-production'?' class="sector-creative"':''}>${figure(['modular-building.webp','sourcing.webp','environment.jpg','thumb-creative.webp'][i],title)}<div class="sector-copy"><span class="card-number">${number(i)}</span><h2>${escape(title)}</h2><p>${escape(description)}</p></div></article>`).join('')}</div><p class="sectors-expanding"><span class="expansion-dots" aria-hidden="true">…</span><span>${escape(u.sectorsExpanding)}</span></p></div>`;}
    function about(){const p=pages.about,founder=data.team.find(person=>person.id==='diana-ji');return `<div class="container">${pageHero(u.about,p.heading,p.intro)}${figure('portugal-night.webp',u.portugalIllustration,'about-banner',true)}<section class="founder-background" aria-labelledby="founder-background-heading"><figure class="founder-portrait"><img src="${escape(img(founder.photo))}" alt="${escape(founder.name[lang])}" width="${founder.photoWidth}" height="${founder.photoHeight}" loading="lazy" decoding="async"></figure><div class="founder-story"><h2 id="founder-background-heading">${escape(u.founderBackgroundHeading)}</h2>${p.founderBackground.split('\n').map(copy=>`<p>${escape(copy)}</p>`).join('')}</div></section><section class="about-advantages" aria-labelledby="about-advantages-heading"><h2 id="about-advantages-heading">${escape(p.advantagesHeading)}</h2><div class="about-advantages-grid">${p.advantages.map(([heading,copy],i)=>`<article><span class="card-number">${number(i)}</span><h3>${escape(heading)}</h3><p>${escape(copy)}</p></article>`).join('')}</div></section><nav class="about-directions" aria-label="${escape(u.aboutNavigation)}">${[['partners','aboutPartnersIntro'],['team','aboutTeamIntro'],['sectors','aboutSectorsIntro']].map(([route,description])=>`<a class="about-direction" href="${href(route)}"><span class="about-direction-title">${escape(u[route])}</span><span class="about-direction-description">${escape(u[description])}</span>${arrow}</a>`).join('')}</nav></div>`;}
    function team(){return `<div class="container">${pageHero(u.team,u.teamHeading,'','about')}<section class="team-carousel" aria-label="${escape(u.teamCarousel)}"><div class="team-carousel-controls"><button type="button" id="team-autoplay" aria-controls="team-track" aria-pressed="false">${escape(u.pauseTeam)}</button><button type="button" id="team-prev" aria-controls="team-track" aria-label="${escape(u.previousMember)}" disabled>${arrow}</button><button type="button" id="team-next" aria-controls="team-track" aria-label="${escape(u.nextMember)}">${arrow}</button></div><div class="team-list" id="team-track" tabindex="0" aria-label="${escape(u.teamCarousel)}">${data.team.map(memberCard).join('')}</div></section></div>`;}
    function signedCompanies(){
      const companies=(data.partnerCompanies||[]).filter(company=>company.signed===true&&company.name);
      if(companies.length<2)return '';
      const item=company=>{const name=typeof company.name==='string'?company.name:company.name[lang]||company.name.en||Object.values(company.name).find(Boolean)||'';const nameLanguage=company.nameLanguage?` lang="${escape(company.nameLanguage)}"`:'';return `<li>${company.logo?`<img src="${escape(img(company.logo))}" alt="${escape(name)}"${nameLanguage} loading="lazy" width="220" height="100">`:`<span class="company-name"${nameLanguage}>${escape(name)}</span>`}${company.europeExclusive===true?`<span class="company-role">${escape(u.exclusiveEurope)}</span>`:''}</li>`;};
      const group=duplicate=>`<ul class="company-group"${duplicate?' aria-hidden="true"':''}>${companies.map(item).join('')}</ul>`;
      return `<section class="company-showcase${companies.length>1?' is-scrolling':''}" aria-labelledby="signed-partners-heading" data-paused="false"><div class="company-showcase-heading"><h2 id="signed-partners-heading">${escape(u.signedPartners)}</h2>${companies.length>1?`<button type="button" data-company-pause aria-pressed="false">${escape(u.pauseCompanies)}</button>`:''}</div><div class="company-window" tabindex="0" aria-label="${escape(u.signedPartners)}"><div class="company-track">${group(false)}${companies.length>1?group(true):''}</div></div></section>`;
    }
    function partners(){const p=pages.partners;return `<div class="container">${pageHero(u.partners,p.heading,p.intro,'about')}${signedCompanies()}<div class="partner-grid">${p.items.map(([a,b],i)=>`<article><span class="card-number">${number(i)}</span><h2>${escape(a)}</h2><p>${escape(b)}</p></article>`).join('')}</div><section class="partner-brief"><div><h2>${escape(u.inputs)}</h2></div><ul class="plain-list">${p.inputs.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></section><aside class="scope-note"><h2>${escape(u.scope)}</h2>${scopeCopy(p.boundary)}</aside></div>`;}
    const companyDetails=()=>`<section class="company-details" aria-labelledby="company-details-heading"><h2 id="company-details-heading">${escape(u.companyInfo)}</h2><p class="company-legal-name">${escape(data.company.legalName)}</p><dl class="company-facts"><div><dt>${escape(u.businessAddress)}</dt><dd><address>${lines(data.company.officeAddress)}</address></dd></div><div><dt>${escape(u.registeredAddress)}</dt><dd><address>${lines(data.company.registeredAddress)}</address></dd></div><div><dt>${escape(u.taxNumber)}</dt><dd>${escape(data.company.nipc)}</dd></div><div><dt>${escape(u.vatNumber)}</dt><dd>${escape(data.company.vatNumber)}</dd></div></dl></section>`;
    const contactTopics=()=>`<section class="contact-topics" aria-labelledby="contact-topics-heading"><h3 id="contact-topics-heading">${escape(u.contactTopicsTitle)}</h3><p>${escape(u.contactTopicsNote)}</p><ul>${u.categories.map((label,i)=>`<li><a href="mailto:${escape(data.team[0].email)}?subject=${encodeURIComponent('EUROQUEST · '+label)}" data-category="${categoryIds[i]}">${escape(label)}</a></li>`).join('')}</ul></section>`;
    function contact(){return `<div class="container">${pageHero(u.contact,u.contactTitle,u.contactIntro)}<aside class="contact-panel contact-direct"><h2>${personName(data.team[0])}</h2><p>${escape(data.team[0].role[lang])}</p><div class="contact-direct-methods"><div class="contact-line"><span>${escape(u.email)}</span><a href="mailto:${escape(data.team[0].email)}"><span>${escape(data.team[0].email)}</span>${diagonal}</a></div><div class="contact-line"><span>WhatsApp</span><a href="https://wa.me/${escape(data.team[0].whatsapp)}" target="_blank" rel="noopener noreferrer"><span>${escape(data.team[0].phoneDisplay)}</span>${diagonal}</a></div>${data.company.wechat?`<div class="contact-line contact-wechat"><span>${escape(u.wechat)}</span><span class="wechat-id">${escape(data.company.wechat)}</span></div>`:''}</div>${contactTopics()}</aside>${companyDetails()}</div>`;}
    function missing(){return `<div class="container missing"><p class="eyebrow">404</p><h1>${escape(u.notFound)}</h1>${button(u.returnHome,'')}</div>`;}
    let main;
    if(!id)main=home();
    else if(id==='services')main=services();
    else if(serviceIds.includes(id))main=service();
    else if(id==='sectors')main=sectors();
    else if(id==='about')main=about();
    else if(id==='team')main=team();
    else if(id==='partners')main=partners();
    else if(id==='contact')main=contact();
    else main=missing();
    return {header:lang==='zh'?protectChineseTerms(header):header,main:lang==='zh'?protectChineseTerms(main):main,footer:lang==='zh'?protectChineseTerms(footer):footer,title:(id?pageTitle()||'404':u.position)+' | EUROQUEST',description:pages[id]?.intro||u.heroIntro,lang:{en:'en',pt:'pt-PT',zh:'zh-CN'}[lang],href:(p,params,l)=>href(p,params,l)};
  }
  function renderInfo(uis,lang='en',type='privacy',company=null){
    if(!infoIds.includes(type))return '';
    if(!['en','pt','zh'].includes(lang))lang='en';
    const u=uis[lang];
    const title=type==='privacy'?u.privacy:u.sources;
    const intro=type==='privacy'?u.privacyIntro:u.creditsIntro;
    const section=(heading,copy)=>`<section><h3>${escape(heading)}</h3><p>${lines(copy)}</p></section>`;
    const body=type==='privacy'?[['privacyLocalTitle','privacyLocal'],['privacyTrackingTitle','privacyTracking'],['privacyExternalTitle','privacyExternal']].map(([a,b])=>section(u[a],a==='privacyLocalTitle'&&company?u[b]+'\n\n'+company.legalName+'\nNIPC '+company.nipc+'\n'+u.registeredAddress+'\n'+company.registeredAddress+'\n\n'+u.privacyDataRequests.replace('{email}',company.email):u[b])).join(''):
      `${section(u.creditsAI,u.creditsAIDesc)}<section><h3>${escape(u.creditsStock)}</h3><ul class="info-credit-links">${u.creditsStockDesc.split('\n').map((copy,i)=>`<li><a href="${['https://www.pexels.com/photo/interior-of-light-spacious-bathroom-7045911/','https://www.pexels.com/photo/aerial-view-of-a-sewage-plant-11452356/'][i]}" target="_blank" rel="noopener noreferrer">${escape(copy)} ↗</a></li>`).join('')}</ul></section>${section(u.creditsLogo,u.creditsLogoDesc)}`;
    const markup=`<div class="info-panel"><header class="info-header"><h2 id="site-info-title">${escape(title)}</h2><button class="info-close" type="button" data-close-info aria-label="${escape(u.closeInfo)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span>${escape(u.closeInfo)}</span></button></header><div class="info-body" tabindex="0"><p class="info-intro">${escape(intro)}</p>${body}</div></div>`;
    return lang==='zh'?protectChineseTerms(markup):markup;
  }
  return {render,renderInfo,escape,pathFor,parseRoute,knownRoutes,routeAliases,infoIds,serviceIds,products,categoryIds};
});
