import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import { type Note } from '../types/index';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useDebounce } from '../hooks/useDebounce'; 

// Helper para obter o ID correto da nota
const API_TYPE = import.meta.env.VITE_API_TYPE;
const getNoteId = (note: Note): string | number => {
  if (API_TYPE === 'mongo') {
    return note._id!; 
  }
  return note.id; 
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [createErrors, setCreateErrors] = useState<{ title?: string; content?: string }>({});
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editErrors, setEditErrors] = useState<{ title?: string; content?: string }>({});

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); 

 
  const fetchNotes = useCallback(async () => {
    try {
      setLoadingNotes(true);

      // 1. Inicia um objeto de 'params' vazio
      const params: { title?: string } = {};

      // 2. SÓ adiciona o 'title' se o termo de busca NÃO for uma string vazia
      if (debouncedSearchTerm) {
        params.title = debouncedSearchTerm;
      }

      // 3. Envia a requisição.
      const response = await api.get<Note[]>('/notes', { params });
      
      setNotes(response.data);
    } catch (error) {
      let message = 'Erro ao buscar anotações.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
  showError(message);
    } finally {
      setLoadingNotes(false);
    }
  }, [debouncedSearchTerm]); // A dependência continua a mesma

  // ---------------------------------

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const validateCreate = () => {
    const errors: { title?: string; content?: string } = {};
    if (!newTitle) {
      errors.title = 'O título é obrigatório.';
    } else if (newTitle.length < 2) {
      errors.title = 'O título deve ter pelo menos 2 caracteres.';
    }
    if (!newContent) {
      errors.content = 'O conteúdo é obrigatório.';
    } else if (newContent.length < 2) {
      errors.content = 'O conteúdo deve ter pelo menos 2 caracteres.';
    }
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setLoadingCreate(true);
    try {
      await api.post<Note>('/notes', { title: newTitle, content: newContent });
      setNewTitle('');
      setNewContent('');
      setCreateErrors({});
      showSuccess('Anotação criada!');
      fetchNotes(); 
    } catch (error) {
      let message = 'Erro ao criar anotação.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      showError(message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    const idToDelete = getNoteId(noteToDelete);
    
    // Usando o toast.warn para confirmação com um promise
    toast.warn(
      <div>
        <p>Tem certeza que deseja deletar esta nota?</p>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => toast.dismiss()} 
            style={{ 
              marginRight: '10px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={async () => {
              toast.dismiss();
              try {
                await api.delete(`/notes/${idToDelete}`);
                showSuccess('Anotação deletada.');
                fetchNotes();
              } catch (error) {
                let message = 'Erro ao deletar anotação.';
                if (error instanceof AxiosError && error.response?.data?.message) {
                  message = error.response.data.message;
                }
                showError(message);
              }
            }}
            style={{ 
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Deletar
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        closeButton: false,
        theme: "light",
        style: {
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e0e0e0'
        }
      }
    );
  };

  const validateEdit = () => {
    const errors: { title?: string; content?: string } = {};
    if (!editTitle) {
      errors.title = 'O título é obrigatório.';
    } else if (editTitle.length < 2) {
      errors.title = 'O título deve ter pelo menos 2 caracteres.';
    }
    if (!editContent) {
      errors.content = 'O conteúdo é obrigatório.';
    } else if (editContent.length < 2) {
      errors.content = 'O conteúdo deve ter pelo menos 2 caracteres.';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNote) return;
    if (!validateEdit()) return;
    const idToUpdate = getNoteId(editingNote);
    try {
      await api.put<Note>(`/notes/${idToUpdate}`, {
        title: editTitle,
        content: editContent
      });
      cancelEditing();
      setEditErrors({});
      showSuccess('Anotação atualizada!');
      fetchNotes(); 
    } catch (error) {
      let message = 'Erro ao atualizar anotação.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      showError(message);
    }
  };
  
  const startEditing = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
  };
  const cancelEditing = () => {
    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  };

  return (
    <>
      {}
      {editingNote && (
        <div className="modal-overlay">
          <form onSubmit={handleUpdateNote} className="form-note form-note-modal" noValidate>
            <h3>Editando Anotação</h3>
            <label htmlFor="edit-title">Título</label>
            <input 
              id="edit-title"
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título"
              className={editErrors.title ? 'input-error' : ''}
              autoComplete="off"
            />
            {editErrors.title && <div className="error-message">{editErrors.title}</div>}

            <label htmlFor="edit-content">Conteúdo</label>
            <textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Conteúdo"
              className={editErrors.content ? 'input-error' : ''}
              autoComplete="off"
            ></textarea>
            {editErrors.content && <div className="error-message">{editErrors.content}</div>}

            <div className="form-actions">
              <button type="submit">Salvar</button>
              <button type="button" onClick={cancelEditing}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Header Fixo no Topo */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Minhas Anotações</h1>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Procurar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            <span>Olá, {user?.name || 'Usuário'}!</span>
            <button onClick={logout} className="logout-btn">Sair</button>
          </div>
        </div>
      </header>
      
      {/* Container Principal */}
      <main className="dashboard-container">
        {/* Formulário de Criação (Estilo Google Keep) */}
        <form onSubmit={handleCreateNote} className="form-note create-note-form" noValidate>
          <label htmlFor="note-title">Título</label>
          <input 
            id="note-title"
            type="text" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título"
            className={createErrors.title ? 'input-error' : ''}
            autoComplete="off"
          />
          {createErrors.title && <div className="error-message">{createErrors.title}</div>}

          <label htmlFor="note-content">Conteúdo</label>
          <textarea
            id="note-content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Criar uma anotação..."
            className={createErrors.content ? 'input-error' : ''}
            autoComplete="off"
          ></textarea>
          {createErrors.content && <div className="error-message">{createErrors.content}</div>}

          <button type="submit" disabled={loadingCreate}>
            {loadingCreate ? 'Salvando...' : 'Salvar'}
          </button>
        </form>

        {/* Lista de Anotações em Grid */}
        <div className="notes-list">
          <h2>Suas Anotações</h2>
          
          {loadingNotes ? (
            <p>Carregando anotações...</p>
          ) : (
            <div className="notes-grid">
              {notes.length === 0 ? (
                <p>{debouncedSearchTerm ? 'Nenhuma anotação encontrada.' : 'Você ainda não tem nenhuma anotação.'}</p>
              ) : (
                notes.map(note => (
                  <div key={getNoteId(note)} className="note-item">
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                    <div className="note-actions">
                      <button className="btn-edit" onClick={() => startEditing(note)} title="Editar">Editar</button>
                      <button className="btn-delete" onClick={() => handleDeleteNote(note)} title="Deletar">Deletar</button> 
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};