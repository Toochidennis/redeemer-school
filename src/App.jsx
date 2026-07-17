import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { NEWS_CATEGORIES, NEWS_IMAGE_OPTIONS } from './news-data.js';
import {
  createNews,
  deleteNews,
  getAdminNews,
  getAdminNewsById,
  getNewsBySlug,
  getPublicNews,
  publishNews,
  uploadNewsImage,
  unpublishNews,
  updateNews
} from './news-service.js';
import { getCurrentAdmin, login, logout } from './admin-auth.js';

const ROUTES = ['about', 'academics', 'admissions', 'contact', 'news', 'news_detail', 'admin_login', 'admin_news', 'admin_news_form'];
const SCHOOL = {
  shortName: 'RISE',
  name: 'Redeemers International Secondary School',
  location: 'Emene, Enugu State, Nigeria',
  address: '5 Destiny Layout, behind Herbatex Paint, by Old Airport Road, Enugu',
  email: 'redeemersschoolenugu@gmail.com',
  phones: ['07034513889', '08022470908', '07062340519'],
  motto: 'Knowledge and the fear of the Lord.',
  values: ['Fear of God', 'Excellence', 'Discipline', 'Integrity', 'Service'],
  vision: 'To raise godly, disciplined, and academically excellent students who will impact their generation.',
  mission: 'To provide holistic education through sound academics, Christian values, discipline, and character development in a safe and supportive learning environment.'
};
const WHATSAPP_NUMBER = '2348022470908';
const NEWS_PUBLIC_LIVE = false;

function routeFromLocation() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts.find((part) => ROUTES.includes(part)) || 'home';
}

