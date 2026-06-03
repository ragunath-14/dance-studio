import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, MessageCircle, Calendar, Users } from '../icons.jsx'
import API_URL from '../config'
import './RegisterModal.css'

const RegisterModal = ({ showModal, setShowModal }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    whatsappNumber: '',
    whatsappSame: true,
    studentAge: '',
    gender: '',
    classType: '',
    batchTiming: '',
    // these are hidden to avoid breaking API
    parentName: '',
    location: '',
    notes: '',
    danceStyle: '',
    danceForFitness: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  React.useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal])

  if (!showModal) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errors = {};
    if (!formData.studentName.trim()) {
      errors.studentName = "Required";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Required";
    }
    if (!formData.whatsappSame && !formData.whatsappNumber.trim()) {
      errors.whatsappNumber = "Required";
    }
    if (!formData.classType) {
      errors.classType = "Required";
    }
    if (!formData.batchTiming) {
      errors.batchTiming = "Required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!validate()) {
      setStatus({ type: 'error', message: 'Please fill out all required fields.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        whatsappNumber: formData.whatsappSame ? formData.phone : formData.whatsappNumber
      };
      delete dataToSubmit.whatsappSame;
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus({ type: 'success', message: 'Registration successful!' });
        setFormData({
          studentName: '', studentAge: '', classType: '', danceStyle: '',
          danceForFitness: '', whatsappSame: true, whatsappNumber: '',
          parentName: '', phone: '', location: '', notes: '', gender: '', batchTiming: ''
        });
        setFieldErrors({});
        setTimeout(() => { setShowModal(false); setStatus({ type: '', message: '' }); }, 3000);
      } else {
        const errorMsg = data.message || 'Error submitting registration.';
        if (data.field) setFieldErrors(prev => ({ ...prev, [data.field]: errorMsg }));
        setStatus({ type: 'error', message: errorMsg });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="reg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="reg-container" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
          <button type="button" className="reg-close-btn" onClick={() => { setShowModal(false); setFieldErrors({}); }}>
            <X size={20} />
          </button>
          
          <div className="reg-header">
            <h2>STUDENT REGISTRATION</h2>
            <p>Join the KJ Dance Studio family today!</p>
          </div>
          
          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            
            {status.message && (
              <div className={`reg-status-msg ${status.type}`}>
                {status.message}
              </div>
            )}

            <div className="reg-field">
              <label>
                <User size={14} className="reg-icon" /> FULL NAME <span>*</span>
              </label>
              <input 
                name="studentName" 
                type="text" 
                value={formData.studentName} 
                onChange={handleChange} 
                placeholder="Student Name"
                className={fieldErrors.studentName ? 'error' : ''}
              />
            </div>
            
            <div className="reg-row">
              <div className="reg-field">
                <label>
                  <Phone size={14} className="reg-icon" /> PHONE NUMBER <span>*</span>
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Contact Number"
                  className={fieldErrors.phone ? 'error' : ''}
                />
              </div>
              <div className="reg-field">
                <div className="reg-label-row">
                  <label>
                    <MessageCircle size={14} className="reg-icon" /> WHATSAPP NUMBER
                  </label>
                  <label className="reg-checkbox">
                    <input 
                      type="checkbox" 
                      name="whatsappSame" 
                      checked={formData.whatsappSame} 
                      onChange={handleChange} 
                    />
                    SAME AS PHONE
                  </label>
                </div>
                <input 
                  name="whatsappNumber" 
                  type="tel" 
                  value={formData.whatsappSame ? formData.phone : formData.whatsappNumber} 
                  onChange={handleChange} 
                  disabled={formData.whatsappSame}
                  placeholder="WhatsApp Number"
                  className={fieldErrors.whatsappNumber ? 'error' : ''}
                />
              </div>
            </div>
            
            <div className="reg-row">
              <div className="reg-field">
                <label>
                  <Calendar size={14} className="reg-icon" /> AGE
                  {formData.studentAge && !isNaN(parseInt(formData.studentAge)) && (
                    <span style={{ color: '#aaa', marginLeft: '6px', fontSize: '0.75rem', fontWeight: 'normal', textTransform: 'none' }}>
                      {parseInt(formData.studentAge) <= 9 ? '— Kids' : '— Adults'}
                    </span>
                  )}
                </label>
                <input 
                  name="studentAge" 
                  type="text" 
                  value={formData.studentAge} 
                  onChange={handleChange} 
                  placeholder="Age"
                />
              </div>
              <div className="reg-field">
                <label>
                  <Users size={14} className="reg-icon" /> GENDER
                </label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="reg-field">
              <label>DANCE CLASS <span>*</span></label>
              <div className="reg-class-options">
                <div 
                  className={`reg-class-card ${formData.classType === 'Regular Class' ? 'selected' : ''}`}
                  onClick={() => { setFormData(p => ({ ...p, classType: 'Regular Class' })); setFieldErrors(p => ({...p, classType: ''})) }}
                >
                  Regular Class
                </div>
                <div 
                  className={`reg-class-card ${formData.classType === 'Fitness Class' ? 'selected' : ''}`}
                  onClick={() => { setFormData(p => ({ ...p, classType: 'Fitness Class' })); setFieldErrors(p => ({...p, classType: ''})) }}
                >
                  Fitness Class <span className="reg-class-sub">— Adults only</span>
                </div>
              </div>
              {fieldErrors.classType && <div className="reg-error-text">Please select a class type</div>}
            </div>
            
            <div className="reg-field">
              <label>CLASS TIMING <span>*</span></label>
              <div className="reg-class-options">
                <div 
                  className={`reg-class-card ${formData.batchTiming === 'Weekdays Class' ? 'selected' : ''}`}
                  onClick={() => { setFormData(p => ({ ...p, batchTiming: 'Weekdays Class' })); setFieldErrors(p => ({...p, batchTiming: ''})) }}
                >
                  Weekdays Class
                </div>
                <div 
                  className={`reg-class-card ${formData.batchTiming === 'Weekend Class' ? 'selected' : ''}`}
                  onClick={() => { setFormData(p => ({ ...p, batchTiming: 'Weekend Class' })); setFieldErrors(p => ({...p, batchTiming: ''})) }}
                >
                  Weekend Class
                </div>
              </div>
              {fieldErrors.batchTiming && <div className="reg-error-text">Please select a class timing</div>}
            </div>
            
            <div className="reg-submit-row">
              <button type="submit" className="reg-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REGISTRATION'}
              </button>
            </div>
            
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RegisterModal
