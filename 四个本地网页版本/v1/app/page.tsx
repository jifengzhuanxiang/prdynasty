/* Native images keep the supplied photography and QR code byte-for-byte. */
/* eslint-disable @next/next/no-img-element */
import { recruitmentTheme as theme } from "./recruitment-theme";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="深大志联宣传部招新首页">
          <span className="brand-mark">PR</span>
          <span className="brand-copy">
            <strong>深大志联宣传部</strong>
            <small>PUBLIC RELATIONS</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="主导航">
          <a href="#top">招新首页</a>
          <a href="#groups">三个分组</a>
          <a href="#benefits">加入收获</a>
          <a href="#stories">真实日常</a>
        </nav>
        <a className="header-cta" href="#join">立即加入</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="hero-meta">
            <span>{theme.meta.status}</span>
            <span>{theme.meta.season}</span>
          </div>
          <p className="eyebrow">{theme.meta.eyebrow}</p>
          <h1 aria-label={`${theme.hero.titleLead}${theme.hero.titleAccent}`}>
            <span>{theme.hero.titleLead}</span>
            <strong>{theme.hero.titleAccent}</strong>
          </h1>
          <p className="hero-description">{theme.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={theme.hero.primaryAction.href}>
              {theme.hero.primaryAction.label}
            </a>
            <a className="button button-secondary" href={theme.hero.secondaryAction.href}>
              {theme.hero.secondaryAction.label}
            </a>
          </div>
        </div>

        <div className="hero-collage" aria-label="宣传部成员与活动照片">
          <figure className="hero-photo hero-photo-main">
            <img
              src={theme.hero.images[0].src}
              alt={theme.hero.images[0].alt}
              width={theme.hero.images[0].width}
              height={theme.hero.images[0].height}
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>有想法，也有一起完成它的人。</figcaption>
          </figure>
          <figure className="hero-photo hero-photo-note">
            <img
              src={theme.hero.images[1].src}
              alt={theme.hero.images[1].alt}
              width={theme.hero.images[1].width}
              height={theme.hero.images[1].height}
              loading="lazy"
              decoding="async"
            />
            <figcaption>MAKE SOMETHING REAL</figcaption>
          </figure>
        </div>
      </section>

      <div className="recruitment-strip" aria-label="宣传部工作方向">
        <span>摄影 PHOTO</span>
        <span>平面设计 DESIGN</span>
        <span>公众号 CONTENT</span>
        <span>一起把灵感做成作品</span>
      </div>

      <section className="groups section-pad" id="groups">
        <div className="section-heading">
          <div>
            <p className="section-kicker">CHOOSE YOUR WAY · 01</p>
            <h2>三种方向，<br />一种认真表达的心。</h2>
          </div>
          <p>
            你不必同时擅长所有事。先从最感兴趣的方向开始，
            在真实任务里慢慢找到自己的节奏。
          </p>
        </div>
        <div className="group-grid">
          {theme.groups.map((group) => (
            <article className="group-card" key={group.title}>
              <div className="group-image">
                <img
                  src={group.image.src}
                  alt={group.image.alt}
                  width={group.image.width}
                  height={group.image.height}
                  loading="lazy"
                  decoding="async"
                />
                <span>{group.number}</span>
              </div>
              <div className="group-content">
                <p className="group-fit">{group.fit}</p>
                <h3>{group.title}</h3>
                <p className="group-lead">{group.lead}</p>
                <ul>
                  {group.lines.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="benefits section-pad" id="benefits">
        <div className="benefit-intro">
          <p className="section-kicker section-kicker-light">WHAT YOU WILL TAKE WITH YOU · 02</p>
          <h2>你带来兴趣，<br />我们一起把它变成经历。</h2>
          <p>不是一份空泛的“部门体验”，而是可以被看见、被记住，也能继续带走的大学片段。</p>
        </div>
        <ol className="benefit-list">
          {theme.benefits.map((benefit) => (
            <li key={benefit.number}>
              <span>{benefit.number}</span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="stories section-pad" id="stories">
        <div className="section-heading stories-heading">
          <div>
            <p className="section-kicker">REAL DAYS, REAL PEOPLE · 03</p>
            <h2>不只一起做事，<br />也一起认真生活。</h2>
          </div>
          <p>真实的作品、活动和合照，比任何口号都更能说明 PR 是什么样的地方。</p>
        </div>
        <div className="story-grid">
          {theme.stories.map((story, index) => (
            <article className={`story-card story-card-${index + 1}`} key={story.title}>
              <div className="story-image">
                <img
                  src={story.image.src}
                  alt={story.image.alt}
                  width={story.image.width}
                  height={story.image.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p>{story.tag}</p>
              <h3>{story.title}</h3>
              <span>{story.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="faq section-pad" id="faq">
        <div className="faq-intro">
          <p className="section-kicker">BEFORE YOU ASK · 04</p>
          <h2>你不必一开始<br />就很会。</h2>
          <p>愿意观察、愿意动手、愿意和别人一起完成一件事，已经是很好的开始。</p>
        </div>
        <div className="faq-list">
          {theme.faq.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="join section-pad" id="join">
        <div className="join-shell">
          <div className="join-copy">
            <p className="section-kicker section-kicker-light">JOIN PR · 05</p>
            <p className="join-status">{theme.meta.status}</p>
            <h2>{theme.recruitment.title}</h2>
            <h3>{theme.recruitment.groupName}</h3>
            <p>{theme.recruitment.instruction}</p>
            <p className="join-fallback">{theme.recruitment.fallback}</p>
          </div>
          <div className="qr-card">
            <div className="qr-image">
              <img
                src={theme.recruitment.qr.src}
                alt={theme.recruitment.qr.alt}
                width={theme.recruitment.qr.width}
                height={theme.recruitment.qr.height}
                loading="eager"
                decoding="async"
              />
            </div>
            <strong>{theme.recruitment.validity}</strong>
            <span>微信扫码加入</span>
          </div>
        </div>
      </section>

      <footer>
        <a className="footer-brand" href="#top"><span>PR</span> 深大志联宣传部</a>
        <p>深圳大学志愿者联合会 · 宣传部</p>
        <nav aria-label="页脚导航">
          <a href="#groups">三个分组</a>
          <a href="#stories">真实日常</a>
          <a href="#join">加入我们</a>
        </nav>
        <a className="back-top" href="#top">返回顶部</a>
      </footer>
    </main>
  );
}
