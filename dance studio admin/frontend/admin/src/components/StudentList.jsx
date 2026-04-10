import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
import API_URL from '../config';
import { useData } from '../context/DataContext';
import StudentRow from './students/StudentRow';
import StudentForm from './students/StudentForm';
import Modal from './ui/Modal';
import Button from './ui/Button';
import SkeletonRow from './ui/SkeletonRow';
import Pagination from './ui/Pagination';
import './List.css';

const StudentList = () => {
  const { students, payments, loading, refreshData, setStudents } = useData();
  const [activeTab, setActiveTab] = useState('Regular Class');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    danceStyle: '',
    danceForFitness: '',
    classType: 'Regular Class',
    createdAt: new Date().toISOString().split('T')[0]
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredStudents = useMemo(() => {
    // Reset to page 1 when tab or search changes
    return students.filter(student => 
      student.classType === activeTab &&
      ((student.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (student.danceStyle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (student.danceForFitness || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm, activeTab]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Effect to reset page when filtering changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const stats = useMemo(() => {
    return {
      regular: students.filter(s => s.classType === 'Regular Class').length,
      summer: students.filter(s => s.classType === 'Summer Class').length
    };
  }, [students]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save current editing state to use in catch block if needed
    const wasEditing = editingStudent;
    
    // Background Persistence
    try {
      if (wasEditing) {
        await axios.put(`${API_URL}/students/${wasEditing._id}`, formData);
      } else {
        await axios.post(`${API_URL}/register`, formData);
      }
      // Refresh data from backend after success
      await refreshData();
      
      // Close modal only on success
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ 
        studentName: '', email: '', phone: '', whatsappNumber: '', 
        danceStyle: '', danceForFitness: '', classType: 'Regular Class', 
        createdAt: new Date().toISOString().split('T')[0] 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save to database. Please refresh and try again.';
      alert(errorMsg);
      console.error('Persistence error:', err);
    }
  };


  const handleSwitch = async (student) => {
    const newClassType = student.classType === 'Regular Class' ? 'Summer Class' : 'Regular Class';
    
    try {
      await axios.put(`${API_URL}/students/${student._id}`, { ...student, classType: newClassType });
      await refreshData();
      setActiveTab(newClassType);
    } catch (err) {
      alert('Failed to switch class type.');
      console.error('Class switch error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await axios.delete(`${API_URL}/students/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student.');
    }
  };


  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      studentName: student.studentName || student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      whatsappNumber: student.whatsappNumber || '',
      danceStyle: student.danceStyle || '',
      danceForFitness: student.danceForFitness || '',
      classType: student.classType || 'Regular Class',
      createdAt: student.createdAt || student.joinDate || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({ 
      studentName: '', email: '', phone: '', whatsappNumber: '', 
      danceStyle: '', danceForFitness: '', classType: 'Regular Class', 
      createdAt: new Date().toISOString().split('T')[0] 
    });
  };


  return (
    <div className="student-list animate-fade-in">
      <div className="list-header">
        <div className="header-left-group">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab.split(' ')[0]} students...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'Regular Class' ? 'active' : ''}`}
              onClick={() => setActiveTab('Regular Class')}
            >
              Regular ({stats.regular})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Summer Class' ? 'active' : ''}`}
              onClick={() => setActiveTab('Summer Class')}
            >
              Summer ({stats.summer})
            </button>
          </div>
        </div>
        <Button onClick={() => { 
          setFormData(prev => ({ ...prev, classType: activeTab }));
          setShowModal(true); 
          setEditingStudent(null); 
        }} icon={Plus}>
          Add Student
        </Button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Details</th>
              <th>Dance Style</th>
              <th>{activeTab === 'Regular Class' ? 'Join Date' : 'Batch Info'}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && students.length === 0 ? (
              <>
                <SkeletonRow columns={5} />
                <SkeletonRow columns={5} />
                <SkeletonRow columns={5} />
              </>
            ) : paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <StudentRow 
                  key={student._id} 
                  student={student} 
                  payments={payments}
                  onEdit={openEditModal} 
                  onDelete={handleDelete} 
                  onSwitch={handleSwitch}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  {loading ? 'Refreshing...' : `No students found in ${activeTab}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      <Modal 
        isOpen={showModal} 
        onClose={closeModals} 
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm 
          formData={formData} 
          setFormData={setFormData} 
          onSubmit={handleSubmit} 
          onCancel={closeModals}
          isEditing={!!editingStudent}
        />
      </Modal>
    </div>
  );
};


export default StudentList;
