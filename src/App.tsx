import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Gift, Heart, Moon, Music2, Pause, Play, RotateCcw, Sparkles, Sun, Volume2, VolumeX, X } from 'lucide-react'
import { birthday } from './birthday'

type Theme = 'blue' | 'black' | 'cream'
const journey = [
  ['celebrate', 'Birthday countdown'], ['letter', 'Birthday letter'], ['memories', 'Friendship memories'], ['scrapbook', 'Digital scrapbook'], ['open-when', 'Open-when letters'], ['reasons100', '100 reasons'], ['timeline', 'Friendship timeline'], ['reasons', 'Best friend reasons'], ['quiz', 'Friendship quiz'], ['treasure', 'Treasure hunt'], ['cake', 'Birthday cake'], ['surprise', 'Digital gift'], ['music', 'Music player'], ['awards', 'Friendship awards'], ['future-dreams', 'Future dreams'], ['time-capsule', 'Time capsule'], ['wishes', 'Birthday wishes'], ['vault', 'Secret message vault'], ['final-letter', 'Final birthday letter'],
] as const
const confetti = Array.from({ length: 48 }, (_, i) => ({ left: `${(i * 37 + 11) % 100}%`, delay: `${(i % 12) * 0.13}s`, color: ['#dfb75f', '#f0dca9', '#e77c72', '#8badd0'][i % 4] }))

function nextBirthday(date: string, now: Date) {
  if (!date) return null
  const [, month, day] = date.split('-').map(Number)
  if (!month || !day) return null
  let next = new Date(now.getFullYear(), month - 1, day)
  if (next.getTime() < now.getTime()) next = new Date(now.getFullYear() + 1, month - 1, day)
  return next
}

function isBirthdayToday(date: string, now: Date) {
  const [, month, day] = date.split('-').map(Number)
  return Boolean(month && day && month === now.getMonth() + 1 && day === now.getDate())
}

function Cake({ lit, onClick }: { lit: boolean; onClick: () => void }) {
  return <button className={`cake-scene ${lit ? 'candles-lit' : 'candles-out'}`} onClick={onClick} aria-label={lit ? 'Blow out the birthday candles' : 'Relight the birthday candles'} title={lit ? 'Tap to blow out the candles' : 'Tap to relight the candles'}><span className="cake-sparkle s1">✦</span><span className="cake-sparkle s2">✧</span><div className="candles"><i /><i /><i /></div><div className="cake-top" /><div className="cake-layer"><span>•</span><span>•</span><span>•</span><span>•</span></div><div className="cake-base" /><div className="cake-plate" /><span className="cake-tap-hint">{lit ? 'TAP TO MAKE A WISH' : 'WISH MADE ✨'}</span></button>
}

