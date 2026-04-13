import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Cpu, Brain, Code, ChevronRight, Search, Bookmark, CheckCircle, Home, ArrowLeft } from 'lucide-react'
import questionsData from './data/questions.json'

// --- Components ---

const Navbar = ({ dark, setDark, breadcrumbs }) => {
  return (
    <nav className="glass" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '0.5rem', borderRadius: '10px' }}>
            <Cpu size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-1px' }}>ExamAce</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.7, marginLeft: '1rem' }} className="hide-mobile">
           {breadcrumbs.map((b, i) => (
             <React.Fragment key={i}>
                <ChevronRight size={16} />
                <Link to={b.path} style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem' }}>{b.label}</Link>
             </React.Fragment>
           ))}
        </div>
      </div>
      <button onClick={() => setDark(!dark)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        {dark ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </nav>
  )
}

const Footer = () => (
  <footer className="flex-center" style={{ padding: '2rem', marginTop: 'auto', opacity: 0.6, flexDirection: 'column', gap: '0.5rem' }}>
    <p>Made for Students ❤️</p>
    <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Made by Prasad</p>
  </footer>
)

const Background = () => (
  <div className="bg-glow">
    <div className="glow-circle" style={{ width: '400px', height: '400px', background: 'var(--primary-glow)', top: '-100px', left: '-100px' }}></div>
    <div className="glow-circle" style={{ width: '300px', height: '300px', background: 'var(--secondary-glow)', bottom: '10%', right: '5%' }}></div>
    <div className="glow-circle" style={{ width: '250px', height: '250px', background: 'var(--accent-glow)', top: '40%', left: '60%' }}></div>
  </div>
)

// --- Formatter ---

const FormattedAnswer = ({ text }) => {
  if (!text) return null;

  const renderText = (str) => {
    // Handle bold text **text**
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="key-term">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Handle Sections (Example: or Definition:)
    if (trimmedLine.startsWith('Example:') || trimmedLine.startsWith('Definition:') || trimmedLine.startsWith('Note:')) {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${index}`} className="answer-list">{currentList}</ul>);
        currentList = [];
      }
      const [title, ...rest] = trimmedLine.split(':');
      elements.push(
        <div key={`section-${index}`} className="answer-section">
          <span className="answer-section-title">{title}</span>
          <p>{renderText(rest.join(':').trim())}</p>
        </div>
      );
    } 
    // Handle List Items
    else if (trimmedLine.startsWith('- ')) {
      currentList.push(
        <li key={`li-${index}`} className="answer-item">
          {renderText(trimmedLine.substring(2))}
        </li>
      );
    } 
    // Handle Normal Paragraphs
    else if (trimmedLine.length > 0) {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${index}`} className="answer-list">{currentList}</ul>);
        currentList = [];
      }
      elements.push(
        <p key={`p-${index}`} className="answer-paragraph">
          {renderText(trimmedLine)}
        </p>
      );
    }
  });

  if (currentList.length > 0) {
    elements.push(<ul key={`list-final`} className="answer-list">{currentList}</ul>);
  }

  return <div className="answer-content">{elements}</div>;
};

