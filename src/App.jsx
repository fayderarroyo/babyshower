import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Stars, Gift, Settings, Plus, User, Check, X, BarChart2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import heroImg from './assets/bg_removed_hero.png';
import storkImg from './assets/bg_removed_stork.png';
import balloonsImg from './assets/bg_removed_balloons.png';
import astrolabeImg from './assets/bg_removed_astrolabe.png';
import './App.css';

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const categories = ['Muebles', 'Juguetes', 'Higiene', 'Ropa', 'Accesorios', 'Tecnología'];

// EmailJS Config
const EMAILJS_SERVICE_ID = 'service_bd3az77';
const EMAILJS_TEMPLATE_ID = 'template_h8ej9wz';
const EMAILJS_PUBLIC_KEY = 'tDS7fOJ4BtNDwOPwX';

function App() {
  const [gifts, setGifts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', category: 'Muebles' });
  const [loading, setLoading] = useState(true);

  // Fetch gifts on load
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase credentials missing.");
      setLoading(false);
      return;
    }

    const fetchGifts = async () => {
      const { data, error } = await supabase.from('gifts').select('*').order('created_at', { ascending: true });
      if (error) console.error("Error fetching gifts:", error);
      else setGifts(data || []);
      setLoading(false);
    };

    fetchGifts();

    const subscription = supabase
      .channel('gifts_changes')
      .on('postgres_changes', { event: '*', table: 'gifts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setGifts(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setGifts(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
        } else if (payload.eventType === 'DELETE') {
          setGifts(prev => prev.filter(g => g.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleReserve = async (id, giftName) => {
    const name = prompt("Gabriel y Camilo agradecen tu regalo, por favor confirma el nombre para reservar este regalo:");
    
    if (name && supabase) {
      const { error } = await supabase
        .from('gifts')
        .update({ reservedBy: name })
        .eq('id', id);
      
      if (!error) {
        // Enviar notificación por EmailJS
        const templateParams = {
          from_name: name,
          gift_name: giftName,
        };

        emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        ).then((response) => {
          console.log('Notificación enviada!', response.status, response.text);
        }, (err) => {
          console.error('Error enviando notificación:', err);
        });
      } else {
        alert("Error al reservar: " + error.message);
      }
    }
  };

  const addGift = async (e) => {
    e.preventDefault();
    if (newGift.name && supabase) {
      const { error } = await supabase
        .from('gifts')
        .insert([{ ...newGift, reservedBy: null }]);
      
      if (error) alert("Error al añadir: " + error.message);
      else setNewGift({ name: '', category: 'Muebles' });
    }
  };

  const removeGift = async (id) => {
    if (supabase) {
      const { error } = await supabase.from('gifts').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
    }
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
      {!supabase && (
        <div className="demo-warning">
          ⚠️ Modo Demo: Configura las variables de Supabase en Vercel para activar la persistencia real.
        </div>
      )}
      
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
                          <button className="orb-button small" onClick={() => handleReserve(gift.id, gift.name)}>Reservar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

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
