const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

export const api = {
  register: (user) =>
    request("/auth/register", {
      method: "POST",
      body: user,
    }),

  login: (username, password) => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    return request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
  },

  adminLogin: (username, password) => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    return request("/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
  },

  me: () => request("/auth/me"),
  updateMe: (user) =>
    request("/auth/me", {
      method: "PUT",
      body: user,
    }),
  updatePassword: (passwords) =>
    request("/auth/me/password", {
      method: "PUT",
      body: passwords,
    }),
  users: () => request("/auth/users"),

  getDecks: () => request("/decks/"),

  createDeck: (deck) =>
    request("/decks/", {
      method: "POST",
      body: deck,
    }),

  updateDeck: (id, deck) =>
    request(`/decks/${id}`, {
      method: "PUT",
      body: deck,
    }),

  deleteDeck: (id) =>
    request(`/decks/${id}`, {
      method: "DELETE",
    }),

  getFlashcards: ({ deckId, search } = {}) => {
    const params = new URLSearchParams();

    if (deckId && deckId !== "all") {
      params.set("deck_id", deckId);
    }

    if (search?.trim()) {
      params.set("search", search.trim());
    }

    const query = params.toString();
    return request(`/flashcards/${query ? `?${query}` : ""}`);
  },

  createFlashcard: (card) =>
    request("/flashcards/", {
      method: "POST",
      body: card,
    }),

  updateFlashcard: (id, card) =>
    request(`/flashcards/${id}`, {
      method: "PUT",
      body: card,
    }),

  deleteFlashcard: (id) =>
    request(`/flashcards/${id}`, {
      method: "DELETE",
    }),

  addHistory: (history) =>
    request("/history/", {
      method: "POST",
      body: history,
    }),

  myHistory: () => request("/history/me"),
  myHistoryDetails: () => request("/history/me/details"),
  summary: () => request("/history/summary"),
  allHistory: () => request("/history/all"),
  allHistoryDetails: () => request("/history/all/details"),
  deleteHistory: (id) =>
    request(`/history/${id}`, {
      method: "DELETE",
    }),
};
