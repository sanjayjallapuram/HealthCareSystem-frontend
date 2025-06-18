import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoCallTest = () => {
    const [roomId, setRoomId] = useState('');
    const [role, setRole] = useState('doctor');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const joinCall = (e) => {
        e.preventDefault();
        if (!roomId.trim()) {
            alert('Please enter a room ID');
            return;
        }
        if (!userName.trim()) {
            alert('Please enter your name');
            return;
        }
        // Generate a random user ID for testing
        const userId = Math.random().toString(36).substring(7);
        navigate(`/video-call/${roomId}?role=${role}&userId=${userId}&userName=${encodeURIComponent(userName)}`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Video Call Test</h2>
            <div style={{ marginBottom: '20px' }}>
                <p>Instructions:</p>
                <ol>
                    <li>Enter your name and the same room ID in two different browser windows</li>
                    <li>Select different roles (doctor/patient) for each window</li>
                    <li>Click "Join Call" in both windows</li>
                    <li>Accept camera/microphone permissions when prompted</li>
                </ol>
            </div>
            <form onSubmit={joinCall} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label htmlFor="userName">Your Name: </label>
                    <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="roomId">Room ID: </label>
                    <input
                        type="text"
                        id="roomId"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="role">Role: </label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                    >
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                    </select>
                </div>
                <button 
                    type="submit"
                    style={{
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    Join Call
                </button>
            </form>
        </div>
    );
};

export default VideoCallTest; 