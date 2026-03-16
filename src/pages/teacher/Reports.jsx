import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { SUBJECTS, getGradeFromScore } from '../../utils/constants';

export default function TeacherReports() {
  const [learners, setLearners] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    learnerId: '',
    term: 'Term 1 – 2024',
    grade: 'Grade 7',
    subjects: SUBJECTS.map(name => ({ name, score: 0 })),
    comment: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [learnersRes, reportsRes] = await Promise.all([
        api.get('/learners'),
        api.get('/reports')
      ]);
      setLearners(learnersRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!formData.learnerId) {
      toast.error('Please select a learner');
      return;
    }

    try {
      const response = await api.post('/reports', formData);
      setReports([...reports, response.data]);
      setShowReportModal(false);
      resetForm();
      toast.success('Report card saved!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save report');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;

    try {
      await api.delete(`/reports/${id}`);
      setReports(reports.filter(r => r.id !== id));
      toast.success('Report deleted');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const viewReport = async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      setSelectedReport(response.data);
    } catch (error) {
      toast.error('Failed to load report');
    }
  };

  const resetForm = () => {
    setFormData({
      learnerId: '',
      term: 'Term 1 – 2024',
      grade: 'Grade 7',
      subjects: SUBJECTS.map(name => ({ name, score: 0 })),
      comment: ''
    });
  };

  const updateSubjectScore = (index, score) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index].score = Math.min(100, Math.max(0, parseInt(score) || 0));
    setFormData({ ...formData, subjects: newSubjects });
  };

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="page-header">
          <h1 className="page-title">Report Cards</h1>
          <p className="page-subtitle">Create and manage academic reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate Report Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Generate Report Card</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Select Learner</label>
                <select
                  value={formData.learnerId}
                  onChange={(e) => {
                    const learner = learners.find(l => l.id === parseInt(e.target.value));
                    setFormData({
                      ...formData,
                      learnerId: e.target.value,
                      grade: learner?.grade || 'Grade 7'
                    });
                  }}
                  className="form-select"
                >
                  <option value="">Select a learner</option>
                  {learners.map(learner => (
                    <option key={learner.id} value={learner.id}>
                      {learner.name} ({learner.reg_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                    className="form-select"
                  >
                    <option>Term 1 – 2024</option>
                    <option>Term 2 – 2024</option>
                    <option>Term 3 – 2024</option>
                    <option>Term 1 – 2025</option>
                    <option>Term 2 – 2025</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Grade/Class</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="form-select"
                  >
                    <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option>
                    <option>Grade 4</option><option>Grade 5</option><option>Grade 6</option>
                    <option>Grade 7</option><option>Grade 8</option><option>Grade 9</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject Scores (0–100)</label>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {formData.subjects.map((subject, index) => (
                    <div key={subject.name} className="flex items-center gap-3">
                      <label className="w-32 text-sm font-medium text-ink">
                        {subject.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={subject.score || ''}
                        onChange={(e) => updateSubjectScore(index, e.target.value)}
                        className="form-input flex-1"
                        placeholder="Score"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teacher's Comment</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
 className="form-textarea"
                  placeholder="Write a brief comment about the learner's performance..."
                  rows="4"
                />
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-gold w-full mt-4"
              >
                💾 Preview & Save Report Card
              </button>
            </div>
          </div>

          {/* Saved Reports */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Saved Reports</h2>
            </div>
            <div className="card-body p-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Term</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report) => {
                      const learner = learners.find(l => l.id === report.learner_id);
                      return (
                        <tr key={report.id}>
                          <td className="font-medium">{learner?.name || 'Unknown'}</td>
                          <td>
                            <span className="badge badge-teal">{report.term}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => viewReport(report.id)}
                              className="btn btn-sm btn-outline mr-2"
                            >
                              👁 View
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="btn btn-sm btn-danger"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-12 text-muted">
                        No reports yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Preview Report Modal */}
        <Modal 
          isOpen={showReportModal} 
          onClose={() => setShowReportModal(false)}
          title="Preview Report Card"
          size="lg"
        >
          {formData.learnerId && (
            <div className="report-card">
              <div className="report-header">
                <div>
                  <div className="report-school-name">EduPortal Academy</div>
                  <div className="report-term">{formData.term} · {formData.grade}</div>
                </div>
                <div className="report-student-info">
                  <div className="report-student-name">
                    {learners.find(l => l.id === parseInt(formData.learnerId))?.name}
                  </div>
                  <div className="report-reg">
                    {learners.find(l => l.id === parseInt(formData.learnerId))?.reg_number}
                  </div>
                </div>
              </div>

              <div className="report-body">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted">
                    Academic Performance
                  </div>
                  <div className="font-mono text-sm">
                    Average: <strong className="text-ink">
                      {Math.round(formData.subjects.reduce((sum, s) => sum + s.score, 0) / formData.subjects.length)}%
                    </strong>
                  </div>
                </div>

                {formData.subjects.map((subject) => {
                  const grade = getGradeFromScore(subject.score);
                  return (
                    <div key={subject.name} className="grade-row">
                      <div className="grade-subject">{subject.name}</div>
                      <div className="grade-bar">
                        <div 
                          className="grade-bar-fill" 
                          style={{ 
                            width: `${subject.score}%`,
                            backgroundColor: grade.color 
                          }}
                        />
                      </div>
                      <div className="grade-score" style={{ color: grade.color }}>
                        {subject.score}
                      </div>
                      <div className="grade-letter" style={{ color: grade.color }}>
                        {grade.letter}
                      </div>
                    </div>
                  );
                })}

                {formData.comment && (
                  <div className="comment-box">
                    <div className="comment-label">Teacher's Comment</div>
                    {formData.comment}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button 
              onClick={() => setShowReportModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveReport}
              className="btn btn-gold"
            >
              Save Report Card
            </button>
          </div>
        </Modal>

        {/* View Report Modal */}
        <Modal 
          isOpen={!!selectedReport} 
          onClose={() => setSelectedReport(null)}
          title="Report Card"
          size="lg"
        >
          {selectedReport && (
            <div className="report-card">
              <div className="report-header">
                <div>
                  <div className="report-school-name">EduPortal Academy</div>
                  <div className="report-term">{selectedReport.term} · {selectedReport.grade}</div>
                </div>
                <div className="report-student-info">
                  <div className="report-student-name">
                    {selectedReport.learners?.name}
                  </div>
                  <div className="report-reg">
                    {selectedReport.learners?.reg_number}
                  </div>
                </div>
              </div>

              <div className="report-body">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted">
                    Academic Performance
                  </div>
                  <div className="font-mono text-sm">
                    Average: <strong className="text-ink">
                      {Math.round(selectedReport.subjects.reduce((sum, s) => sum + s.score, 0) / selectedReport.subjects.length)}%
                    </strong>
                  </div>
                </div>

                {selectedReport.subjects.map((subject) => {
                  const grade = getGradeFromScore(subject.score);
                  return (
                    <div key={subject.name} className="grade-row">
                      <div className="grade-subject">{subject.name}</div>
                      <div className="grade-bar">
                        <div 
                          className="grade-bar-fill" 
                          style={{ 
                            width: `${subject.score}%`,
                            backgroundColor: grade.color 
                          }}
                        />
                      </div>
                      <div className="grade-score" style={{ color: grade.color }}>
                        {subject.score}
                      </div>
                      <div className="grade-letter" style={{ color: grade.color }}>
                        {grade.letter}
                      </div>
                    </div>
                  );
                })}

                {selectedReport.comment && (
                  <div className="comment-box">
                    <div className="comment-label">Teacher's Comment</div>
                    {selectedReport.comment}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button 
              onClick={() => setSelectedReport(null)}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}