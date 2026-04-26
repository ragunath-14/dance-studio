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
          <label>Gender</label>
          <select 
            value={formData.gender || ''} 
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Blood Group</label>
          <input 
            type="text" 
            value={formData.bloodGroup || ''} 
            onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} 
            placeholder="e.g. O+"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Student's Age</label>
          <input 
            type="text" 
            value={formData.studentAge || ''} 
            onChange={(e) => setFormData({...formData, studentAge: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>Parent/Guardian Name</label>
          <input 
            type="text" 
            value={formData.parentName || ''} 
            onChange={(e) => setFormData({...formData, parentName: e.target.value})} 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input 
            type="text" 
            value={formData.emergencyContactName || ''} 
            onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>Emergency Contact Phone</label>
          <input 
            type="text" 
            value={formData.emergencyContactPhone || ''} 
            onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Location (Area)</label>
          <input 
            type="text" 
            value={formData.location || ''} 
            onChange={(e) => setFormData({...formData, location: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>Full Address</label>
          <textarea 
            value={formData.address || ''} 
            onChange={(e) => setFormData({...formData, address: e.target.value})} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', minHeight: '38px' }}
          />
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
      <div className="form-group full-width" style={{ marginTop: '15px' }}>
        <label>Additional Notes</label>
        <textarea 
          value={formData.notes || ''} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          placeholder="Any special requirements or medical info..."
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', minHeight: '60px' }}
        />
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEditing ? 'Update Student' : 'Save Student'}</Button>
      </div>
    </form>

  );
};

export default StudentForm;