// --- Pages ---

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="container">
      <h1 className="flex-center" style={{ marginBottom: '3rem' }}>Choose Your Subject</h1>
      <div className="grid">
        {questionsData.subjects.map(subject => {
          const Icon = subject.icon === 'Cpu' ? Cpu : subject.icon === 'Brain' ? Brain : Code;
          return (
            <motion.div 
              key={subject.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/subject/${subject.id}`)}
              className="glass glass-hover flex-center"
              style={{ padding: '3rem', flexDirection: 'column', cursor: 'pointer', borderTop: `4px solid ${subject.color}` }}
            >
              <div style={{ background: subject.color, padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: `0 0 20px ${subject.color}66` }}>
                <Icon size={48} color="white" />
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>{subject.name}</h2>
              <p style={{ opacity: 0.6 }}>{subject.modules.length} Modules Available</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

const ModuleSelection = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = questionsData.subjects.find(s => s.id === subjectId);
  
  if (!subject) return <div>Subject not found</div>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} className="btn glass" style={{ padding: '0.5rem' }}><ArrowLeft /></button>
        <h1>{subject.name} Modules</h1>
      </div>
      <div className="grid">
        {[1,2,3,4,5].map(m => (
          <motion.div 
            key={m}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/subject/${subjectId}/module/${m}`)}
            className="glass glass-hover"
            style={{ padding: '2rem', cursor: 'pointer', opacity: subject.modules.find(mod => mod.id === m) ? 1 : 0.5 }}
          >
            <h3>Module {m}</h3>
            {subject.modules.find(mod => mod.id === m) ? (
              <p style={{ color: 'var(--secondary-glow)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Content Available</p>
            ) : (
              <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>Coming Soon</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const QuestionView = () => {
  const { subjectId, moduleId } = useParams();
  const navigate = useNavigate();
  const [marks, setMarks] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({});
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks') || '{}'));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('completed') || '[]'));

  const subject = questionsData.subjects.find(s => s.id === subjectId);
  const module = subject?.modules.find(m => m.id === parseInt(moduleId));

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('completed', JSON.stringify(completed));
  }, [completed]);

  if (!module) return <div className="container"><h1>Coming Soon!</h1><button onClick={() => navigate(-1)} className="btn btn-primary">Go Back</button></div>;

  const toggleBookmark = (id) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCompleted = (id) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredQuestions = marks ? (module.marks[marks] || []).filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const progress = completed.length / (module.marks['2'].length + module.marks['8'].length) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container">
      {!marks ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2>Select Marks Type</h2>
          <div className="flex-center" style={{ gap: '2rem', marginTop: '2rem' }}>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setMarks('2')} className="btn glass" style={{ padding: '3rem', fontSize: '1.5rem' }}>2 Marks</motion.button>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setMarks('8')} className="btn glass" style={{ padding: '3rem', fontSize: '1.5rem' }}>8 Marks</motion.button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setMarks(null)} className="btn glass" style={{ padding: '0.5rem' }}><ArrowLeft /></button>
              <h1>{marks} Marks Questions</h1>
            </div>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', width: '300px' }}>
              <Search size={20} style={{ opacity: 0.5, marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={24} color="var(--secondary-glow)" />
            <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--secondary-glow)', transition: 'width 0.5s ease' }}></div>
            </div>
            <span>{Math.round(progress)}% Done</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredQuestions.map(q => (
              <div key={q.id} className="glass" style={{ overflow: 'hidden' }}>
                <div 
                  onClick={() => setExpanded(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                  style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: '500', flex: 1 }}>{q.question}</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(q.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: bookmarks[q.id] ? 'var(--accent-glow)' : 'inherit' }}>
                      <Bookmark fill={bookmarks[q.id] ? 'currentColor' : 'none'} size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleCompleted(q.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: completed.includes(q.id) ? 'var(--secondary-glow)' : 'inherit' }}>
                      <CheckCircle fill={completed.includes(q.id) ? 'currentColor' : 'none'} size={20} />
                    </button>
                    <motion.div animate={{ rotate: expanded[q.id] ? 180 : 0 }}>
                      <ChevronRight size={20} />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {expanded[q.id] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid var(--glass-border-dark)' }}
                    >
                      <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                        <FormattedAnswer text={q.answer} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.body.className = dark ? '' : 'light';
  }, [dark]);

  return (
    <Router>
      <div className="app-container">
        <Background />
        <Routes>
          <Route path="/" element={<><Navbar dark={dark} setDark={setDark} breadcrumbs={[]} /><LandingPage /></>} />
          <Route path="/subject/:subjectId" element={<><Navbar dark={dark} setDark={setDark} breadcrumbs={[{ label: 'Modules', path: '#' }]} /><ModuleSelection /></>} />
          <Route path="/subject/:subjectId/module/:moduleId" element={<><Navbar dark={dark} setDark={setDark} breadcrumbs={[{ label: 'Modules', path: '..' }, { label: 'Questions', path: '#' }]} /><QuestionView /></>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
