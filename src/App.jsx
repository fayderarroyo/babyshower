import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Stars, Gift, Settings, Plus, User, Check, X, BarChart2 } from 'lucide-react';
import heroImg from './assets/bg_removed_hero.png';
import storkImg from './assets/bg_removed_stork.png';
import balloonsImg from './assets/bg_removed_balloons.png';
import astrolabeImg from './assets/bg_removed_astrolabe.png';
import './App.css';

const API_URL = 'http://localhost:3001/gifts';
const categories = ['Muebles', 'Juguetes', 'Higiene', 'Ropa', 'Accesorios', 'Tecnología'];

function App() {
  const [gifts, setGifts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', category: 'Muebles' });
  const [loading, setLoading] = useState(true);

  // Fetch gifts on load
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setGifts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching gifts:", err);
        setLoading(false);
      });
  }, []);

  const handleReserve = (id) => {
    const name = prompt("Por favor, ingresa tu nombre para reservar este regalo:");
    if (name) {
      fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservedBy: name })
      })
      .then(res => res.json())
      .then(updatedGift => {
        setGifts(gifts.map(g => g.id === id ? updatedGift : g));
      });
    }
  };

  const addGift = (e) => {
    e.preventDefault();
    if (newGift.name) {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGift, id: String(Date.now()), reservedBy: null })
      })
      .then(res => res.json())
      .then(savedGift => {
        setGifts([...gifts, savedGift]);
        setNewGift({ name: '', category: 'Muebles' });
      });
    }
  };

  const removeGift = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        setGifts(gifts.filter(g => g.id !== id));
      });
  };

  const stats = useMemo(() => {
    return categories.map(cat => {
      const items = gifts.filter(g => g.category === cat);
      const reserved = items.filter(g => g.reservedBy).length;
      return {
        category: cat,
        total: items.length,
        reserved,
        percent: items.length > 0 ? (reserved / items.length) * 100 : 0
      };
    });
  }, [gifts]);

  if (loading) return <div className="loading">Cargando Dreamscape...</div>;

  return (
    <div className="app-container">
      <div className="dreamscape-bg" />

      {/* Admin Toggle */}
      <button className="admin-toggle" onClick={() => setIsAdmin(!isAdmin)}>
        {isAdmin ? <X size={20} /> : <Settings size={20} />}
      </button>

      {/* Decorative Floating Elements */}
      <motion.img 
        src={balloonsImg} 
        className="deco-balloons"
        animate={{ y: [0, -40, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.img 
        src={storkImg} 
        className="deco-stork"
        animate={{ x: [-200, 200, -200], y: [0, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            className="admin-panel"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="admin-content">
              <h2>Panel de Administración</h2>
              
              <div className="admin-grid">
                {/* Stats Section */}
                <div className="admin-section stats-section">
                  <h3><BarChart2 size={18} /> Avances por Categoría</h3>
                  <div className="stats-grid">
                    {stats.map(s => (
                      <div key={s.category} className="stat-item">
                        <div className="stat-info">
                          <span>{s.category}</span>
                          <span>{s.reserved}/{s.total}</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${s.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Gift Section */}
                <div className="admin-section add-section">
                  <h3><Plus size={18} /> Agregar Regalo</h3>
                  <form onSubmit={addGift}>
                    <input 
                      type="text" 
                      placeholder="Nombre del regalo..." 
                      value={newGift.name}
                      onChange={(e) => setNewGift({...newGift, name: e.target.value})}
                    />
                    <select 
                      value={newGift.category}
                      onChange={(e) => setNewGift({...newGift, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button type="submit" className="orb-button small">Añadir</button>
                  </form>
                </div>
              </div>

              {/* Reservations List */}
              <div className="admin-section list-section">
                <h3><User size={18} /> Control de Reservas</h3>
                <div className="admin-list">
                  {gifts.map(g => (
                    <div key={g.id} className="admin-list-item">
                      <div className="item-main">
                        <strong>{g.name}</strong>
                        <span className="item-cat">{g.category}</span>
                      </div>
                      <div className="item-status">
                        {g.reservedBy ? (
                          <span className="status reserved">Reservado por: {g.reservedBy}</span>
                        ) : (
                          <span className="status available">Disponible</span>
                        )}
                      </div>
                      <button className="delete-btn" onClick={() => removeGift(g.id)}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAdmin && (
        <>
          {/* Header */}
          <header className="hero-section">
            <motion.div 
              className="header-banner"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, type: "spring" }}
            >
              <div className="banner-content">
                <h3 className="parents-names">Gabriela & Camilo</h3>
                <h1 className="main-title">¡Baby Shower de Ian Gabriel!</h1>
                <p className="motivational-phrase">
                  La llegada de lo mejor que nos ha pasado en la vida está cerca. 
                  Queremos compartir la alegría de este momento tan especial con nuestros familiares y amigos.
                </p>
              </div>
            </motion.div>

            <div className="hero-visual">
              <motion.div
                className="planet-container"
                animate={{ y: [-15, 15, -15], rotate: [-2, 2, -2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={heroImg} alt="Bebé en planetoide" className="hero-image" />
                <div className="glow-effect" />
              </motion.div>
            </div>
          </header>

          {/* Ultrasound Section */}
          <section className="ultrasound-section">
            <motion.h2 className="section-title">LA PRIMERA MIRADA</motion.h2>
            <div className="astrolabe-wrapper">
              <motion.div 
                className="astrolabe-frame-container"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <img src={astrolabeImg} className="astrolabe-frame" alt="Astrolabio" />
              </motion.div>
              <div className="drifting-images">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="ultrasound-card"
                    animate={{
                      y: [0, 400],
                      x: [0, (i % 2 === 0 ? 50 : -50)],
                      opacity: [0, 1, 1, 0],
                      rotate: [0, i * 10],
                      scale: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 12 + i * 2, repeat: Infinity, delay: i * 4, ease: "easeInOut" }}
                  >
                    <div className="ultrasound-content">
                      <div className="image-placeholder"><Stars className="star-icon" size={24} /></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Gift Registry */}
          <section className="registry-section">
            <motion.h2 className="section-title">LISTA DE REGALOS</motion.h2>
            <div className="constellation-grid">
              {gifts.map((gift, idx) => (
                <motion.div
                  key={gift.id}
                  className="gift-bubble"
                  whileHover={{ scale: 1.15, rotate: [0, 2, -2, 0] }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className={`gift-bubble-inner ${gift.reservedBy ? 'reserved' : ''}`}>
                    <div className="gift-header">
                      <Gift size={24} className="gift-icon-main" />
                    </div>
                    <h3 className="gift-name">{gift.name}</h3>
                    <p className="gift-category">{gift.category}</p>
                    <div className="gift-footer">
                      {gift.reservedBy ? (
                        <div className="reserved-tag">
                          <Check size={16} /> Reservado
                        </div>
                      ) : (
                        <div className="action-orbs">
                          <button className="orb-button small" onClick={() => handleReserve(gift.id)}>Reservar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="footer-section">
            <motion.div className="footer-content">
              <p>Esperando con ansias la llegada de <strong>Ian Gabriel</strong></p>
              <p className="date-place">Domingo 21 de Diciembre • 6:00 PM</p>
              <p className="date-place">Salones Agora - Barrio Bosque, transversal 48 número 21-74</p>
            </motion.div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
