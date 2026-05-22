import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [decks, setDecks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [allHistory, setAllHistory] = useState([]);

  const [selectedDeckId, setSelectedDeckId] = useState("all");
  const [search, setSearch] = useState("");
  const [showUsed, setShowUsed] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCardId, setRevealedCardId] = useState(null);

  const [deckForm, setDeckForm] = useState({
    title: "",
    description: "",
  });

  const [cardForm, setCardForm] = useState({
    question: "",
    answer: "",
  });

  const [editingCardId, setEditingCardId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    setCurrentIndex(0);
    setRevealedCardId(null);
  }, [selectedDeckId, search, showUsed]);

  async function loadData() {
    try {
      const me = await api.me();
      const deckData = await api.getDecks();
      const cardData = await api.getFlashcards();
      const historyData = await api.myHistory();

      setUser(me);
      setDecks(deckData);
      setFlashcards(cardData);
      setHistory(historyData);

      if (deckData.length > 0 && !selectedDeckId) {
        setSelectedDeckId(String(deckData[0].id));
      }

      if (me.role === "admin") {
        setUsers(await api.users());
        setAllHistory(await api.allHistory());
      }
    } catch (error) {
      setMessage(error.message);
      logout();
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (authMode === "register") {
        await api.register(authForm);
        setAuthMode("login");
        setMessage("Registration successful. Please login.");
        return;
      }

      const data = await api.login(authForm.username, authForm.password);
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setDecks([]);
    setFlashcards([]);
    setHistory([]);
    setUsers([]);
    setAllHistory([]);
  }

  async function createDeck(event) {
    event.preventDefault();

    if (!deckForm.title.trim()) {
      setMessage("Deck title is required.");
      return;
    }

    try {
      const newDeck = await api.createDeck({
        title: deckForm.title.trim(),
        description: deckForm.description.trim(),
      });

      setDeckForm({ title: "", description: "" });
      setSelectedDeckId(String(newDeck.id));
      setMessage("Deck created.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteDeck() {
    if (!selectedDeckId) {
      setMessage("Please select a deck first.");
      return;
    }

    if (!confirm("Delete this deck?")) {
      return;
    }

    try {
      await api.deleteDeck(Number(selectedDeckId));
      setSelectedDeckId("");
      setMessage("Deck deleted.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveFlashcard(event) {
    event.preventDefault();

    if (!selectedDeckId) {
      setMessage("Please create or select a deck first.");
      return;
    }

    if (!cardForm.question.trim() || !cardForm.answer.trim()) {
      setMessage("Question and answer are required.");
      return;
    }

    const payload = {
      question: cardForm.question.trim(),
      answer: cardForm.answer.trim(),
      deck_id: Number(selectedDeckId),
    };

    try {
      if (editingCardId) {
        await api.updateFlashcard(editingCardId, payload);
        setMessage("Flashcard updated.");
      } else {
        await api.createFlashcard(payload);
        setMessage("Flashcard added.");
      }

      setCardForm({ question: "", answer: "" });
      setEditingCardId(null);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editFlashcard(card) {
    setSelectedDeckId(String(card.deck_id));
    setCardForm({
      question: card.question,
      answer: card.answer,
    });
    setEditingCardId(card.id);
    setMessage("Editing selected flashcard.");
  }

  async function deleteFlashcard(id) {
    if (!confirm("Delete this flashcard?")) {
      return;
    }

    try {
      await api.deleteFlashcard(id);
      setMessage("Flashcard deleted.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function markUsed(cardId) {
    try {
      await api.addHistory({
        flashcard_id: cardId,
        is_correct: true,
      });

      setMessage("Card moved to used cards.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const usedCardIds = useMemo(() => {
    return new Set(history.map((item) => item.flashcard_id));
  }, [history]);

  const visibleCards = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return flashcards.filter((card) => {
      const matchesDeck =
        selectedDeckId === "all" || card.deck_id === Number(selectedDeckId);

      const matchesSearch =
        card.question.toLowerCase().includes(keyword) ||
        card.answer.toLowerCase().includes(keyword);

      const isUsed = usedCardIds.has(card.id);

      return matchesDeck && matchesSearch && (showUsed ? isUsed : !isUsed);
    });
  }, [flashcards, selectedDeckId, search, showUsed, usedCardIds]);

  const displayCards = useMemo(() => {
    if (visibleCards.length <= 3) return visibleCards;

    const result = [];
    for (let offset = -1; offset <= 1; offset++) {
      const index = (currentIndex + offset + visibleCards.length) % visibleCards.length;
      result.push(visibleCards[index]);
    }
    return result;
  }, [visibleCards, currentIndex]);

  function previousCard() {
    if (visibleCards.length === 0) return;
    setCurrentIndex((currentIndex - 1 + visibleCards.length) % visibleCards.length);
    setRevealedCardId(null);
  }

  function nextCard() {
    if (visibleCards.length === 0) return;
    setCurrentIndex((currentIndex + 1) % visibleCards.length);
    setRevealedCardId(null);
  }

  function getDeckTitle(deckId) {
    return decks.find((deck) => deck.id === deckId)?.title || "Unknown Deck";
  }

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>
            <span>Flashcard</span> <span>Learning</span> <span>App</span>
          </h1>

          <form onSubmit={handleAuthSubmit}>
            <h2>{authMode === "login" ? "Login" : "Register"}</h2>

            <input
              placeholder="Username"
              value={authForm.username}
              onChange={(event) =>
                setAuthForm({ ...authForm, username: event.target.value })
              }
              required
            />

            {authMode === "register" && (
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                required
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
              required
            />

            <button type="submit">
              {authMode === "login" ? "Login" : "Create Account"}
            </button>

            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login"
                ? "Need an account? Register"
                : "Already have an account? Login"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <h1>
            <span>Flashcard</span> <span>Learning</span> <span>App</span>
          </h1>
          <p>
            {user?.username} · {user?.role}
          </p>
        </div>

        <div className="top-actions">
          {user?.role === "admin" && (
            <button onClick={() => setShowAdmin(!showAdmin)}>
              {showAdmin ? "Hide Admin" : "Admin Panel"}
            </button>
          )}
          <button onClick={() => setShowUsed(!showUsed)}>
            {showUsed ? "Show Study Cards" : `Show Used Cards (${usedCardIds.size})`}
          </button>
          <button className="dark-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="workspace-panel">
        <section className="panel-box create-deck-panel">
          <h2>Create New Deck</h2>
          <p className="panel-text">Create a category before adding flashcards.</p>

          <form className="deck-form" onSubmit={createDeck}>
            <input
              placeholder="New deck title"
              value={deckForm.title}
              onChange={(event) =>
                setDeckForm({ ...deckForm, title: event.target.value })
              }
            />

            <input
              placeholder="Deck description"
              value={deckForm.description}
              onChange={(event) =>
                setDeckForm({ ...deckForm, description: event.target.value })
              }
            />

            <button type="submit">Create Deck</button>
          </form>
        </section>

        <section className="panel-box manage-deck-panel">
          <h2>Manage Decks</h2>
          <p className="panel-text">Choose the deck you want to study or manage.</p>

          <div className="manage-deck-form">
            <select
              value={selectedDeckId}
              onChange={(event) => setSelectedDeckId(event.target.value)}
            >
              <option value="all">All Decks</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title}
                </option>
              ))}
            </select>

            <button type="button" className="danger-button" onClick={deleteDeck}>
              Delete Selected Deck
            </button>
          </div>
        </section>

        <section className="panel-box search-panel">
          <h2>Search Flashcards</h2>
          <p className="panel-text">Search by question or answer in real time.</p>

          <div className="search-form">
            <input
              placeholder="Live search question or answer"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button
              type="button"
              className="dark-button"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          </div>
        </section>
      </section>

      {message && <p className="message">{message}</p>}

      {showAdmin && user?.role === "admin" ? (
        <section className="admin-panel">
          <h2>Admin Panel</h2>

          <div className="admin-grid">
            <div>
              <h3>Users</h3>
              {users.map((item) => (
                <div className="admin-row" key={item.id}>
                  <span>{item.username}</span>
                  <span>{item.role}</span>
                </div>
              ))}
            </div>

            <div>
              <h3>All Learning History</h3>
              {allHistory.map((item) => (
                <div className="admin-row" key={item.id}>
                  <span>User #{item.user_id}</span>
                  <span>Card #{item.flashcard_id}</span>
                  <span>{item.is_correct ? "Used" : "Wrong"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="study-area">
          <div className="section-title-row">
            <h2>{showUsed ? "Used Cards" : "Study Cards"}</h2>
            <span>{visibleCards.length} card(s)</span>
          </div>

          {visibleCards.length === 0 ? (
            <p className="empty-message">
              {showUsed ? "No used cards yet." : "No active flashcards available."}
            </p>
          ) : (
            <div className="carousel">
              <button className="arrow-button" onClick={previousCard}>
                ‹
              </button>

              <div className="card-track">
                {displayCards.map((card, index) => {
                  const isActive =
                    visibleCards.length <= 3
                      ? index === Math.min(currentIndex, visibleCards.length - 1)
                      : index === 1;

                  return (
                    <article
                      key={card.id}
                      className={`flashcard ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setRevealedCardId(
                          revealedCardId === card.id ? null : card.id
                        )
                      }
                    >
                      <p className="deck-label">{getDeckTitle(card.deck_id)}</p>
                      <h3>{card.question}</h3>

                      {revealedCardId === card.id ? (
                        <p className="answer">{card.answer}</p>
                      ) : (
                        <p className="hint">Click card to reveal answer</p>
                      )}

                      <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => editFlashcard(card)}>Edit</button>
                        <button onClick={() => deleteFlashcard(card.id)}>Delete</button>
                        {!usedCardIds.has(card.id) && (
                          <button onClick={() => markUsed(card.id)}>Used</button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <button className="arrow-button" onClick={nextCard}>
                ›
              </button>
            </div>
          )}
        </section>
      )}

      <form className="bottom-form" onSubmit={saveFlashcard}>
        <input
          placeholder="Enter question"
          value={cardForm.question}
          onChange={(event) =>
            setCardForm({ ...cardForm, question: event.target.value })
          }
        />

        <textarea
          placeholder="Enter answer"
          value={cardForm.answer}
          onChange={(event) =>
            setCardForm({ ...cardForm, answer: event.target.value })
          }
        />

        <button type="submit">
          {editingCardId ? "Update Flashcard" : "Add Flashcard"}
        </button>

        {editingCardId && (
          <button
            type="button"
            className="dark-button"
            onClick={() => {
              setEditingCardId(null);
              setCardForm({ question: "", answer: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>
    </main>
  );
}

export default App;
