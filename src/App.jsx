import { useEffect, useState } from "react";
import "./App.css";

const ADMIN_PASSWORD = "vic13chArd";

const STARTER_STORIES = [
  {
    id: "starter-1",
    title: "Welcome to StoryWorld",
    author: "StoryWorld",
    description: "Welcome to your personal story-reading library.",
    cover: "",
    paid: false,
    chapters: [
      {
        id: "ch-1",
        title: "Chapter 1",
        content:
          "Welcome to StoryWorld!\n\nAdd your own stories and chapters from the Admin page."
      }
    ]
  }
];

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export default function App() {
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem("storyworld-stories");
      return saved ? JSON.parse(saved) : STARTER_STORIES;
    } catch {
      return STARTER_STORIES;
    }
  });

  const [page, setPage] = useState("home");
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [login, setLogin] = useState("");

  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryAuthor, setNewStoryAuthor] = useState("");
  const [newStoryDescription, setNewStoryDescription] = useState("");
  const [newStoryPaid, setNewStoryPaid] = useState(false);

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "storyworld-stories",
      JSON.stringify(stories)
    );
  }, [stories]);

  const selectedStory = stories.find(
    (story) => story.id === selectedStoryId
  );

  const selectedChapter = selectedStory?.chapters.find(
    (chapter) => chapter.id === selectedChapterId
  );

  function openStory(id) {
    setSelectedStoryId(id);
    setSelectedChapterId(null);
    setPage("story");
  }

  function loginAdmin() {
    if (login === ADMIN_PASSWORD) {
      setAdmin(true);
      setLogin("");
      setPage("admin");
    } else {
      alert("Incorrect admin password.");
    }
  }

  function addStory() {
    if (!newStoryTitle.trim()) {
      alert("Enter a story title.");
      return;
    }

    const story = {
      id: makeId("story"),
      title: newStoryTitle.trim(),
      author: newStoryAuthor.trim() || "Unknown Author",
      description: newStoryDescription.trim(),
      cover: "",
      paid: newStoryPaid,
      chapters: []
    };

    setStories((previous) => [story, ...previous]);

    setNewStoryTitle("");
    setNewStoryAuthor("");
    setNewStoryDescription("");
    setNewStoryPaid(false);

    alert("Story added.");
  }

  function deleteStory(id) {
    if (!confirm("Delete this story and all its chapters?")) return;

    setStories((previous) =>
      previous.filter((story) => story.id !== id)
    );
  }

  function togglePaid(id) {
    setStories((previous) =>
      previous.map((story) =>
        story.id === id
          ? { ...story, paid: !story.paid }
          : story
      )
    );
  }

  function addChapter() {
    if (!selectedStoryId) return;

    if (!chapterTitle.trim() || !chapterContent.trim()) {
      alert("Enter a chapter title and content.");
      return;
    }

    const chapter = {
      id: makeId("chapter"),
      title: chapterTitle.trim(),
      content: chapterContent
    };

    setStories((previous) =>
      previous.map((story) =>
        story.id === selectedStoryId
          ? {
              ...story,
              chapters: [...story.chapters, chapter]
            }
          : story
      )
    );

    setChapterTitle("");
    setChapterContent("");

    alert("Chapter added.");
  }

  function deleteChapter(storyId, chapterId) {
    if (!confirm("Delete this chapter?")) return;

    setStories((previous) =>
      previous.map((story) =>
        story.id === storyId
          ? {
              ...story,
              chapters: story.chapters.filter(
                (chapter) => chapter.id !== chapterId
              )
            }
          : story
      )
    );
  }

  function importText(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setChapterContent(String(reader.result || ""));

      if (!chapterTitle) {
        setChapterTitle(
          file.name.replace(/\.[^.]+$/, "")
        );
      }

      alert(
        "Text file loaded. Check the content, then click Add Chapter."
      );
    };

    reader.readAsText(file);
  }

  function importImage(file, storyId) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setStories((previous) =>
        previous.map((story) =>
          story.id === storyId
            ? {
                ...story,
                cover: reader.result
              }
            : story
        )
      );
    };

    reader.readAsDataURL(file);
  }

  function backup() {
    const blob = new Blob(
      [JSON.stringify(stories, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "storyworld-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function restore(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!Array.isArray(data)) {
          throw new Error();
        }

        setStories(data);
        alert("Backup restored.");
      } catch {
        alert("That backup file is not valid.");
      }
    };

    reader.readAsText(file);
  }

  return (
    <div className="app">

      <header>
        <button
          className="brand"
          onClick={() => setPage("home")}
        >
          📚 StoryWorld
        </button>

        <nav>
          <button onClick={() => setPage("home")}>
            Home
          </button>

          {!admin && (
            <button onClick={() => setPage("login")}>
              Admin
            </button>
          )}

          {admin && (
            <button onClick={() => setPage("admin")}>
              Dashboard
            </button>
          )}

          {admin && (
            <button
              onClick={() => {
                setAdmin(false);
                setPage("home");
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      <main>

        {page === "home" && (
          <section>

            <div className="hero">
              <h1>Read. Discover. Create.</h1>
              <p>
                StoryWorld is your personal
                story-reading library.
              </p>
            </div>

            <div className="story-grid">

              {stories.map((story) => (
                <article
                  className="story-card"
                  key={story.id}
                >

                  {story.cover ? (
                    <img
                      src={story.cover}
                      alt=""
                    />
                  ) : (
                    <div className="cover-placeholder">
                      📖
                    </div>
                  )}

                  <div className="story-body">

                    <span
                      className={
                        story.paid
                          ? "badge paid"
                          : "badge free"
                      }
                    >
                      {story.paid
                        ? "PREMIUM"
                        : "FREE"}
                    </span>

                    <h2>{story.title}</h2>

                    <p className="author">
                      By {story.author}
                    </p>

                    <p>
                      {story.description}
                    </p>

                    <button
                      onClick={() =>
                        openStory(story.id)
                      }
                    >
                      Read Story
                    </button>

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}

        {page === "login" && (
          <section className="panel narrow">

            <h2>Admin Login</h2>

            <input
              type="password"
              value={login}
              onChange={(e) =>
                setLogin(e.target.value)
              }
              placeholder="Admin password"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                loginAdmin()
              }
            />

            <button onClick={loginAdmin}>
              Login
            </button>

            <p className="small-note">
              Change ADMIN_PASSWORD in App.jsx
              before sharing the app.
            </p>

          </section>
        )}

        {page === "story" && selectedStory && (
          <section>

            <button
              className="back"
              onClick={() => setPage("home")}
            >
              ← Back
            </button>

            <div className="story-header">

              {selectedStory.cover ? (
                <img
                  src={selectedStory.cover}
                  alt=""
                />
              ) : (
                <div className="large-cover">
                  📖
                </div>
              )}

              <div>

                <span
                  className={
                    selectedStory.paid
                      ? "badge paid"
                      : "badge free"
                  }
                >
                  {selectedStory.paid
                    ? "PREMIUM"
                    : "FREE"}
                </span>

                <h1>
                  {selectedStory.title}
                </h1>

                <p>
                  By {selectedStory.author}
                </p>

                <p>
                  {selectedStory.description}
                </p>

              </div>

            </div>

            {selectedStory.paid ? (

              <div className="locked">

                <h2>🔒 Premium Story</h2>

                <p>
                  This story is available to
                  StoryWorld subscribers.
                </p>

                <div className="subscription-card">

                  <h3>
                    Monthly Subscription
                  </h3>

                  <div className="price">
                    ₦1,500
                    <span> / month</span>
                  </div>

                  <p>
                    Unlock premium stories
                    and chapters.
                  </p>

                  <button
                    onClick={() =>
                      setPage("subscription")
                    }
                  >
                    Subscribe
                  </button>

                </div>

              </div>

            ) : (

              <div className="chapter-list">

                <h2>Chapters</h2>

                {selectedStory.chapters.length === 0 && (
                  <p>No chapters yet.</p>
                )}

                {selectedStory.chapters.map(
                  (chapter) => (
                    <button
                      className="chapter-row"
                      key={chapter.id}
                      onClick={() => {
                        setSelectedChapterId(
                          chapter.id
                        );
                        setPage("chapter");
                      }}
                    >
                      {chapter.title} →
                    </button>
                  )
                )}

              </div>

            )}

          </section>
        )}

        {page === "chapter" && selectedChapter && (
          <section className="panel reading">

            <button
              className="back"
              onClick={() => setPage("story")}
            >
              ← Back to story
            </button>

            <h1>
              {selectedChapter.title}
            </h1>

            <div className="chapter-content">
              {selectedChapter.content}
            </div>

          </section>
        )}

        {page === "subscription" && (
          <section className="panel narrow center">

            <button
              className="back"
              onClick={() => setPage("home")}
            >
              ← Back
            </button>

            <h2>
              📚 StoryWorld Subscription
            </h2>

            <div className="subscription-card">

              <h3>Monthly Plan</h3>

              <div className="price">
                ₦1,500
                <span> / month</span>
              </div>

              <ul>
                <li>
                  🔓 Access premium stories
                </li>
                <li>
                  📖 Read premium chapters
                </li>
                <li>
                  📚 Access new premium content
                </li>
              </ul>

              <button
                onClick={() =>
                  alert(
                    "Online payment will be connected later."
                  )
                }
              >
                Continue to Payment
              </button>

              <p className="small-note">
                Secure payment verification
                will be added when the online
                version is connected.
              </p>

            </div>

          </section>
        )}

        {page === "admin" && admin && (
          <section>

            <h1>Admin Dashboard</h1>

            <div className="panel">

              <h2>Add New Story</h2>

              <input
                value={newStoryTitle}
                onChange={(e) =>
                  setNewStoryTitle(e.target.value)
                }
                placeholder="Story title"
              />

              <input
                value={newStoryAuthor}
                onChange={(e) =>
                  setNewStoryAuthor(e.target.value)
                }
                placeholder="Author name"
              />

              <textarea
                value={newStoryDescription}
                onChange={(e) =>
                  setNewStoryDescription(
                    e.target.value
                  )
                }
                placeholder="Short description"
              />

              <label className="check">

                <input
                  type="checkbox"
                  checked={newStoryPaid}
                  onChange={(e) =>
                    setNewStoryPaid(
                      e.target.checked
                    )
                  }
                />

                Premium story

              </label>

              <button onClick={addStory}>
                Add Story
              </button>

            </div>

            <div className="panel">

              <h2>Your Stories</h2>

              {stories.map((story) => (

                <div
                  className="admin-story"
                  key={story.id}
                >

                  <div>
                    <strong>
                      {story.title}
                    </strong>

                    <span>
                      {" "}
                      — {story.chapters.length}
                      {" "}chapter(s) —{" "}
                      {story.paid
                        ? "Premium"
                        : "Free"}
                    </span>
                  </div>

                  <div className="button-row">

                    <label className="file-button">

                      Cover

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          importImage(
                            e.target.files[0],
                            story.id
                          )
                        }
                      />

                    </label>

                    <button
                      onClick={() =>
                        togglePaid(story.id)
                      }
                    >
                      {story.paid
                        ? "Make Free"
                        : "Make Premium"}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedStoryId(
                          story.id
                        );
                        setPage("chapters");
                      }}
                    >
                      Chapters
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteStory(story.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="panel">

              <h2>Backup</h2>

              <p>
                Download your stories as a
                backup before changing
                computers or clearing browser
                data.
              </p>

              <div className="button-row">

                <button onClick={backup}>
                  Download Backup
                </button>

                <label className="file-button">

                  Restore Backup

                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) =>
                      restore(e.target.files[0])
                    }
                  />

                </label>

              </div>

            </div>

          </section>
        )}

        {page === "chapters" &&
          admin &&
          selectedStory && (

          <section>

            <button
              className="back"
              onClick={() => setPage("admin")}
            >
              ← Dashboard
            </button>

            <h1>
              Chapters: {selectedStory.title}
            </h1>

            <div className="panel">

              <input
                value={chapterTitle}
                onChange={(e) =>
                  setChapterTitle(e.target.value)
                }
                placeholder="Chapter title"
              />

              <textarea
                className="chapter-input"
                value={chapterContent}
                onChange={(e) =>
                  setChapterContent(
                    e.target.value
                  )
                }
                placeholder="Write or paste chapter text here..."
              />

              <div className="button-row">

                <button onClick={addChapter}>
                  Add Chapter
                </button>

                <label className="file-button">

                  Load .txt

                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={(e) =>
                      importText(
                        e.target.files[0]
                      )
                    }
                  />

                </label>

              </div>

            </div>

            <div className="panel">

              {selectedStory.chapters.map(
                (chapter, index) => (

                  <div
                    className="admin-story"
                    key={chapter.id}
                  >

                    <strong>
                      {index + 1}.{" "}
                      {chapter.title}
                    </strong>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteChapter(
                          selectedStory.id,
                          chapter.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                )
              )}

            </div>

          </section>

        )}

      </main>

      <footer>
        StoryWorld • Your personal story library
      </footer>

    </div>
  );
}
