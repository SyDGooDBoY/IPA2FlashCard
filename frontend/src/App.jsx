import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./styles.css";

const emptyAuthForm = { username: "", email: "", password: "" };
const emptyDeckForm = { title: "", description: "" };
const emptyDeckEditForm = { title: "", description: "" };
const emptyCardForm = { question: "", answer: "" };
const emptyPasswordForm = { current_password: "", new_password: "" };

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("user");
  const [authForm, setAuthForm] = useState(emptyAuthForm);

  const [decks, setDecks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyDetails, setHistoryDetails] = useState([]);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [allHistoryDetails, setAllHistoryDetails] = useState([]);

  const [selectedDeckId, setSelectedDeckId] = useState("all");
  const [search, setSearch] = useState("");
  const [showUsed, setShowUsed] = useState(false);
  const [activeView, setActiveView] = useState("study");
  const [deckEditorMode, setDeckEditorMode] = useState("create");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCardId, setRevealedCardId] = useState(null);

  const [deckForm, setDeckForm] = useState(emptyDeckForm);
  const [deckEditForm, setDeckEditForm] = useState(emptyDeckEditForm);
  const [cardForm, setCardForm] = useState(emptyCardForm);
  const [profileForm, setProfileForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [editingCardId, setEditingCardId] = useState(null);
  const [message, setMessage] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setDecks([]);
    setFlashcards([]);
    setHistory([]);
    setHistoryDetails([]);
    setSummary(null);
    setUsers([]);
    setAllHistoryDetails([]);
    setActiveView("study");
    setAuthMode("login");
    setAuthRole("user");
    setAuthForm(emptyAuthForm);
    setMessage("");
  }, []);

  const loadCards = useCallback(async () => {
    if (!token) return;

    const cardData = await api.getFlashcards({
      deckId: selectedDeckId,
      search,
    });

    setFlashcards(cardData);
  }, [search, selectedDeckId, token]);

  const loadData = useCallback(async (filters = {}) => {
    if (!token) return;

    try {
      const [me, deckData, historyData, detailData, summaryData] =
        await Promise.all([
          api.me(),
          api.getDecks(),
          api.myHistory(),
          api.myHistoryDetails(),
          api.summary(),
        ]);

      setUser(me);
      setProfileForm({ email: me.email });
      setDecks(deckData);
      setHistory(historyData);
      setHistoryDetails(detailData);
      setSummary(summaryData);

      if (me.role === "admin") {
        const [userData, adminHistory] = await Promise.all([
          api.users(),
          api.allHistoryDetails(),
        ]);
        setUsers(userData);
        setAllHistoryDetails(adminHistory);
      }

      const nextDeckId = filters.deckId ?? selectedDeckId;
      const nextSearch = filters.search ?? search;
      const cardData = await api.getFlashcards({
        deckId: nextDeckId,
        search: nextSearch,
      });
      setFlashcards(cardData);
    } catch (error) {
      setMessage(error.message);
      logout();
    }
  }, [logout, search, selectedDeckId, token]);

  useEffect(() => {
    window.queueMicrotask(() => {
      loadData();
    });
  }, [loadData]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) return;

    const timeoutId = window.setTimeout(() => {
      loadCards().catch((error) => setMessage(error.message));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadCards, token]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (authMode === "register") {
        await api.register(authForm);
        setAuthMode("login");
        setAuthRole("user");
        setAuthForm({ ...emptyAuthForm, username: authForm.username });
        setMessage("Registration successful. Please login.");
        return;
      }

      const data =
        authRole === "admin"
          ? await api.adminLogin(authForm.username, authForm.password)
          : await api.login(authForm.username, authForm.password);

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function refreshAfterChange(successMessage) {
    setMessage(successMessage);
    await loadData();
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

      setDeckForm(emptyDeckForm);
      setSelectedDeckId(String(newDeck.id));
      setDeckEditorMode("edit");
      setDeckEditForm({
        title: newDeck.title,
        description: newDeck.description || "",
      });
      setMessage("Deck created.");
      await loadData({ deckId: String(newDeck.id) });
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveDeck(event) {
    event.preventDefault();

    if (selectedDeckId === "all") {
      setMessage("Select a specific deck before updating.");
      return;
    }

    if (!deckEditForm.title.trim()) {
      setMessage("Deck title is required.");
      return;
    }

    try {
      const updatedDeck = await api.updateDeck(Number(selectedDeckId), {
        title: deckEditForm.title.trim(),
        description: deckEditForm.description.trim(),
      });

      setDeckEditForm({
        title: updatedDeck.title,
        description: updatedDeck.description || "",
      });
      await refreshAfterChange("Deck updated.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteDeck() {
    if (selectedDeckId === "all") {
      setMessage("Select a specific deck before deleting.");
      return;
    }

    if (!window.confirm("Delete this deck and its flashcards?")) return;

    try {
      await api.deleteDeck(Number(selectedDeckId));
      setSelectedDeckId("all");
      setDeckEditorMode("create");
      setDeckEditForm(emptyDeckEditForm);
      setMessage("Deck deleted.");
      await loadData({ deckId: "all" });
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveFlashcard(event) {
    event.preventDefault();

    if (selectedDeckId === "all") {
      setMessage("Choose a deck before adding or updating a flashcard.");
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
        await refreshAfterChange("Flashcard updated.");
      } else {
        await api.createFlashcard(payload);
        await refreshAfterChange("Flashcard added.");
      }

      setCardForm(emptyCardForm);
      setEditingCardId(null);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editFlashcard(card) {
    selectDeckId(String(card.deck_id));
    setCardForm({ question: card.question, answer: card.answer });
    setEditingCardId(card.id);
    setMessage("Editing selected flashcard.");
  }

  async function deleteFlashcard(id) {
    if (!window.confirm("Delete this flashcard?")) return;

    try {
      await api.deleteFlashcard(id);
      await refreshAfterChange("Flashcard deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function markUsed(cardId, isCorrect = true) {
    try {
      await api.addHistory({ flashcard_id: cardId, is_correct: isCorrect });
      await refreshAfterChange(isCorrect ? "Marked as correct." : "Marked as missed.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    try {
      const updated = await api.updateMe({ email: profileForm.email });
      setUser(updated);
      setProfileForm({ email: updated.email });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    try {
      await api.updatePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      setMessage("Password updated.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeHistory(id) {
    if (!window.confirm("Delete this history record?")) return;

    try {
      await api.deleteHistory(id);
      await refreshAfterChange("History record deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const usedCardIds = useMemo(() => {
    return new Set(history.map((item) => item.flashcard_id));
  }, [history]);

  const visibleCards = useMemo(() => {
    return flashcards.filter((card) => {
      const isUsed = usedCardIds.has(card.id);
      return showUsed ? isUsed : !isUsed;
    });
  }, [flashcards, showUsed, usedCardIds]);

  const selectedDeck = useMemo(() => {
    if (selectedDeckId === "all") return null;
    return decks.find((deck) => deck.id === Number(selectedDeckId)) || null;
  }, [decks, selectedDeckId]);

  const progressPercent = summary?.total_cards
    ? Math.round((summary.studied_cards / summary.total_cards) * 100)
    : 0;

  const reviewCount = historyDetails.filter((item) => !item.is_correct).length;

  const displayCards = useMemo(() => {
    if (visibleCards.length <= 3) return visibleCards;

    return [-1, 0, 1].map((offset) => {
      const index = (currentIndex + offset + visibleCards.length) % visibleCards.length;
      return visibleCards[index];
    });
  }, [currentIndex, visibleCards]);

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

  function selectDeckId(deckId) {
    setSelectedDeckId(deckId);
    setCurrentIndex(0);
    setRevealedCardId(null);

    if (deckId === "all") {
      setDeckEditorMode("create");
      setDeckEditForm(emptyDeckEditForm);
      return;
    }

    setDeckEditorMode("edit");
    const deck = decks.find((item) => item.id === Number(deckId));
    setDeckEditForm({
      title: deck?.title || "",
      description: deck?.description || "",
    });
  }

  function startNewDeck() {
    setDeckEditorMode("create");
    setSelectedDeckId("all");
    setDeckForm(emptyDeckForm);
    setDeckEditForm(emptyDeckEditForm);
    setCurrentIndex(0);
    setRevealedCardId(null);
  }

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Flashcard Learning App</h1>

          <form onSubmit={handleAuthSubmit}>
            <h2>
              {authMode === "register"
                ? "Register"
                : authRole === "admin"
                  ? "Admin Login"
                  : "User Login"}
            </h2>

            {authMode === "login" && (
              <div className="auth-switch">
                <button
                  type="button"
                  className={authRole === "user" ? "active" : ""}
                  onClick={() => setAuthRole("user")}
                >
                  User
                </button>
                <button
                  type="button"
                  className={authRole === "admin" ? "active" : ""}
                  onClick={() => setAuthRole("admin")}
                >
                  Admin
                </button>
              </div>
            )}

            <label>
              Username
              <input
                value={authForm.username}
                onChange={(event) =>
                  setAuthForm({ ...authForm, username: event.target.value })
                }
                required
              />
            </label>

            {authMode === "register" && (
              <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, email: event.target.value })
                  }
                  required
                />
              </label>
            )}

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                required
              />
            </label>

            <button type="submit">
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                const nextMode = authMode === "login" ? "register" : "login";
                setAuthMode(nextMode);
                setAuthRole("user");
                setMessage("");
              }}
            >
              {authMode === "login" ? "Register a user account" : "Back to login"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle dark mode"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>Flashcards</h1>
          <p>{user?.username} - {user?.role}</p>
        </div>

        {summary && (
          <div className="learning-progress">
            <div className="progress-copy">
              <span>Course progress</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-track">
              <div style={{ width: `${progressPercent}%` }} />
            </div>
            <p>{summary.studied_cards} of {summary.total_cards} cards studied</p>
          </div>
        )}

        <nav>
          <button
            className={activeView === "study" ? "active" : ""}
            onClick={() => setActiveView("study")}
          >
            Study
          </button>
          <button
            className={activeView === "history" ? "active" : ""}
            onClick={() => setActiveView("history")}
          >
            History
          </button>
          <button
            className={activeView === "profile" ? "active" : ""}
            onClick={() => setActiveView("profile")}
          >
            Profile
          </button>
          {user?.role === "admin" && (
            <button
              className={activeView === "admin" ? "active" : ""}
              onClick={() => setActiveView("admin")}
            >
              Admin
            </button>
          )}
        </nav>

        <button className="secondary-button" onClick={logout}>Logout</button>
      </aside>

      <section className="content">
        <header className="content-header">
          <div>
            <h2>
              {activeView === "study" && "Study Workspace"}
              {activeView === "history" && "Learning History"}
              {activeView === "profile" && "User Profile"}
              {activeView === "admin" && "Admin Panel"}
            </h2>
            <p>Manage decks, search cards, and track learning progress.</p>
          </div>

          {summary && (
            <div className="summary-row">
              <span>{summary.total_cards} cards</span>
              <span>{summary.studied_cards} studied</span>
              <span>{reviewCount} to review</span>
              <span>{summary.accuracy}% accuracy</span>
            </div>
          )}
        </header>

        {message && <p className="message">{message}</p>}

        {activeView === "study" && (
          <>
            <section className="learning-board">
              <div className="practice-column">
                <section className="study-area">
                  <div className="section-title-row">
                    <div>
                      <h3>{showUsed ? "Used Cards" : "Study Cards"}</h3>
                      <p>
                        {selectedDeck ? selectedDeck.title : "All decks"} - {visibleCards.length} card(s)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setShowUsed(!showUsed);
                        setCurrentIndex(0);
                        setRevealedCardId(null);
                      }}
                    >
                      {showUsed ? "Study cards" : `Used cards (${usedCardIds.size})`}
                    </button>
                  </div>

                  {visibleCards.length === 0 ? (
                    <p className="empty-message">
                      {showUsed ? "No used cards match this filter." : "No active cards match this filter."}
                    </p>
                  ) : (
                    <div className="carousel">
                      <button className="arrow-button" onClick={previousCard} aria-label="Previous card">
                        &lt;
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
                                setRevealedCardId(revealedCardId === card.id ? null : card.id)
                              }
                            >
                              <p className="deck-label">{getDeckTitle(card.deck_id)}</p>
                              <h4>{card.question}</h4>
                              {revealedCardId === card.id ? (
                                <p className="answer">{card.answer}</p>
                              ) : (
                                <p className="hint">Click to reveal answer</p>
                              )}

                              <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                                {!usedCardIds.has(card.id) && (
                                  <div className="learning-actions">
                                    <button className="got-it-button" onClick={() => markUsed(card.id, true)}>
                                      {"\u2713 Got it"}
                                    </button>
                                    <button className="missed-button" onClick={() => markUsed(card.id, false)}>
                                      {"\u2715 Missed"}
                                    </button>
                                  </div>
                                )}
                                <div className="management-actions">
                                  <button onClick={() => editFlashcard(card)}>Edit</button>
                                  <button onClick={() => deleteFlashcard(card.id)}>Delete</button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      <button className="arrow-button" onClick={nextCard} aria-label="Next card">
                        &gt;
                      </button>
                    </div>
                  )}
                </section>
              </div>

              <aside className="study-sidebar">
                <section className="session-card">
                  <h3>Study Controls</h3>
                  <p>{selectedDeck ? selectedDeck.description || selectedDeck.title : "Review all available decks."}</p>
                  <label>
                    Search cards
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setCurrentIndex(0);
                        setRevealedCardId(null);
                      }}
                      placeholder="Question or answer"
                    />
                  </label>
                  <label>
                    Active deck
                    <select
                      value={selectedDeckId}
                      onChange={(event) => selectDeckId(event.target.value)}
                    >
                      <option value="all">All Decks</option>
                      {decks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>

                <form className="flashcard-editor-card" onSubmit={saveFlashcard}>
                  <h3>{editingCardId ? "Edit Flashcard" : "New Flashcard"}</h3>
                  <label>
                    Question
                    <input
                      value={cardForm.question}
                      onChange={(event) =>
                        setCardForm({ ...cardForm, question: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Answer
                    <textarea
                      value={cardForm.answer}
                      onChange={(event) =>
                        setCardForm({ ...cardForm, answer: event.target.value })
                      }
                    />
                  </label>
                  <button type="submit">
                    {editingCardId ? "Update Flashcard" : "Add Flashcard"}
                  </button>
                  {editingCardId && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setEditingCardId(null);
                        setCardForm(emptyCardForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </form>

                <form
                  className="deck-manager-card"
                  onSubmit={deckEditorMode === "edit" ? saveDeck : createDeck}
                >
                  <div className="tool-header">
                    <h3>{deckEditorMode === "edit" ? "Deck Settings" : "New Deck"}</h3>
                    {deckEditorMode === "edit" && (
                      <button type="button" className="secondary-button" onClick={startNewDeck}>
                        New
                      </button>
                    )}
                  </div>
                  <label>
                    Deck title
                    <input
                      value={deckEditorMode === "edit" ? deckEditForm.title : deckForm.title}
                      onChange={(event) =>
                        deckEditorMode === "edit"
                          ? setDeckEditForm({
                              ...deckEditForm,
                              title: event.target.value,
                            })
                          : setDeckForm({
                              ...deckForm,
                              title: event.target.value,
                            })
                      }
                    />
                  </label>
                  <label>
                    Description
                    <input
                      value={
                        deckEditorMode === "edit"
                          ? deckEditForm.description
                          : deckForm.description
                      }
                      onChange={(event) =>
                        deckEditorMode === "edit"
                          ? setDeckEditForm({
                              ...deckEditForm,
                              description: event.target.value,
                            })
                          : setDeckForm({
                              ...deckForm,
                              description: event.target.value,
                            })
                      }
                    />
                  </label>
                  <button type="submit">
                    {deckEditorMode === "edit" ? "Save Deck" : "Create Deck"}
                  </button>
                  {deckEditorMode === "edit" && (
                    <button
                      type="button"
                      className="danger-button"
                      onClick={deleteDeck}
                    >
                      Delete Deck
                    </button>
                  )}
                </form>
              </aside>
            </section>
          </>
        )}

        {activeView === "history" && (
          <section className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Deck</th>
                  <th>Question</th>
                  <th>Result</th>
                  <th>Viewed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {historyDetails.map((item) => (
                  <tr key={item.id}>
                    <td>{item.deck_title}</td>
                    <td>{item.question}</td>
                    <td>{item.is_correct ? "\u2713 Got it" : "\u2715 Missed"}</td>
                    <td>{formatDate(item.viewed_at)}</td>
                    <td>
                      <button onClick={() => removeHistory(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeView === "profile" && (
          <section className="profile-grid">
            <form onSubmit={saveProfile}>
              <h3>Account</h3>
              <label>
                Username
                <input value={user?.username || ""} disabled />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => setProfileForm({ email: event.target.value })}
                />
              </label>
              <button type="submit">Save Profile</button>
            </form>

            <form onSubmit={changePassword}>
              <h3>Password</h3>
              <label>
                Current password
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      current_password: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: event.target.value,
                    })
                  }
                />
              </label>
              <button type="submit">Change Password</button>
            </form>
          </section>
        )}

        {activeView === "admin" && user?.role === "admin" && (
          <section className="admin-grid">
            <div className="table-panel">
              <h3>Users</h3>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.email}</td>
                      <td>{item.role}</td>
                      <td>{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-panel">
              <h3>All Learning History</h3>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Deck</th>
                    <th>Question</th>
                    <th>Result</th>
                    <th>Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {allHistoryDetails.map((item) => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.deck_title}</td>
                      <td>{item.question}</td>
                      <td>{item.is_correct ? "\u2713 Got it" : "\u2715 Missed"}</td>
                      <td>{formatDate(item.viewed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle dark mode"
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </main>
  );
}

export default App;
