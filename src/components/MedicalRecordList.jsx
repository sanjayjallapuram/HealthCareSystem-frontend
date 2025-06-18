import React from 'react';

const MedicalRecordList = ({ records }) => {
    return (
        <div>
            {records.map(record => (
                <div key={record._id} className="medical-record-item">
                    <h3>Medical Record</h3>
                    <p>Patient ID: {record.patientId}</p>
                    <p>Doctor ID: {record.doctorId}</p>
                    <p>Diagnosis: {record.diagnosis}</p>
                    <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
};

export default MedicalRecordList; 