import React from 'react';
import Button from '../ui/Button';

const StudentForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Student's Name</label>
          <input 
            type="text" 
            value={formData.studentName} 
            onChange={(e) => setFormData({...formData, studentName: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            value={formData.createdAt ? formData.createdAt.split('T')[0] : ''} 
            onChange={(e) => setFormData({...formData, createdAt: e.target.value})} 
            required 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="text" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label>WhatsApp Number</label>
          <input 
            type="text" 
            value={formData.whatsappNumber || ''} 
            onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={formData.email || ''} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>Class Type</label>
          <select 
            value={formData.classType} 
            onChange={(e) => setFormData({...formData, classType: e.target.value})}
          >
            <option value="Regular Class">Regular Class</option>
            <option value="Summer Class">Summer Class</option>
            <option value="Fitness Class">Fitness Class</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Dance Style (Regular/Summer)</label>
          <select 
            value={formData.danceStyle || ''} 
            onChange={(e) => setFormData({...formData, danceStyle: e.target.value})}
          >
            <option value="">None</option>
            <option value="Bollywood">Bollywood</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Contemporary">Contemporary</option>
            <option value="K-Pop">K-Pop</option>
            <option value="Kathak">Kathak</option>
          </select>
        </div>
        <div className="form-group">
          <label>Dance for Fitness</label>
          <select 
            value={formData.danceForFitness || ''} 
            onChange={(e) => setFormData({...formData, danceForFitness: e.target.value})}
          >
            <option value="">None</option>
            <option value="Zumba">Zumba</option>
            <option value="Aerobics">Aerobics</option>
            <option value="Yoga">Yoga</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEditing ? 'Update Student' : 'Save Student'}</Button>
      </div>
    </form>

  );
};

export default StudentForm;
