import React from 'react';

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button style={styles.confirm} onClick={onConfirm}>Yes</button>
          <button style={styles.cancel} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  modal: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    textAlign: 'center'
  },
  message: {
    fontSize: '1.1rem',
    marginBottom: '1rem'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  confirm: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    border: 'none',
    color: 'white',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  cancel: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    border: 'none',
    color: 'white',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer'
  }
};
