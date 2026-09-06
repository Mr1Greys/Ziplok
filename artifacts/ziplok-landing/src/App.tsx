import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronRight, Menu, Send, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import heroPackageImage from '@assets/1b_1788715982983.png';

const queryClient = new QueryClient();

type ZipType = 'hero' | 'chaos' | 'community' | 'empty' | 'service';
type ZipSize = 'small' | 'medium' | 'default' | 'empty';

interface ZipPackageProps {
  type?: ZipType;
  size?: ZipSize;
  rotation?: number;
  glow?: boolean;
  photo?: boolean;
  children?: ReactNode;
  className?: string;
}

function ZipPackage({ type = 'hero', size = 'default', rotation = -4, glow = true, photo = false, children, className = '' }: ZipPackageProps) {
  const defaultItems = ['Позиционирование', 'Продукт', 'Воронка', 'Контент', 'Продажи', 'Запуск'];
  const chaosItems = ['ИДЕЯ', 'АУДИТОРИЯ', 'КОНТЕНТ', 'ПРОДАЖИ', 'ВОРОНКА', 'УПАКОВКА'];
  const isEmpty = type === 'empty';
  const usePhoto = photo && type === 'hero';
  return (
    <motion.div
      className={`zip-package ${usePhoto ? 'photo-package' : ''} ${size === 'default' ? '' : `is-${size}`} ${glow ? 'zip-float' : ''} ${className}`}
      style={{ '--rotation': `${rotation}deg`, filter: glow && !usePhoto ? 'drop-shadow(0 24px 30px rgba(0,0,0,.5)) drop-shadow(0 0 27px rgba(90,58,225,.17))' : undefined } as CSSProperties}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      aria-label="Прозрачный ZIP-пакет ZiPlok"
    >
      {usePhoto ? <img className="zip-photo" src={heroPackageImage} alt="ZiPlok — все в одном пакете" /> : (
        <>
          <div className="zip-seal" />
          <div className="zip-body">
            <div className="zip-glare" />
            {children ?? (
              isEmpty ? <div className="zip-empty-line" /> : (
                <div className="zip-content">
                  {type === 'community' ? (
                    <div className="telegram-card">
                      <div className="telegram-mark"><Send size={18} fill="currentColor" /></div>
                      <strong>ZiPlok</strong>
                      <span>Community</span>
                    </div>
                  ) : type === 'chaos' ? (
                    <div className="zip-chaos-labels">
                      {chaosItems.map((item, index) => <span className="zip-tag" key={item} style={{ left: `${8 + (index % 3) * 27}%`, top: `${19 + Math.floor(index / 3) * 33}%`, transform: `rotate(${index % 2 ? 5 : -5}deg)` }}>{item}</span>)}
                    </div>
                  ) : (
                    <div className="zip-card">
                      <div className="zip-card-label">ZiPlok</div>
                      <div className="zip-card-kicker">СТУДИЯ ЗАПУСКОВ</div>
                      <div className="zip-list">
                        {defaultItems.map((item) => <div className="zip-list-item" key={item}>{item}</div>)}
                      </div>
                      <div className="zip-side-note">Все<br />в одном<br />пакете</div>
                      <div className="zip-barcode" />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

function Header({ onOpen }: { onOpen: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [['О нас', '#about'], ['Услуги', '#services'], ['Этапы', '#process'], ['Комьюнити', '#community'], ['Отзывы', '#fit']];
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="site-header">
      <div className="frame header-inner">
        <a className="brand" href="#top" onClick={closeMenu} data-testid="link-brand">
          <span className="brand-name">ZiPlok</span><span className="brand-sub">Студия<br />запусков</span>
        </a>
        <nav className="nav-links" aria-label="Основная навигация">
          {links.map(([label, href]) => <a href={href} key={href} data-testid={`link-nav-${href.slice(1)}`}>{label}</a>)}
        </nav>
        <button className="header-cta" onClick={onOpen} data-testid="button-header-community">Войти в комьюнити <ArrowUpRight size={13} /></button>
        <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} data-testid="button-mobile-menu">
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-label="Мобильная навигация">
        {links.map(([label, href]) => <a href={href} key={href} onClick={closeMenu} data-testid={`link-mobile-${href.slice(1)}`}>{label}</a>)}
        <button className="header-cta" onClick={() => { closeMenu(); onOpen(); }} data-testid="button-mobile-community">Войти в комьюнити <ArrowUpRight size={13} /></button>
      </nav>
    </header>
  );
}

function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  useEffect(() => { if (!open) setSent(false); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.div className="modal" initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .25 }}>
            <button className="modal-close" onClick={onClose} aria-label="Закрыть" data-testid="button-modal-close"><X size={18} /></button>
            {sent ? (
              <div className="modal-success">
                <div className="success-icon"><Check size={21} /></div>
                <div className="eyebrow">Заявка принята</div>
                <h2>Пакет уже собирается.</h2>
                <p>Мы свяжемся с тобой в Telegram и покажем, с чего начать запуск.</p>
                <button className="primary-cta" onClick={onClose} data-testid="button-modal-done">Готово <ArrowUpRight size={14} /></button>
              </div>
            ) : (
              <>
                <div className="eyebrow">Вход в ZiPlok Community</div>
                <h2>Начнем с твоей идеи.</h2>
                <p>Оставь контакт — отправим приглашение и короткий разбор того, что можно упаковать первым.</p>
                <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} data-testid="form-community">
                  <input required type="text" placeholder="Как тебя зовут" aria-label="Как тебя зовут" data-testid="input-name" />
                  <input required type="text" placeholder="@telegram или email" aria-label="Telegram или email" data-testid="input-contact" />
                  <button type="submit" className="primary-cta" data-testid="button-submit-community">Получить приглашение <ArrowUpRight size={14} /></button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const serviceData = [
  { index: '01', title: 'Эксперта', description: 'Твое понимание того, в чем твоя сила и за что тебе платят деньги.', items: ['Позиционирование', 'Ценности', 'Уникальность', 'УТП', 'Образ продукта'] },
  { index: '02', title: 'Продукт', description: 'Превращаем знания и опыт в понятный продукт, который можно продавать.', items: ['Модель продукта', 'Программа', 'Услуги', 'Формат', 'Ценообразование', 'Упаковка ценности'] },
  { index: '03', title: 'Воронку', description: 'Строим путь человека от первого касания до покупки.', items: ['Контент → интерес', 'Заявка → консультация', 'Продажа'] },
  { index: '04', title: 'Контент', description: 'Контент должен не просто собирать просмотры. Он должен продавать.', items: ['Прогрев', 'Презентация', 'Экспертное доверие', 'Продажа'] },
  { index: '05', title: 'Продажи', description: 'Настраиваем систему, которая превращает интерес в деньги.', items: ['Офферы', 'Диагностика', 'Обработка возражений', 'Продажи', 'Повторные касания'] },
  { index: '06', title: 'Запуск', description: 'Собираем всё вместе и выстраиваем процесс.', items: ['Стратегия', 'Трафик', 'Контент', 'Воронка', 'Продажи', 'Аналитика', 'Масштабирование'] },
];

function Hero({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="frame hero" id="top">
      <Reveal className="hero-copy">
        <div className="eyebrow">Студия запусков ZiPlok</div>
        <h1 className="display hero-title"><span>Упаковываем</span><span className="accent">запуски</span><span>с нуля</span></h1>
        <div className="title-rule" />
        <p className="hero-lede">Из эксперта — в понятный продукт.<br />Из идеи — в систему продаж.<br />Из системы — в запуск.</p>
        <div className="hero-actions">
          <button className="primary-cta" onClick={onOpen} data-testid="button-hero-community">Войти в комьюнити <ArrowUpRight size={14} /></button>
          <span className="microcopy">Закрытое Telegram-сообщество для экспертов, продюсеров и тех, кто строит продукты</span>
        </div>
        <div className="scroll-cue">листай, здесь всё по полочкам</div>
      </Reveal>
      <div className="hero-art" aria-label="Пакет с системой запуска">
        <ZipPackage type="hero" photo rotation={-5} />
      </div>
    </section>
  );
}

function Stats() {
  return <div className="frame stats" id="about">
    <Reveal className="stat" delay={.05}><div className="stat-value">100+</div><div className="stat-text">запусков реализовано<br />в команде</div></Reveal>
    <Reveal className="stat" delay={.1}><div className="stat-value">2+ года</div><div className="stat-text">опыта в продюсировании<br />и управлении проектами</div></Reveal>
    <Reveal className="stat" delay={.15}><div className="stat-value">Прозрачная система</div><div className="stat-text">без инфоцыганства<br />и пустых обещаний</div></Reveal>
  </div>;
}

function ChaosSection() {
  return <section className="section" id="process"><div className="frame chaos-grid">
    <Reveal>
      <div className="eyebrow">01 / Вместо хаоса</div>
      <h2 className="display section-title">Ты не обязан<br />разбираться<br />во всём сам</h2>
      <p className="section-lede">Эксперт часто умеет делать одно: давать результат клиенту.</p>
      <div className="chaos-sub">Но вокруг этого обычно хаос:</div>
      <div className="chaos-list">
        {['непонятно, что продавать', 'нет нормальной упаковки', 'контент выходит без системы', 'запуск держится только на личности', 'продажи держатся только на личном участии', 'аудитория есть, но она не покупает', 'запуск каждый раз собирается с нуля'].map((item) => <span key={item}>× &nbsp;{item}</span>)}
      </div>
      <div className="chaos-foot">ZiPlok закрывает этот хаос.</div>
    </Reveal>
    <Reveal className="chaos-art" delay={.15}>
      <span className="question-mark q-one">?</span><span className="question-mark q-two">?</span><span className="question-mark q-three">?</span>
      <ZipPackage type="chaos" rotation={7} />
      <div className="chaos-callout">Мы собрали<br />всё в систему</div>
    </Reveal>
  </div></section>;
}

function Services() {
  return <section className="section" id="services"><div className="frame">
    <Reveal className="services-head"><><div><div className="eyebrow">02 / Внутри пакета</div><h2 className="display section-title">Что мы<br />упаковываем?</h2></div><p className="services-note">Не отдельные услуги.<br />Связанную систему,<br />которая выдерживает запуск.</p></></Reveal>
    <div className="service-grid">
      {serviceData.map((service, index) => <Reveal className="service-card" delay={index * .04} key={service.index}>
        <span className="service-index">{service.index}</span><div className="service-mini"><ZipPackage type="hero" size="small" rotation={index % 2 ? 5 : -5} glow={false} /></div>
        <h3>{service.title}</h3><p>{service.description}</p><ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </Reveal>)}
    </div>
  </div></section>;
}

function Community({ onOpen }: { onOpen: () => void }) {
  return <section className="section" id="community"><div className="frame community">
    <Reveal className="community-art"><><ZipPackage type="community" rotation={-7} /><div className="community-callout">Здесь начинается<br />реальный запуск</div></></Reveal>
    <Reveal className="community-copy" delay={.1}><div className="eyebrow">03 / ZiPlok Community</div><h2 className="display">ZiPlok<br />Community</h2><div className="violet-label">Твое сообщество по запускам</div><p>Закрытое Telegram-комьюнити для экспертов, продюсеров и тех, кто строит продукты.<br /><br />Здесь мы разбираем кейсы, даем инструменты и выстраиваем рабочие системы.</p><div className="inside-title">Что внутри:</div><ul className="inside-list">{['Разборы запусков', 'Созвоны с командой', 'Свежие инструменты', 'Живое общение', 'Кейсы и ошибки', 'Поддержка команды'].map((item) => <li key={item}>{item}</li>)}</ul><button className="primary-cta" onClick={onOpen} data-testid="button-community-section">Войти в комьюнити <ArrowUpRight size={14} /></button></Reveal>
  </div></section>;
}

function FitAndCta({ onOpen }: { onOpen: () => void }) {
  return <section className="section" id="fit"><div className="frame fit-cta">
    <Reveal className="fit"><div className="eyebrow">04 / Для своих</div><h2 className="display">Кому мы<br />подходим?</h2><ul className="fit-list">{['Экспертам, которые хотят превратить знания в продукт.', 'Экспертам и продюсерам, которые уже создают или масштабируют проекты.', 'Начинающим экспертам, которые хотят сразу построить нормальную систему.', 'Предпринимателям, которые запускают новый или существующий продукт.', 'Тем, кто уже запускался, но не получил тот результат.'].map((item) => <li key={item}>{item}</li>)}</ul></Reveal>
    <Reveal className="last-cta" delay={.1}><div className="last-cta-card"><div className="eyebrow">05 / Первый шаг</div><h3 className="display">А если ты пока не готов к запуску?</h3><p>Покажем, с чего тебе лучше начать. И с чем идти дальше.</p><button className="primary-cta" onClick={onOpen} data-testid="button-review">Получить разбор <ArrowUpRight size={14} /></button></div><div className="last-cta-art"><ZipPackage type="empty" size="empty" rotation={8} /><div className="empty-callout">Начни<br />с разбора</div></div></Reveal>
  </div></section>;
}

function Footer({ onOpen }: { onOpen: () => void }) {
  return <footer className="site-footer"><div className="frame">
    <div className="footer-top"><div className="footer-brand"><div className="brand-name">ZiPlok</div><p>Студия запусков<br />Упаковываем с 0.</p></div><div><div className="process"><span>Эксперт</span><i>→</i><span>Продукт</span><i>→</i><span>Система</span><i>→</i><span>Запуск</span><i>→</i><span>Продажи</span></div><button className="primary-cta" onClick={onOpen} style={{ margin: '26px auto 0', display: 'flex' }} data-testid="button-footer-community">Войти в комьюнити <ArrowUpRight size={14} /></button></div><div className="footer-channel"><Send size={19} /><span>Telegram-канал<br /><strong>ZiPlok Community</strong></span></div></div>
    <div className="footer-bottom"><span>© 2026 ZiPlok Studio</span><a href="#top" data-testid="link-footer-privacy">Политика конфиденциальности</a></div>
  </div></footer>;
}

function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => { if (reducedMotion) document.documentElement.style.scrollBehavior = 'auto'; }, [reducedMotion]);
  return <div className="site-shell" id="top">
    <Header onOpen={() => setModalOpen(true)} />
    <main><Hero onOpen={() => setModalOpen(true)} /><Stats /><ChaosSection /><Services /><Community onOpen={() => setModalOpen(true)} /><FitAndCta onOpen={() => setModalOpen(true)} /></main>
    <Footer onOpen={() => setModalOpen(true)} />
    <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
  </div>;
}

function Router() {
  return <ErrorBoundary resetKey={useLocation()[0]}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;