function App() {
  const [started, setStarted] = useState(false)
  const [secretOpen, setSecretOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [opened, setOpened] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [activeReason, setActiveReason] = useState<number | null>(null)
  const [shownReasons, setShownReasons] = useState(20)
  const [revealedReasons, setRevealedReasons] = useState<Set<number>>(() => new Set())
  const [favoritePhotos, setFavoritePhotos] = useState<string[]>(() => JSON.parse(localStorage.getItem('birthday-favorites') || '[]') as string[])
  const [openLetter, setOpenLetter] = useState<number | null>(null)
  const [treasureStep, setTreasureStep] = useState(0)
  const [treasureFeedback, setTreasureFeedback] = useState('')
  const [timeCapsuleText, setTimeCapsuleText] = useState(() => localStorage.getItem('birthday-time-capsule') || '')
  const [timeCapsuleSaved, setTimeCapsuleSaved] = useState(false)
  const [vaultEntry, setVaultEntry] = useState('')
  const [vaultOpen, setVaultOpen] = useState(false)
  const [vaultFeedback, setVaultFeedback] = useState('')
  const [easterEgg, setEasterEgg] = useState(false)
  const [easterKey, setEasterKey] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [visitedSections, setVisitedSections] = useState<string[]>([])
  const [finalTyped, setFinalTyped] = useState('')
  const [finale, setFinale] = useState(false)
  const [candlesLit, setCandlesLit] = useState(true)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('birthday-theme') as Theme) || 'blue')
  const [birthdayDate, setBirthdayDate] = useState(() => localStorage.getItem('birthday-date') || birthday.date)
  const [wishIndex, setWishIndex] = useState(-1)
  const [wishCopyStatus, setWishCopyStatus] = useState('')
  const [scrapbookNote, setScrapbookNote] = useState(() => localStorage.getItem('birthday-scrapbook-note') || '')
  const [dreams, setDreams] = useState<string[]>(() => JSON.parse(localStorage.getItem('birthday-dreams') || '["Take a trip somewhere new", "Celebrate another year of friendship", "Keep showing up for each other"]') as string[])
  const [dreamInput, setDreamInput] = useState('')
  const [now, setNow] = useState(() => new Date())
  const audioContext = useRef<AudioContext | null>(null)
  const finalTypeTimer = useRef<number | null>(null)
  const masterGain = useRef<GainNode | null>(null)
  const musicTimer = useRef<number | null>(null)
  const musicStep = useRef(0)

  useEffect(() => { if (started) window.scrollTo({ top: 0, behavior: 'smooth' }) }, [started])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => { localStorage.setItem('birthday-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('birthday-date', birthdayDate) }, [birthdayDate])
  useEffect(() => { localStorage.setItem('birthday-favorites', JSON.stringify(favoritePhotos)) }, [favoritePhotos])
  useEffect(() => { localStorage.setItem('birthday-time-capsule', timeCapsuleText) }, [timeCapsuleText])
  useEffect(() => { localStorage.setItem('birthday-scrapbook-note', scrapbookNote) }, [scrapbookNote])
  useEffect(() => { localStorage.setItem('birthday-dreams', JSON.stringify(dreams)) }, [dreams])
  useEffect(() => {
    if (masterGain.current && audioContext.current) masterGain.current.gain.setTargetAtTime(muted ? 0 : volume, audioContext.current.currentTime, 0.04)
  }, [muted, volume])
  useEffect(() => () => { if (musicTimer.current !== null) window.clearInterval(musicTimer.current); void audioContext.current?.close() }, [])
  useEffect(() => {
    if (!started) return
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(maxScroll > 0 ? Math.min(100, Math.round(window.scrollY / maxScroll * 100)) : 100)
      const passed = journey.filter(([id]) => { const element = document.getElementById(id); return element ? element.getBoundingClientRect().top < window.innerHeight * 0.58 : false }).map(([id]) => id)
      if (passed.length) setVisitedSections((seen) => [...new Set([...seen, ...passed])])
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [started])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
      const next = (easterKey + event.key.toLowerCase()).slice(-3)
      setEasterKey(next)
      if (next === 'bro') { setEasterEgg(true); window.setTimeout(() => setEasterEgg(false), 4200) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [easterKey])
  useEffect(() => {
    if (!finale) return
    const note = `Hey ${birthday.nickname}! ${birthday.finalLetter}`
    let cursor = 0
    setFinalTyped('')
    const timer = window.setInterval(() => {
      cursor = Math.min(note.length, cursor + 3)
      setFinalTyped(note.slice(0, cursor))
      if (cursor === note.length) { window.clearInterval(timer); finalTypeTimer.current = null }
    }, 28)
    finalTypeTimer.current = timer
    return () => { window.clearInterval(timer); finalTypeTimer.current = null }
  }, [finale])
  useEffect(() => {
    if (selectedPhoto === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null)
      if (event.key === 'ArrowRight') setSelectedPhoto((selectedPhoto + 1) % birthday.photos.length)
      if (event.key === 'ArrowLeft') setSelectedPhoto((selectedPhoto - 1 + birthday.photos.length) % birthday.photos.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedPhoto])

  const toggleMusic = async () => {
    if (playing) {
      if (musicTimer.current !== null) window.clearInterval(musicTimer.current)
      musicTimer.current = null
      await audioContext.current?.suspend()
      setPlaying(false)
      return
    }
    const context = audioContext.current ?? new AudioContext()
    audioContext.current = context
    if (!masterGain.current) {
      masterGain.current = context.createGain()
      masterGain.current.gain.value = muted ? 0 : volume
      masterGain.current.connect(context.destination)
    }
    await context.resume()
    const notes = [60, 64, 67, 72, 71, 67, 64, 67, 62, 65, 69, 74, 72, 69, 65, 69]
    const playNote = (midi: number, at: number, duration: number, wave: OscillatorType, level: number) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = wave
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12)
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(level, at + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
      oscillator.connect(gain).connect(masterGain.current!)
      oscillator.start(at)
      oscillator.stop(at + duration + 0.02)
    }
    const tick = () => {
      const step = musicStep.current++ % notes.length
      const at = context.currentTime + 0.03
      playNote(notes[step], at, 0.34, 'triangle', 0.16)
      if (step % 4 === 0) playNote(notes[step] - 24, at, 0.48, 'sine', 0.12)
    }
    tick()
    musicTimer.current = window.setInterval(tick, 360)
    setPlaying(true)
  }

  const begin = () => { setStarted(true); setFinale(false); window.setTimeout(() => document.getElementById('celebrate')?.scrollIntoView({ behavior: 'smooth' }), 80) }
  const replay = () => { setStarted(false); setSecretOpen(false); setOpened(false); setActiveReason(null); setFinale(false); setCandlesLit(true); setQuizAnswers({}); setTreasureStep(0); setTreasureFeedback(''); setVaultEntry(''); setVaultOpen(false); setVaultFeedback(''); setSelectedPhoto(null); setVisitedSections([]); setShownReasons(20); setRevealedReasons(new Set()); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const countdownTarget = nextBirthday(birthdayDate, now)
  const birthdayArrived = isBirthdayToday(birthdayDate, now)
  useEffect(() => { if (birthdayArrived) setCelebrationKey((key) => key + 1) }, [birthdayArrived])
  const remaining = countdownTarget ? Math.max(0, countdownTarget.getTime() - now.getTime()) : 0
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  const seconds = Math.floor((remaining % 60_000) / 1000)
  const quizComplete = Object.keys(quizAnswers).length === birthday.quiz.length
  const quizScore = birthday.quiz.reduce((score, item, index) => score + (quizAnswers[index] === item.answer ? 1 : 0), 0)
  const themes: { id: Theme; label: string; icon: typeof Moon }[] = [{ id: 'blue', label: 'Midnight blue', icon: Moon }, { id: 'black', label: 'Classic black', icon: Sparkles }, { id: 'cream', label: 'Warm cream', icon: Sun }]
  const themePicker = <div className="theme-picker" aria-label="Choose a color theme">{themes.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTheme(id)} className={theme === id ? 'theme-active' : ''} aria-label={label} title={label}><Icon size={14} /></button>)}</div>
  const toggleFavorite = (src: string) => setFavoritePhotos((saved) => saved.includes(src) ? saved.filter((item) => item !== src) : [...saved, src])
  const treasureAnswer = (answer: string) => {
    if (treasureStep < birthday.treasure.length && answer.trim().toLowerCase() === birthday.treasure[treasureStep].answer.toLowerCase()) { setTreasureStep((step) => step + 1); setTreasureFeedback('That’s it! One step closer to the gift.') }
    else setTreasureFeedback('Not that one—take another look at the clue.')
  }
  const showFullLetter = () => {
    if (finalTypeTimer.current !== null) window.clearInterval(finalTypeTimer.current)
    finalTypeTimer.current = null
    setFinalTyped(`Hey ${birthday.nickname}! ${birthday.finalLetter}`)
  }

  if (!started) return <main className="welcome-screen" data-theme={theme}>
    <div className="welcome-glow" /><div className="stars" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ left: `${(i * 43 + 5) % 100}%`, top: `${(i * 29 + 7) % 90}%`, animationDelay: `${i * .2}s` }}>✦</span>)}</div>
    <div className="welcome-theme">{themePicker}</div><div className="floating-balloon balloon-a">🎈</div><div className="floating-balloon balloon-b">🎈</div><div className="welcome-content">
      <div className="eyebrow"><span /> A LITTLE SOMETHING FOR YOU <span /></div>
      <button className={`secret-envelope ${secretOpen ? 'envelope-open' : ''}`} onClick={() => setSecretOpen(true)} aria-label="Open your secret birthday envelope"><span className="envelope-flap" /><span className="envelope-heart">♡</span><span className="envelope-seal">✦</span></button>
      <h1>Happy Birthday,<br /><em>{birthday.nickname}</em></h1>{secretOpen ? <p className="welcome-copy secret-entrance-copy">{birthday.secretEntrance}</p> : <p className="welcome-copy">A little secret note is waiting for you.<br />Tap the envelope when you’re ready.</p>}
      <button className="button button-gold" onClick={secretOpen ? begin : () => setSecretOpen(true)}>{secretOpen ? 'Enter your celebration' : 'Open your secret entrance'} <ArrowRight size={17} /></button><div className="welcome-foot"><span>MADE WITH LOVE</span><Heart size={12} fill="currentColor" /><span>JUST FOR YOU</span></div>
    </div><div className="welcome-bottom">SCROLL LESS, CELEBRATE MORE <span>✦</span></div>
  </main>

  return <main className="site-shell" data-theme={theme}>
    <header className="topbar"><a className="brand" href="#celebrate" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><span className="brand-mark">✦</span> A DAY FOR {birthday.nickname.toUpperCase()}</a><div className="topbar-right"><span className="today-dot" /> YOUR DAY, YOUR WAY <span className="topbar-date">✦</span></div>{themePicker}<div className="nav-holder"><button className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-expanded={navOpen} aria-label="Toggle birthday pages">{navOpen ? <X size={16} /> : <span className="nav-lines">☰</span>}<span>Explore</span></button>{navOpen && <nav className="journey-menu" aria-label="Birthday page navigation">{journey.map(([id, label], index) => <a key={id} href={`#${id}`} onClick={() => setNavOpen(false)}><span>{String(index + 1).padStart(2, '0')}</span>{label}{visitedSections.includes(id) && <Check size={13} />}</a>)}</nav>}</div></header>
    <div className="journey-progress" aria-label={`Progress: ${visitedSections.length} of ${journey.length} pages visited`}><div className="journey-progress-fill" style={{ width: `${scrollProgress}%` }} /><span>{visitedSections.length} / {journey.length} STOPS EXPLORED</span></div>
    {easterEgg && <div className="easter-toast" role="status">You found the secret handshake. Top tier friend. 🤝✨</div>}
    <section className="celebration section-wrap" id="celebrate"><div key={celebrationKey} className="confetti" aria-hidden="true">{confetti.map((piece, i) => <i key={i} style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }} />)}</div><div className="celebration-copy"><div className="eyebrow"><span /> TODAY WE CELEBRATE YOU <span /></div><h2>Another year of<br /><em>being legendary.</em></h2><p>More life. More laughs. More of the good stuff.<br />You deserve every bit of it.</p><a className="text-link" href="#letter">Keep going <ArrowDown size={15} /></a>
      <div className="countdown-card"><div className="countdown-heading"><CalendarDays size={14} /> {birthdayArrived ? 'TODAY IS YOUR DAY!' : 'BIRTHDAY COUNTDOWN'}</div><div className="date-input-wrap"><input aria-label="Birthday date" type="date" value={birthdayDate} onChange={(event) => setBirthdayDate(event.target.value)} /><span>EDIT DATE</span></div>{birthdayArrived ? <div className="birthday-today-message">Happy birthday, {birthday.nickname}! Make a wish. 🎉</div> : birthdayDate ? <div className="countdown-numbers">{[[days, 'DAYS'], [hours, 'HRS'], [minutes, 'MIN'], [seconds, 'SEC']].map(([value, label]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div> : <p className="countdown-hint">The countdown will appear here when a date is set.</p>}</div>
    </div><div className="cake-wrap" id="cake"><div className="cake-halo" /><Cake lit={candlesLit} onClick={() => { setCandlesLit(!candlesLit); setCelebrationKey((key) => key + 1) }} /><span className="cake-caption">one more candle, one more story <span>♡</span></span></div><div className="section-index">01 <span>/</span> 19</div></section>

    <section className="letter section-wrap" id="letter"><div className="section-heading"><div className="eyebrow">A FEW WORDS FROM ME</div><h2>For my <em>favorite human.</em></h2></div><article className="letter-card"><div className="letter-decoration">“</div><div className="letter-top"><span className="letter-label"><Heart size={13} /> A BIRTHDAY NOTE</span><span className="letter-stars">✦ ✧ ✦</span></div>{birthday.wish.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="letter-sign">Your best friend <span>♡</span></div></article><div className="section-index">02 <span>/</span> 19</div></section>

    <section className="memories section-wrap" id="memories"><div className="section-heading heading-row"><div><div className="eyebrow">THE GOOD TIMES REEL</div><h2>Little moments,<br /><em>big memories.</em></h2></div><span className="memory-hint">TAP A PHOTO TO TAKE A CLOSER LOOK <ArrowDown size={14} /></span></div><div className="memory-grid">{birthday.photos.map((photo, i) => <article className={`memory-card photo-${i + 1}`} key={photo.src}><button className="memory-photo" onClick={() => setSelectedPhoto(i)} aria-label={`View photo: ${photo.caption}`}><img className="memory-image" src={photo.src} alt={photo.caption} loading={i < 3 ? 'eager' : 'lazy'} /><span className="photo-count">0{i + 1} / 0{birthday.photos.length}</span><span className="photo-zoom"><Sparkles size={15} /> VIEW MEMORY</span></button><div className="memory-meta"><div><h3>{photo.caption}</h3><p>{photo.detail}</p></div><button className={`photo-heart ${favoritePhotos.includes(photo.src) ? 'liked' : ''}`} aria-label={`${favoritePhotos.includes(photo.src) ? 'Remove favorite' : 'Add favorite'}: ${photo.caption}`} aria-pressed={favoritePhotos.includes(photo.src)} onClick={() => toggleFavorite(photo.src)}><Heart size={17} /></button></div></article>)}</div><p className="photo-note">Your saved project photos are already in the gallery. Change the images and captions in <code>src/birthday.ts</code>. {favoritePhotos.length > 0 && <span>{favoritePhotos.length} favorite{favoritePhotos.length === 1 ? '' : 's'} saved.</span>}</p><div className="section-index">03 <span>/</span> 19</div></section>

    <section className="scrapbook section-wrap" id="scrapbook"><div className="section-heading"><div className="eyebrow">A POCKET-SIZED LOOK BACK</div><h2>Our little <em>scrapbook.</em></h2><p className="subheading">A few favorite frames, with room for a note of your own.</p></div><div className="scrapbook-grid">{birthday.photos.slice(0, 4).map((photo, index) => <figure className="scrapbook-card" key={photo.src}><button onClick={() => setSelectedPhoto(index)} aria-label={`Open scrapbook photo: ${photo.caption}`}><img src={photo.src} alt={photo.caption} loading="lazy" /></button><figcaption><span>MEMORY {String(index + 1).padStart(2, '0')}</span><strong>{photo.caption}</strong></figcaption></figure>)}</div><label className="scrapbook-note-label">A note for the scrapbook<textarea value={scrapbookNote} onChange={(event) => setScrapbookNote(event.target.value)} maxLength={240} placeholder="Add a favorite in-joke or memory..." /></label><span className="scrapbook-count">{scrapbookNote.length} / 240</span><div className="section-index">04 <span>/</span> 19</div></section>

    <section className="open-when section-wrap" id="open-when"><div className="section-heading"><div className="eyebrow">A NOTE FOR WHATEVER KIND OF DAY</div><h2>Open when you <em>need a friend.</em></h2><p className="subheading">A little reminder for the moments in between birthdays.</p></div><div className="open-when-grid">{birthday.openWhen.map((letter, index) => <article key={letter.mood} className={`open-when-card ${openLetter === index ? 'is-open' : ''}`}><button onClick={() => setOpenLetter(openLetter === index ? null : index)} aria-expanded={openLetter === index}><span className="open-when-icon">{letter.icon}</span><span className="open-when-mood">OPEN WHEN…</span><strong>{letter.mood}</strong><span className="open-when-action">{openLetter === index ? 'Fold this note' : 'Open your note'} <ArrowRight size={14} /></span></button>{openLetter === index && <div className="open-when-message"><h3>{letter.title}</h3><p>{letter.text}</p><span>— Your best friend</span></div>}</article>)}</div><div className="section-index">05 <span>/</span> 19</div></section>

    <section className="reasons100 section-wrap" id="reasons100"><div className="section-heading heading-row"><div><div className="eyebrow">A HUNDRED LITTLE REMINDERS</div><h2>100 reasons you’re <em>amazing.</em></h2><p className="subheading">Some heartfelt, some slightly too specific. Tap a card to reveal it.</p></div><span className="reason-progress">{revealedReasons.size} / 100 REVEALED</span></div><div className="reasons100-grid">{birthday.reasons100.slice(0, shownReasons).map((reason, index) => <button key={index} className={`reason100-card ${revealedReasons.has(index) ? 'revealed' : ''}`} onClick={() => setRevealedReasons((current) => { const updated = new Set(current); if (updated.has(index)) updated.delete(index); else updated.add(index); return updated })} aria-expanded={revealedReasons.has(index)}><span>{String(index + 1).padStart(3, '0')}</span><strong>{revealedReasons.has(index) ? reason : 'Tap for a reason…'}</strong><Heart size={15} fill={revealedReasons.has(index) ? 'currentColor' : 'none'} /></button>)}</div>{shownReasons < birthday.reasons100.length && <button className="button button-outline show-more" onClick={() => setShownReasons(Math.min(shownReasons + 20, birthday.reasons100.length))}>Reveal 20 more reasons <ArrowDown size={15} /></button>}<div className="section-index">06 <span>/</span> 19</div></section>

    <section className="timeline section-wrap" id="timeline"><div className="section-heading"><div className="eyebrow">OUR STORY, IN LITTLE CHAPTERS</div><h2>So many good things<br /><em>still ahead.</em></h2><p className="subheading">Edit the dates, photos, and stories in <code>src/birthday.ts</code>.</p></div><div className="timeline-track">{birthday.timeline.map((item) => <article className="timeline-item" key={item.mark}><span className="timeline-mark">{item.mark}<i /></span><div className="timeline-content">{item.image && <img src={item.image} alt="" loading="lazy" />}<span className="timeline-label">{item.date}</span><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div><div className="section-index">07 <span>/</span> 19</div></section>

    <section className="reasons section-wrap" id="reasons"><div className="section-heading"><div className="eyebrow">NO GENERIC BIRTHDAY STUFF</div><h2>Reasons you’re my <em>best friend.</em></h2><p className="subheading">Tap a card. There’s a little more to it.</p></div><div className="reason-grid">{birthday.reasons.map((reason, i) => <button className={`reason-card ${activeReason === i ? 'is-active' : ''}`} key={reason.title} onClick={() => setActiveReason(activeReason === i ? null : i)} aria-expanded={activeReason === i}><span className="reason-count">0{i + 1}</span><span className="reason-icon">{reason.icon}</span><span className="reason-title">{reason.title}</span><span className="reason-detail">{activeReason === i ? reason.detail : 'Tap to read more'}</span><span className="reason-plus">{activeReason === i ? <X size={15} /> : <ArrowRight size={15} />}</span></button>)}</div><div className="section-index">08 <span>/</span> 19</div></section>

    <section className="quiz section-wrap" id="quiz"><div className="quiz-header"><div><div className="eyebrow">A VERY SCIENTIFIC FRIENDSHIP TEST</div><h2>How well do you know<br /><em>our friendship?</em></h2></div><span className="quiz-badge">{quizComplete ? `${quizScore} / ${birthday.quiz.length} RIGHT` : `${Object.keys(quizAnswers).length} / ${birthday.quiz.length} ANSWERED`}</span></div><div className="quiz-list">{birthday.quiz.map((question, i) => <article className="quiz-question" key={question.question}><div className="quiz-question-title"><span>0{i + 1}</span><h3>{question.question}</h3></div><div className="quiz-options">{question.options.map((option) => <button key={option} className={`${quizAnswers[i] === option ? 'selected' : ''} ${quizComplete && question.answer === option ? 'is-correct' : ''}`} onClick={() => setQuizAnswers({ ...quizAnswers, [i]: option })}>{quizAnswers[i] === option && quizComplete ? <Check size={14} /> : null}{option}</button>)}</div></article>)}</div>{quizComplete ? <div className="quiz-result"><Sparkles size={18} /><div><strong>{quizScore === birthday.quiz.length ? 'Perfect score. Friendship experts confirmed.' : quizScore > 0 ? 'That’s the spirit. You know what matters.' : 'The best answer is always: more memories together.'}</strong><span>You got {quizScore} out of {birthday.quiz.length} — this friendship is a win either way.</span></div><button className="quiz-reset" onClick={() => setQuizAnswers({})}><RotateCcw size={14} /> Play again</button></div> : <p className="quiz-hint">Pick an answer for each question to see your result.</p>}<div className="section-index">09 <span>/</span> 19</div></section>

    <section className="treasure section-wrap" id="treasure"><div className="section-heading"><div className="eyebrow">THREE CLUES, ONE LITTLE PRIZE</div><h2>Friendship <em>treasure hunt.</em></h2><p className="subheading">Follow the clues around your birthday surprise.</p></div>{treasureStep < birthday.treasure.length ? <article className="treasure-card"><span className="treasure-step">CLUE {treasureStep + 1} OF {birthday.treasure.length}</span><div className="treasure-icon">&#x1F511;</div><p>{birthday.treasure[treasureStep].clue}</p><div className="treasure-options">{birthday.treasure[treasureStep].options.map((option) => <button key={option} onClick={() => treasureAnswer(option)}>{option}<ArrowRight size={14} /></button>)}</div>{treasureFeedback && <span className="treasure-feedback" role="status">{treasureFeedback}</span>}</article> : <article className="treasure-card treasure-complete"><div className="treasure-icon">&#x1F381;</div><h3>All clues found!</h3><p>You&apos;ve earned the birthday treasure. Your gift is waiting.</p><button className="button button-gold" onClick={() => { setOpened(true); document.getElementById('surprise')?.scrollIntoView({ behavior: 'smooth' }) }}>Claim the secret gift <Gift size={15} /></button></article>}<div className="section-index">10 <span>/</span> 19</div></section>

    <section className={`surprise section-wrap ${opened ? 'is-open' : ''}`} id="surprise"><div className="surprise-card"><div className="surprise-decoration decor-a">✧</div><div className="surprise-decoration decor-b">✦</div><div className="surprise-inner">{!opened ? <><div className="surprise-icon"><Gift size={27} /></div><div className="eyebrow">OKAY, ONE LAST THING</div><h2>I saved you<br /><em>a little something.</em></h2><p>There’s a message tucked away in here.<br />Go on, open your gift.</p><button className="button button-gold surprise-open" onClick={() => setOpened(true)}><span className="surprise-gift-emoji">🎁</span> Open your gift <Gift size={16} /></button></> : <div className="revealed-message"><div className="burst">🎉</div><img className="gift-surprise-photo" src={birthday.photos[0].src} alt={birthday.photos[0].caption} /><div className="eyebrow">SURPRISE! SURPRISE!</div><h2>You’re one of<br /><em>a kind, {birthday.nickname}.</em></h2><p>Life’s better with you in it. Wherever this next year takes you, I hope you know you’ve got a friend for all of it. Now go enjoy your birthday—you’ve earned it. 🥂</p><button className="button button-outline" onClick={() => setOpened(false)}><RotateCcw size={15} /> Close the note</button></div>}</div></div><div className="section-index">12 <span>/</span> 19</div>
      <div className="music-player" id="music"><div className="music-art"><Music2 size={18} /></div><div className="music-copy"><span>SET THE MOOD</span><strong>Birthday vibes <small>· original little tune</small></strong></div><button className="play-button" onClick={() => void toggleMusic()} aria-label={playing ? 'Pause music' : 'Play music'}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><button className="mute-button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute music' : 'Mute music'}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button><label className="volume-control"><span className="sr-only">Music volume</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Music volume" /></label><span className="music-status">{playing ? (muted ? 'MUTED' : 'PLAYING') : 'OPTIONAL'}</span></div><p className="music-note">No autoplay. Press play for the original tune, then adjust the volume or mute it.</p><div className="section-index">13 <span>/</span> 19</div>
    </section>

    <section className="awards section-wrap" id="awards"><div className="section-heading"><div className="eyebrow">THE OFFICIAL, VERY SERIOUS CEREMONY</div><h2>Friendship <em>awards.</em></h2><p className="subheading">There was never much competition for these.</p></div><div className="awards-grid">{birthday.awards.map((award) => <article className="award-card" key={award.title}><span className="award-badge">{award.badge}</span><span className="award-ribbon">EXCELLENCE IN FRIENDSHIP</span><h3>{award.title}</h3><p>{award.note}</p><span className="award-seal">CERTIFIED REAL ONE &#x2726;</span></article>)}</div><div className="section-index">14 <span>/</span> 19</div></section>

    <section className="future-dreams section-wrap" id="future-dreams"><div className="section-heading"><div className="eyebrow">THE NEXT CHAPTER IS OURS</div><h2>Good things <em>still ahead.</em></h2><p className="subheading">Keep a little list of the adventures and milestones you want to share.</p></div><form className="dream-form" onSubmit={(event) => { event.preventDefault(); const dream = dreamInput.trim(); if (dream) { setDreams((items) => [...items, dream]); setDreamInput('') } }}><input value={dreamInput} onChange={(event) => setDreamInput(event.target.value)} maxLength={100} placeholder="Add a future friendship dream..." aria-label="New future dream" /><button className="button button-gold" type="submit" disabled={!dreamInput.trim()}>Add to our list <ArrowRight size={14} /></button></form><ul className="dream-list">{dreams.map((dream, index) => <li key={`${dream}-${index}`}><span className="dream-mark">?</span><span>{dream}</span><button onClick={() => setDreams((items) => items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove dream: ${dream}`}><X size={15} /></button></li>)}</ul><div className="section-index">15 <span>/</span> 19</div></section>

    <section className="time-capsule section-wrap" id="time-capsule"><div className="time-capsule-card"><div className="time-capsule-icon">&#x231B;</div><div className="eyebrow">A MESSAGE FOR FUTURE YOU</div><h2>Open this in <em>a year.</em></h2><p>Leave a note for future-you to read later. It stays saved in this browser.</p><textarea value={timeCapsuleText} onChange={(event) => { setTimeCapsuleText(event.target.value); setTimeCapsuleSaved(false) }} maxLength={500} placeholder="What do you hope future-you remembers?" aria-label="Message for future you" /><div className="capsule-actions"><span>{timeCapsuleText.length} / 500</span><button className="button button-gold" onClick={() => { localStorage.setItem('birthday-time-capsule', timeCapsuleText); setTimeCapsuleSaved(true) }}>{timeCapsuleSaved ? <><Check size={15} /> Sealed for later</> : 'Seal the time capsule'}</button></div></div><div className="section-index">16 <span>/</span> 19</div></section>

    <section className="wishes section-wrap" id="wishes"><div className="wish-card"><div className="eyebrow">A WISH, PICKED JUST FOR YOU</div><div className="wish-star">?</div><h2>Birthday <em>wishes.</em></h2><p aria-live="polite">{wishIndex < 0 ? 'Tap below for a little birthday reminder.' : birthday.wish[wishIndex]}</p><div className="wish-actions"><button className="button button-gold" onClick={() => { setWishIndex((index) => (index + 1) % birthday.wish.length); setWishCopyStatus('') }}><Sparkles size={15} /> Pick a birthday wish</button>{wishIndex >= 0 && <button className="button button-outline" onClick={async () => { const message = `Happy birthday, ${birthday.nickname}! ${birthday.wish[wishIndex]}`; try { await navigator.clipboard.writeText(message); setWishCopyStatus('Personalized wish copied.') } catch { setWishCopyStatus(message) } }}>Copy personalized wish</button>}</div>{wishCopyStatus && <span className="wish-copy-status" role="status">{wishCopyStatus}</span>}<small>Wish {wishIndex < 0 ? '?' : `${wishIndex + 1} of ${birthday.wish.length}`}</small></div><div className="section-index">17 <span>/</span> 19</div></section>

    <section className="vault section-wrap" id="vault"><div className="vault-card"><div className="vault-lock">&#x1F512;</div><div className="eyebrow">A NOTE BEHIND A TINY LOCK</div><h2>Secret message <em>vault.</em></h2>{vaultOpen ? <div className="vault-reveal"><Sparkles size={21} /><p>{birthday.vaultMessage}</p><button className="button button-outline" onClick={() => { setVaultOpen(false); setVaultEntry('') }}>Lock the note again</button></div> : <><p>Enter the birthday passphrase to unlock one last note.</p><form className="vault-form" onSubmit={(event) => { event.preventDefault(); if (vaultEntry.trim().toLowerCase() === birthday.vaultCode.toLowerCase()) { setVaultOpen(true); setVaultFeedback('') } else setVaultFeedback('That passphrase does not ring a bell. Try again.') }}><input type="password" value={vaultEntry} onChange={(event) => setVaultEntry(event.target.value)} placeholder="Your secret passphrase" aria-label="Secret passphrase" /><button className="button button-gold" type="submit">Unlock <ArrowRight size={14} /></button></form>{vaultFeedback && <p className="vault-feedback" role="status">{vaultFeedback}</p>}<small>Hint: {birthday.vaultHint} The passphrase is editable in <code>src/birthday.ts</code>.</small></>}</div><div className="section-index">18 <span>/</span> 19</div></section>

    <section className="final-letter-section section-wrap" id="final-letter"><div className="footer-sparkle">&#x2726;</div><div className="eyebrow">WHEN YOU&apos;VE SEEN EVERYTHING...</div><h2>One last thing, <em>{birthday.nickname}.</em></h2><p>The last note is the one I hope you remember.</p><button className="button button-gold final-reveal" onClick={() => { setFinale(true); setCelebrationKey((key) => key + 1) }}><Heart size={15} /> Open your final birthday letter</button><div className="section-index">19 <span>/</span> 19</div></section>

    <footer className="final-card"><div className="footer-sparkle">✦</div><span className="footer-eyebrow">AND THAT’S A WRAP…</span><h2>Here’s to you,<br /><em>always.</em></h2><p>Hope today feels as special as you make the people around you feel.<br />Happy birthday, {birthday.nickname}. You deserve the very best. 🤍</p><button className="button button-gold final-reveal" onClick={() => { setFinale(true); setCelebrationKey((key) => key + 1) }}><Sparkles size={15} /> Reveal your final surprise</button><button className="replay-link" onClick={replay}><RotateCcw size={13} /> Replay the surprise</button><div className="footer-rule"><span>MADE WITH LOVE</span><Heart size={12} fill="currentColor" /><span>JUST FOR YOU</span></div></footer>

    {selectedPhoto !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setSelectedPhoto(null)}><button className="lightbox-close" onClick={() => setSelectedPhoto(null)} aria-label="Close photo preview"><X size={22} /></button><button className="lightbox-nav lightbox-prev" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto - 1 + birthday.photos.length) % birthday.photos.length) }} aria-label="Previous photo"><ChevronLeft /></button><figure className="lightbox-content" onClick={(event) => event.stopPropagation()}><img src={birthday.photos[selectedPhoto].src} alt={birthday.photos[selectedPhoto].caption} /><figcaption><strong>{birthday.photos[selectedPhoto].caption}</strong><span>{birthday.photos[selectedPhoto].detail}</span></figcaption></figure><button className="lightbox-nav lightbox-next" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto + 1) % birthday.photos.length) }} aria-label="Next photo"><ChevronRight /></button><div className="lightbox-counter">{selectedPhoto + 1} / {birthday.photos.length}</div></div>}

    {finale && <div className="finale-overlay" role="dialog" aria-modal="true" aria-label="Your final birthday surprise"><div className="finale-confetti" aria-hidden="true">{confetti.map((piece, i) => <i key={i} style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }} />)}</div><button className="lightbox-close" onClick={() => setFinale(false)} aria-label="Close final surprise"><X size={22} /></button><div className="finale-card"><div className="finale-emoji">🎂</div><span className="eyebrow">A FINAL LITTLE WISH</span><h2>Happy birthday,<br /><em>{birthday.nickname}.</em></h2><p className="typewriter-message" aria-live="polite">{finalTyped}<span className="typewriter-caret">|</span></p><button className="typewriter-skip" onClick={showFullLetter}>Show the full note</button><div className="finale-hearts">♡ &nbsp; ✦ &nbsp; ♡</div><button className="button button-gold" onClick={replay}><RotateCcw size={15} /> Replay your surprise</button></div></div>}
  </main>
}

export default App
