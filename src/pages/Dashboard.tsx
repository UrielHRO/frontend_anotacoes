import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { type Note } from '../types/index';
import { AxiosError } from 'axios';
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
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); 

  // --- 🔰 FUNÇÃO ATUALIZADA 🔰 ---
  // Esta função agora é mais inteligente e só envia o filtro 'title'
  // se o termo de busca (debouncedSearchTerm) não estiver vazio.
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
      // Se a busca estiver vazia, 'params' será {} e nenhuma query param será enviada.
      // Se a busca tiver texto, 'params' será { title: "..." } e a API vai filtrar.
      const response = await api.get<Note[]>('/notes', { params });
      
      setNotes(response.data);
    } catch (error) {
      let message = 'Erro ao buscar anotações.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setLoadingNotes(false);
    }
  }, [debouncedSearchTerm]); // A dependência continua a mesma

  // ---------------------------------

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingCreate(true);
    try {
      await api.post<Note>('/notes', { title: newTitle, content: newContent });
      setNewTitle('');
      setNewContent('');
      toast.success('Anotação criada!');
      fetchNotes(); 
    } catch (error) {
      let message = 'Erro ao criar anotação.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    const idToDelete = getNoteId(noteToDelete);
    if (!window.confirm('Tem certeza que deseja deletar esta nota?')) return;
    
    try {
      await api.delete(`/notes/${idToDelete}`);
      toast.success('Anotação deletada.');
      fetchNotes(); 
    } catch (error) {
      let message = 'Erro ao deletar anotação.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNote) return;
    
    const idToUpdate = getNoteId(editingNote);
    
    try {
      await api.put<Note>(`/notes/${idToUpdate}`, {
        title: editTitle,
        content: editContent
      });
      cancelEditing();
      toast.success('Anotação atualizada!');
      fetchNotes(); 
    } catch (error) {
      let message = 'Erro ao atualizar anotação.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
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
      {/* Modal de Edição (ficará por cima de tudo) */}
      {editingNote && (
        <div className="modal-overlay">
          <form onSubmit={handleUpdateNote} className="form-note form-note-modal">
            <h3>Editando Anotação</h3>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título"
              required
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Conteúdo"
              required
            ></textarea>
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
        <form onSubmit={handleCreateNote} className="form-note create-note-form">
          <input 
            type="text" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título"
            required
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Criar uma anotação..."
            required
          ></textarea>
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
                      <button onClick={() => startEditing(note)} title="Editar">Editar</button>
                      <button onClick={() => handleDeleteNote(note)} title="Deletar">Deletar</button> 
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