function navigate(to) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Link({ to, children, className, ...props }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target) return;
        event.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function Header({ route }) {
  const [open, setOpen] = useState(false);
  const nav = [
    ['home', './', 'Home'],
    ['about', 'about', 'About'],
    ['academics', 'academics', 'Academics'],
    ['admissions', 'admissions', 'Admissions'],
    ['news', 'news', 'News'],
    ['contact', 'contact', 'Contact']
  ];

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" to="./">
          <img src="redeemers/optimized/badge.webp" alt="Redeemers International Secondary School crest" />
          <span><strong>{SCHOOL.name}</strong><span>Emene, Enugu</span></span>
        </Link>
        <button className="nav-toggle" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
        <nav className={`site-nav${open ? ' is-open' : ''}`} id="site-nav" aria-label="Main navigation">
          {nav.map(([key, href, label]) => (
            <Link key={key} to={href} className={(route === key || (key === 'news' && route === 'news_detail')) ? 'is-active' : ''}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><img src="redeemers/optimized/badge.webp" alt="" /><strong>{SCHOOL.name}</strong><p>{SCHOOL.motto}</p><p>{SCHOOL.address}</p></div>
        <div><strong>Pages</strong><Link to="./">Home</Link><Link to="about">About</Link><Link to="academics">Academics</Link><Link to="admissions">Admissions</Link><Link to="news">News</Link></div>
        <div><strong>Contact</strong><a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>{SCHOOL.phones.map((phone) => <a key={phone} href={`tel:${phone}`}>{phone}</a>)}<button className="footer-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button><Link to="admin_login">News login</Link></div>
      </div>
    </footer>
  );
}

function PageHero({ kicker, title, text, image, alt }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div><span className="kicker">{kicker}</span><h1>{title}</h1><p>{text}</p></div>
        <img src={image} alt={alt} />
      </div>
    </section>
  );
}

function SectionHead({ kicker, title, text }) {
  return <div className="section-head"><div><span className="kicker">{kicker}</span><h2>{title}</h2></div><p>{text}</p></div>;
}

function NewsCard({ post }) {
  return (
    <article className="news-card">
      <img className="news-card-image" src={post.image} alt={post.title} loading="lazy" />
      <span className="news-pill">{post.category}</span>
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
      <Link to={`news_detail?slug=${encodeURIComponent(post.slug)}`}>Read More <span aria-hidden="true">→</span></Link>
    </article>
  );
}

function NewsComingSoon({ compact = false }) {
  return (
    <section className={compact ? 'news-coming compact' : 'section news-coming'}>
      <div className="container news-coming-grid">
        <div>
          <span className="kicker">News desk</span>
          <h2>News coming soon</h2>
          <p>School announcements, notices, and event updates will be available here soon.</p>
          <div className="section-actions"><Link className="btn btn-secondary" to="contact">Contact the school</Link></div>
        </div>
        <div className="speaker-graphic" aria-hidden="true">
          <div className="speaker-card">
            <span className="speaker-dot"></span>
            <div className="speaker-lines"><span></span><span></span><span></span></div>
          </div>
          <div className="speaker-body">
            <span className="speaker-mouth"></span>
            <span className="speaker-handle"></span>
            <span className="sound-wave wave-one"></span>
            <span className="sound-wave wave-two"></span>
            <span className="sound-wave wave-three"></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactForm({ admission = false }) {
  const [message, setMessage] = useState('');
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const contact = String(form.get('contact') || '').trim();
    const classLevel = String(form.get('class') || '').trim();
    const subject = String(form.get('subject') || '').trim();
    const note = String(form.get('message') || '').trim();
    const lines = [
      admission ? 'Admission enquiry from the website' : 'Contact message from the website',
      '',
      `Name: ${name}`,
      `Contact: ${contact}`
    ];
    if (admission && classLevel) lines.push(`Class of interest: ${classLevel}`);
    if (!admission && subject) lines.push(`Subject: ${subject}`);
    if (note) lines.push('', 'Message:', note);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    setMessage('WhatsApp is opening with your enquiry.');
    event.currentTarget.reset();
  }
  return (
    <form className="contact-panel form-grid" onSubmit={submit}>
      <label>{admission ? 'Parent or guardian name' : 'Name'}<input name="name" autoComplete="name" required /></label>
      <label>{admission ? 'Phone or email' : 'Email or phone'}<input name="contact" required /></label>
      {admission ? <label>Class of interest<input name="class" /></label> : <label>Subject<input name="subject" /></label>}
      <label>Message<textarea name="message" required={!admission}></textarea></label>
      <button className="btn btn-primary" type="submit">{admission ? 'Send enquiry' : 'Send message'}</button>
      {message && <p className="form-message success">{message}</p>}
    </form>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <img className="hero-bg" src="redeemers/optimized/campus.webp" alt="Redeemers International Secondary School campus" />
        <div className="hero-inner">
          <span className="kicker">Rise with purpose</span>
          <h1>Character-centered secondary education in Enugu.</h1>
          <p>{SCHOOL.name} is an educational center for academic excellence, raising disciplined students through learning, faith, diligence, and strong moral values.</p>
          <div className="hero-actions"><Link className="btn btn-primary" to="admissions">Start admission enquiry</Link><Link className="btn btn-outline" to="academics">Explore academics</Link></div>
          <div className="hero-strip"><div><strong>Emene</strong><span>Based in Enugu State, Nigeria</span></div><div><strong>RISE</strong><span>Redeemers International Secondary School</span></div><div><strong>Faith & learning</strong><span>{SCHOOL.motto}</span></div></div>
        </div>
      </section>
      <section className="section"><div className="container"><SectionHead kicker="School Life" title="Junior and senior secondary learning with purpose." text="RISE serves students across two major class divisions: Junior Secondary and Senior Secondary." /><div className="grid-3"><article className="card"><h3>Academic excellence</h3><p>Students are guided through structured lessons, assessment, and teacher-led academic support.</p></article><article className="card"><h3>Arts and activities</h3><p>The school continues to develop arts and extra-curricular programmes that strengthen character and confidence.</p></article><article className="card"><h3>Character formation</h3><p>Faith, diligence, discipline, and hard work shape the school’s approach to secondary education.</p></article></div></div></section>
      <section className="section alt"><div className="container"><SectionHead kicker="Core Values" title="The values that shape student life." text="RISE builds learning around faith, excellence, discipline, integrity, and service." /><div className="grid-3">{SCHOOL.values.map((value) => <article className="card" key={value}><h3>{value}</h3><p>{value === 'Fear of God' ? 'Students are guided to honour God in learning, conduct, and relationships.' : value === 'Excellence' ? 'Students are encouraged to pursue strong academic and personal standards.' : value === 'Discipline' ? 'Students learn habits of order, focus, respect, and responsibility.' : value === 'Integrity' ? 'Students are taught honesty, accountability, and sound moral choices.' : 'Students are encouraged to contribute positively to their homes and society.'}</p></article>)}</div></div></section>
      <section className="section alt"><div className="container feature-layout"><div><span className="kicker">Why RISE</span><h2>Partnership between church, home, and school.</h2><ul className="rail-list"><li><strong>Strong leaders</strong><br />The school works to produce strong and effective young leaders who can impact their homes and society.</li><li><strong>Excellence through diligence</strong><br />Students are encouraged to grow through hard work, discipline, and steady academic effort.</li><li><strong>University readiness</strong><br />RISE graduates are known for strong acceptance into local and foreign-based universities.</li></ul></div><div className="image-panel"><img src="redeemers/optimized/laboratory.webp" alt="Students working in the school laboratory" /></div></div></section>
      <NewsComingSoon compact />
      <section className="section dark"><div className="container gallery"><img src="redeemers/optimized/classroom.webp" alt="Students seated in class" /><img src="redeemers/optimized/practical-learning.webp" alt="Students observing practical work" /><img src="redeemers/optimized/excursion.webp" alt="Students on guided practical visit" /><img src="redeemers/optimized/skills-workshop.webp" alt="Students around workshop materials" /><img src="redeemers/optimized/school-block.webp" alt="School building exterior" /></div></section>
    </>
  );
}

function About() {
  return (
    <>
      <PageHero kicker="About the school" title={`${SCHOOL.name} (${SCHOOL.shortName})`} text="RISE is an educational center for academic excellence based in Emene, Enugu State, Nigeria." image="redeemers/optimized/school-block.webp" alt="Redeemers school building exterior" />
      <section className="section"><div className="container feature-layout about-identity"><div className="crest-panel"><img src="redeemers/optimized/badge.webp" alt="Redeemers International Secondary School badge" /></div><div><span className="kicker">About Us</span><h2>Academic excellence with character at the center.</h2><p>Since inception, RISE has continued to develop academic, arts, and extra-curricular programmes that elevate students’ strength of character and prepare high-achieving individuals for Nigerian society.</p><p>RISE seeks to be the first choice for families in Enugu and environs who want a good character-centered secondary education for their children.</p><ul className="rail-list"><li><strong>Class divisions</strong><br />Junior Secondary and Senior Secondary</li><li><strong>Location</strong><br />{SCHOOL.location}</li><li><strong>Motto</strong><br />{SCHOOL.motto}</li></ul></div></div></section>
      <section className="section alt"><div className="container"><SectionHead kicker="Vision and Mission" title="Holistic education rooted in Christian values." text="The school’s direction is shaped by faith, discipline, academics, and character development." /><div className="grid-2"><article className="card"><h3>Vision Statement</h3><p>{SCHOOL.vision}</p></article><article className="card"><h3>Mission Statement</h3><p>{SCHOOL.mission}</p></article></div><div className="grid-3 values-grid">{SCHOOL.values.map((value) => <article className="card" key={value}><h3>{value}</h3></article>)}</div></div></section>
      <section className="section alt"><div className="container"><SectionHead kicker="From the Principal's Desk" title="Welcome to Redeemers International Secondary School." text="A message from Mr. Ikechukwu Olodu, Principal." /><div className="grid-2"><article className="card"><p>It is with great joy and gratitude to God that I welcome you to our school community. At Redeemers International Secondary School, we are committed to nurturing young minds in an environment where academic excellence, the fear of God, and sound moral values are the pillars of education.</p><p>We believe that every child is created with unique gifts and limitless potential. Our mission is not only to help students achieve outstanding academic success but also to raise disciplined, responsible, and compassionate leaders who will make a positive impact in their families, communities, and the world.</p></article><article className="card"><p>Our dedicated and highly qualified staff are passionate about inspiring excellence, encouraging creativity, and developing character. Through quality teaching, spiritual guidance, and a culture of discipline and respect, we prepare our students to face the future with confidence, integrity, and wisdom.</p><p><strong>Mr. Ikechukwu Olodu</strong><br />Principal</p></article></div></div></section>
    </>
  );
}

function Academics() {
  return (
    <>
      <PageHero kicker="Academics" title="Learning with structure, practice, and values." text="The academic programme supports junior and senior secondary students through classroom learning, practical exposure, and steady learner development." image="redeemers/optimized/classroom.webp" alt="Students in a classroom" />
      <section className="section"><div className="container"><SectionHead kicker="Programmes" title="Secondary education for character and excellence." text="RISE supports students through Junior Secondary and Senior Secondary class divisions." /><div className="grid-2"><article className="program-card"><h3>Junior Secondary</h3><p>Foundation-building classes that strengthen core subjects, discipline, confidence, and study habits.</p></article><article className="program-card"><h3>Senior Secondary</h3><p>Focused subject learning, examination preparation, leadership development, and university readiness.</p></article></div></div></section>
      <section className="section alt"><div className="container feature-layout"><div><span className="kicker">Practical learning</span><h2>Science and skill-based activities have a visible role.</h2><p>Students learn through observation, guided demonstrations, and hands-on academic experiences that support classroom teaching.</p><div className="section-actions"><Link className="btn btn-primary" to="admissions">Ask about admission</Link></div></div><div className="image-panel"><img src="redeemers/optimized/practical-learning.webp" alt="Students around practical learning equipment" /></div></div></section>
    </>
  );
}

function Admissions() {
  return (
    <>
      <PageHero kicker="Admissions" title="Begin with a direct school enquiry." text="Families can start the admission process by contacting the school office and sharing the learner’s intended class level." image="redeemers/optimized/campus.webp" alt="Redeemers International Secondary School campus" />
      <section className="section"><div className="container"><SectionHead kicker="Process" title="A simple flow for prospective parents." text="The admissions team guides families from enquiry to registration." /><div className="grid-3"><article className="card"><h3>1. Make an enquiry</h3><p>Contact the school or use the form to indicate the class level and learner details.</p></article><article className="card"><h3>2. Visit or receive guidance</h3><p>The school shares form requirements, fee guidance, and assessment information.</p></article><article className="card"><h3>3. Complete registration</h3><p>Submit required documents and complete the school’s official registration process.</p></article></div></div></section>
      <section className="section alt"><div className="container contact-grid"><div className="contact-panel"><h2>Admissions office</h2><ul className="rail-list"><li>Admission enquiries</li><li>Class placement guidance</li><li>Entrance assessment information</li><li>Registration support</li></ul></div><ContactForm admission /></div></section>
    </>
  );
}

function Contact() {
  return (
    <>
      <PageHero kicker="Contact" title="Reach the school office." text="Visit or contact Redeemers International Secondary School in Enugu for admissions, school visits, and general enquiries." image="redeemers/optimized/school-block.webp" alt="School exterior" />
      <section className="section"><div className="container contact-grid"><div className="contact-panel"><h2>{SCHOOL.name}</h2><ul className="rail-list"><li><strong>Address</strong><br />{SCHOOL.address}</li><li><strong>Email</strong><br /><a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a></li><li><strong>Phone</strong><br />{SCHOOL.phones.map((phone, index) => <React.Fragment key={phone}><a href={`tel:${phone}`}>{phone}</a>{index < SCHOOL.phones.length - 1 ? ', ' : ''}</React.Fragment>)}</li><li><strong>Motto</strong><br />{SCHOOL.motto}</li></ul></div><ContactForm /></div></section>
    </>
  );
}

function NewsList() {
  return (
    <>
      <PageHero kicker="News" title="School updates and notices." text="Official announcements and event updates will be available here soon." image="redeemers/optimized/excursion.webp" alt="Students on practical visit" />
      <NewsComingSoon />
    </>
  );
}

function renderNewsContent(content) {
  const imagePattern = /^!\[(.*?)\]\((.*?)\)$/;
  return String(content || '').split(/\n+/).map((part, index) => {
    const trimmed = part.trim();
    const image = trimmed.match(imagePattern);
    if (image) {
      return (
        <figure className="news-content-image" key={`${trimmed}-${index}`}>
          <img src={image[2]} alt={image[1] || 'News content'} />
          {image[1] && <figcaption>{image[1]}</figcaption>}
        </figure>
      );
    }
    return trimmed ? <p key={`${trimmed}-${index}`}>{trimmed}</p> : null;
  });
}

function NewsPostPreview({ post }) {
  const title = post.title || 'News title';
  const summary = post.summary || 'Summary';
  return (
    <article className="admin-live-preview">
      <div className="admin-preview-head">
        <span className="news-pill">{post.category || 'Notice'}</span>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>
      <figure className="admin-preview-cover">
        <img src={post.image || NEWS_IMAGE_OPTIONS[0].value} alt={title} />
      </figure>
      <div className="news-article-body admin-preview-body">
        {post.content ? renderNewsContent(post.content) : <p>No content yet.</p>}
      </div>
    </article>
  );
}

function AdminAlert({ message, type = 'error', onClose }) {
  if (!message) return null;
  const label = type === 'success' ? 'Done' : type === 'info' ? 'Notice' : 'Please check this';
  return (
    <div className={`admin-alert ${type}`} role="alert">
      <div>
        <strong>{label}</strong>
        <p>{message}</p>
      </div>
      {onClose && <button type="button" onClick={onClose} aria-label="Dismiss message">Close</button>}
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel = 'Continue', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="admin-confirm-actions">
          <button className="btn btn-outline" type="button" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function NewsDetail() {
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const slug = new URLSearchParams(window.location.search).get('slug') || '';
  const preview = new URLSearchParams(window.location.search).get('preview') === '1';
  useEffect(() => {
    if (!preview) return;
    async function load() {
      const item = await getNewsBySlug(slug);
      setPost(item);
      const items = await getPublicNews();
      setRelated(items.filter((entry) => entry.slug !== slug).slice(0, 3));
      if (item) document.title = `${item.title} | Redeemers International Secondary School`;
    }
    load();
  }, [slug, preview]);
  if (!preview) return <><PageHero kicker="News" title="School updates and notices." text="Official announcements and event updates will be available here soon." image="redeemers/optimized/excursion.webp" alt="Students on practical visit" /><NewsComingSoon /></>;
  if (!post) return <section className="section"><div className="container"><h1>News not found</h1><p>The requested news item is unavailable.</p><Link className="btn btn-secondary" to="news">Back to News</Link></div></section>;
  return (
    <>
      <article className="news-article"><header className="news-article-hero"><Link className="news-back-link" to="news">← Back to News</Link><span className="news-pill">{post.category}</span><h1>{post.title}</h1><p>{post.summary}</p></header><figure className="news-article-figure"><img className="news-detail-image" src={post.image} alt={post.title} /></figure><div className="news-article-layout"><div className="news-article-body">{renderNewsContent(post.content)}</div><aside className="news-article-side"><h2>Need more information?</h2><p>Contact the school office for admissions, visits, and general enquiries.</p><Link className="btn btn-secondary" to="contact">Contact Us</Link><Link className="btn btn-outline" to="admissions">Admissions</Link></aside></div></article>
      <section className="section alt"><div className="container"><SectionHead kicker="More updates" title="Related news" text="Other published notices from the school." /><div className="grid-3">{related.map((item) => <NewsCard key={item.id} post={item} />)}</div></div></section>
    </>
  );
}

function AdminLogin() {
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage('Signing in...');
    const result = await login(form.get('username'), form.get('password'));
    if (!result.ok) return setMessage(result.message);
    navigate('admin_news');
  }
  return <main className="admin-login"><form className="admin-login-card form-grid" onSubmit={submit}><img src="redeemers/optimized/badge.webp" alt="Redeemers International Secondary School crest" /><div><span className="kicker">News admin</span><h1>Sign in</h1></div><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="btn btn-primary" type="submit">Sign in</button><p className="admin-message">{message}</p><Link to="./">Back to site</Link></form></main>;
}

function AdminShell({ children, active }) {
  const [admin, setAdmin] = useState(null);
  useEffect(() => { getCurrentAdmin().then((user) => { if (!user) navigate('admin_login'); else setAdmin(user); }); }, []);
  if (!admin) return null;
  return <div className="admin-shell"><aside className="admin-sidebar"><img src="redeemers/optimized/badge.webp" alt="Redeemers International Secondary School crest" /><strong>Redeemers Admin</strong><p>{admin.name || admin.username}</p><nav className="admin-nav"><Link className={active === 'news' ? 'is-active' : ''} to="admin_news">News posts</Link><Link className={active === 'form' ? 'is-active' : ''} to="admin_news_form">Create post</Link><Link to="./">View site</Link><button type="button" onClick={async () => { await logout(); navigate('admin_login'); }}>Sign out</button></nav></aside><main className="admin-main">{children}</main></div>;
}

function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [pendingDelete, setPendingDelete] = useState(null);
  async function reload() { setPosts(await getAdminNews()); }
  useEffect(() => { reload(); }, []);
  const publishedLabel = NEWS_PUBLIC_LIVE ? 'Published' : 'Ready';
  const statusLabel = (item) => (item.status || '').toLowerCase() === 'published' ? publishedLabel : 'Draft';
  const statusClass = (item) => (item.status || '').toLowerCase() === 'published' ? (NEWS_PUBLIC_LIVE ? 'published' : 'ready') : 'draft';
  const rows = posts.filter((item) => {
    const text = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
    const itemStatus = (item.status || '').toLowerCase();
    return text.includes(query.toLowerCase()) && (status === 'all' || itemStatus === status.toLowerCase());
  });
  async function action(fn, successMessage) {
    try {
      await fn();
      await reload();
      setMessageType('success');
      setMessage(successMessage);
    } catch {
      setMessageType('error');
      setMessage('The action could not be completed. Please try again.');
    }
  }
  async function confirmDelete() {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    await action(() => deleteNews(item.id), `"${item.title}" has been deleted.`);
  }
  return (
    <AdminShell active="news">
      <div className="admin-toolbar"><div><span className="kicker">News desk</span><h1>Manage posts</h1></div><Link className="btn btn-primary" to="admin_news_form">Create post</Link></div>
      <section className="admin-panel">
        {!NEWS_PUBLIC_LIVE && <AdminAlert message="News is currently hidden from visitors. Posts created here will not show on the website until the news page is enabled." type="info" />}
        <AdminAlert message={message} type={messageType} onClose={() => setMessage('')} />
        <div className="admin-toolbar"><label className="admin-search-label">Search posts<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="published">{publishedLabel}</option><option value="draft">Draft</option></select></div>
        <table className="admin-table"><thead><tr><th>Post</th><th>Category</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{rows.length === 0 && <tr><td colSpan="5"><div className="admin-empty-state"><strong>No posts yet</strong><span>Use Create post to add one.</span></div></td></tr>}{rows.map((item) => <tr key={item.id}><td><div className="admin-post-cell"><strong>{item.title}</strong><span>{item.summary || item.slug}</span></div></td><td>{item.category}</td><td><span className={`status-pill status-${statusClass(item)}`}>{statusLabel(item)}</span></td><td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Not saved'}</td><td><div className="admin-table-actions"><Link className="admin-link-button" to={`admin_news_form?id=${encodeURIComponent(item.id)}`}>Edit</Link><Link className="admin-link-button" to={`news_detail?slug=${encodeURIComponent(item.slug)}&preview=1`}>Preview</Link><button className="admin-link-button" onClick={() => action(() => (item.status || '').toLowerCase() === 'published' ? unpublishNews(item.id) : publishNews(item.id), (item.status || '').toLowerCase() === 'published' ? `"${item.title}" has been moved back to draft.` : `"${item.title}" is ready.`)}>{(item.status || '').toLowerCase() === 'published' ? 'Move to draft' : 'Mark ready'}</button><button className="admin-link-button danger" onClick={() => setPendingDelete(item)}>Delete</button></div></td></tr>)}</tbody></table>
      </section>
      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete this post?" message={pendingDelete ? `This will permanently remove "${pendingDelete.title}" from the news list.` : ''} confirmLabel="Delete post" onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </AdminShell>
  );
}

function AdminNewsForm() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  const contentRef = useRef(null);
  const [form, setForm] = useState({ title: '', slug: '', category: NEWS_CATEGORIES[0], image: NEWS_IMAGE_OPTIONS[0].value, summary: '', content: '', status: 'Draft' });
  const [uploading, setUploading] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState('error');
  const publishedLabel = NEWS_PUBLIC_LIVE ? 'Published' : 'Ready';
  useEffect(() => {
    if (editId) {
      getAdminNewsById(editId).then((post) => post && setForm((current) => ({ ...current, ...post, status: (post.status || '').toLowerCase() === 'published' ? 'Published' : 'Draft' })));
    }
  }, [editId]);
  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value, ...(key === 'title' && !current.slug ? { slug: value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') } : {}) }));
  }
  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormMessageType('error');
      setFormMessage('Please choose a valid image file.');
      return;
    }
    setUploading(true);
    setFormMessageType('success');
    setFormMessage('Uploading image...');
    try {
      const image = await uploadNewsImage(file);
      if (image) {
        setField('image', image);
        setFormMessageType('success');
        setFormMessage('Image uploaded and selected.');
      }
    } catch (error) {
      setFormMessageType('error');
      setFormMessage(error.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }
  function insertContentText(text) {
    const input = contentRef.current;
    if (!input) {
      setField('content', `${form.content}\n\n${text}`.trim());
      return;
    }
    const start = input.selectionStart ?? form.content.length;
    const end = input.selectionEnd ?? form.content.length;
    const before = form.content.slice(0, start).replace(/\s*$/, '');
    const after = form.content.slice(end).replace(/^\s*/, '');
    const next = `${before}${before ? '\n\n' : ''}${text}${after ? `\n\n${after}` : ''}`;
    setField('content', next);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = before.length + (before ? 2 : 0) + text.length;
      input.setSelectionRange(cursor, cursor);
    });
  }
  async function handleContentImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormMessageType('error');
      setFormMessage('Please choose a valid image file.');
      return;
    }
    setUploading(true);
    setFormMessageType('success');
    setFormMessage('Uploading content image...');
    try {
      const image = await uploadNewsImage(file);
      if (image) {
        const caption = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'News image';
        insertContentText(`![${caption}](${image})`);
        setFormMessageType('success');
        setFormMessage('Image inserted into the content.');
      }
    } catch (error) {
      setFormMessageType('error');
      setFormMessage(error.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }
  async function save(mode) {
    const payload = { ...form, status: mode === 'publish' ? 'published' : 'draft' };
    const missing = [
      !payload.title && 'title',
      !payload.slug && 'slug',
      !payload.summary && 'summary',
      !payload.content && 'full content'
    ].filter(Boolean);
    if (missing.length > 0) {
      setFormMessageType('error');
      setFormMessage(`Add ${missing.join(', ')} before saving this post.`);
      return;
    }
    if (editId) await updateNews(editId, payload); else await createNews(payload);
    navigate('admin_news');
  }
  return (
    <AdminShell active="form">
      <div className="admin-toolbar">
        <div><span className="kicker">News desk</span><h1>{editId ? 'Edit post' : 'Create post'}</h1></div>
        <Link className="btn btn-outline" to="admin_news">Back to posts</Link>
      </div>
      <section className="admin-panel">
        {!NEWS_PUBLIC_LIVE && <AdminAlert message="News is currently hidden from visitors. Posts created here will not show on the website until the news page is enabled." type="info" />}
        <form className="admin-form admin-editor">
          <div className="admin-editor-main">
            <label>Title<input value={form.title} onChange={(e) => setField('title', e.target.value)} /></label>
            <label>Slug<input value={form.slug} onChange={(e) => setField('slug', e.target.value)} /></label>
            <div className="grid-2">
              <label>Category<select value={form.category} onChange={(e) => setField('category', e.target.value)}>{NEWS_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Status<select value={form.status} onChange={(e) => setField('status', e.target.value)}><option>Draft</option><option value="Published">{publishedLabel}</option></select></label>
            </div>
            <label>Summary<textarea className="summary-field" value={form.summary} onChange={(e) => setField('summary', e.target.value)} /></label>
            <div className="content-editor">
              <div className="content-editor-head">
                <label>Full content<textarea ref={contentRef} className="content-field" value={form.content} onChange={(e) => setField('content', e.target.value)} /></label>
              </div>
              <div className="content-editor-tools">
                <label className="file-tool">Insert image in content<input type="file" accept="image/*" onChange={handleContentImageUpload} disabled={uploading} /></label>
                <button className="admin-link-button" type="button" onClick={() => insertContentText(`![${form.title || 'News image'}](${form.image})`)}>Insert featured image</button>
              </div>
              <p className="admin-help">Use the preview below to check the post before saving.</p>
            </div>
            <section className="admin-preview-panel">
              <div className="admin-preview-title">
                <span className="kicker">Live preview</span>
                <h2>Post preview</h2>
              </div>
              <NewsPostPreview post={form} />
            </section>
          </div>
          <aside className="admin-editor-side">
            <div className="image-editor-preview">
              <img src={form.image || NEWS_IMAGE_OPTIONS[0].value} alt={form.title || 'News preview'} />
            </div>
            <label>Upload image<input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} /></label>
            <label>Or choose existing image<select value={form.image} onChange={(e) => setField('image', e.target.value)}>{NEWS_IMAGE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}{form.image && !NEWS_IMAGE_OPTIONS.some((item) => item.value === form.image) && <option value={form.image}>Uploaded image</option>}</select></label>
            <p className="admin-help">Uploaded images are saved with the news post and used on the news card and detail page.</p>
            <AdminAlert message={formMessage} type={formMessageType} onClose={() => setFormMessage('')} />
            <div className="section-actions admin-editor-actions">
              <button className="btn btn-outline" type="button" onClick={() => navigate('admin_news')}>Cancel</button>
              <button className="btn btn-secondary" type="button" onClick={() => save('draft')} disabled={uploading}>Save draft</button>
              <button className="btn btn-primary" type="button" onClick={() => save('publish')} disabled={uploading}>{NEWS_PUBLIC_LIVE ? 'Publish' : 'Mark ready'}</button>
            </div>
          </aside>
        </form>
      </section>
    </AdminShell>
  );
}

function PublicRoute({ route }) {
  return <><Header route={route} /><main>{route === 'home' && <Home />}{route === 'about' && <About />}{route === 'academics' && <Academics />}{route === 'admissions' && <Admissions />}{route === 'contact' && <Contact />}{route === 'news' && <NewsList />}{route === 'news_detail' && <NewsDetail />}</main><Footer /></>;
}

function App() {
  const [route, setRoute] = useState(routeFromLocation());
  useEffect(() => {
    const sync = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => { document.title = 'Redeemers International Secondary School, Enugu'; }, [route]);
  if (route === 'admin_login') return <AdminLogin />;
  if (route === 'admin_news') return <AdminNews />;
  if (route === 'admin_news_form') return <AdminNewsForm />;
  return <PublicRoute route={route} />;
}

createRoot(document.getElementById('root')).render(<App />);
