import jsPDF from "jspdf"
import { useState } from "react"
import "./App.css"

function App() {
  const [notes, setNotes] = useState("")
  const [summary, setSummary] = useState("")
  const [quiz, setQuiz] = useState("")
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(false)

  const downloadPDF = () => {
    const doc = new jsPDF()
    let content = ""

    if (summary) {
      content += "SUMMARY\n\n"
      content += summary + "\n\n"
    }

    if (quiz) {
      content += "QUIZ\n\n"
      content += quiz
    }

    doc.text(content, 10, 10)
    doc.save("study-material.pdf")
  }

  const generateSummary = async () => {
    setLoading(true)
    const response = await fetch("https://ai-study-assistant-backend-9len.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes, type: "summary" })
    })
    const data = await response.json()
    setSummary(data.result)
    setLoading(false)
  }

  const generateQuiz = async () => {
    setLoading(true)
    const response = await fetch("https://ai-study-assistant-backend-9len.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes, type: "quiz" })
    })
    const data = await response.json()
    setQuiz(data.result)
    setLoading(false)
  }

  const generateFlashcards = async () => {
    setLoading(true)
    const response = await fetch("https://ai-study-assistant-backend-9len.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes, type: "flashcards" })
    })
    const data = await response.json()
    const text = data.result
    const lines = text.split("\n").filter(l => l.trim())
    let cards = []
    let current = null
    lines.forEach(line => {
      if (line.toLowerCase().startsWith("q:")) {
        if (current) cards.push(current)
        current = { q: line.replace(/^q:/i, "").trim(), a: "", flipped: false }
      } else if (line.toLowerCase().startsWith("a:") && current) {
        current.a = line.replace(/^a:/i, "").trim()
      }
    })
    if (current) cards.push(current)
    setFlashcards(cards)
    setLoading(false)
  }

  const flipCard = (index) => {
    setFlashcards(flashcards.map((card, i) =>
      i === index ? { ...card, flipped: !card.flipped } : card
    ))
  }

  return (
    <div className="app">
      <h1>📚 AI Study Assistant</h1>
      <p className="subtitle">Paste your notes and let AI do the magic!</p>

      <textarea
        rows="8"
        placeholder="Paste your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="buttons">
        <button onClick={generateSummary}>
          {loading ? "Generating..." : "📝 Generate Summary"}
        </button>

        <button onClick={generateQuiz}>
          {loading ? "Generating..." : "🧠 Generate Quiz"}
        </button>

        <button onClick={generateFlashcards}>
          {loading ? "Generating..." : "🃏 Flashcards"}
        </button>

        {(summary || quiz || flashcards.length > 0) && (
          <button onClick={downloadPDF}>
            📄 Download PDF
          </button>
        )}
      </div>

      {summary && (
        <div className="result-box">
          <h2>📝 Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {quiz && (
        <div className="result-box">
          <h2>🧠 Quiz</h2>
          <p>{quiz}</p>
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="result-box">
          <h2>🃏 Flashcards</h2>
          {flashcards.map((card, i) => (
            <div key={i} className="flashcard" onClick={() => flipCard(i)}>
              <p className="question">{card.q}</p>
              {card.flipped && <p className="answer">{card.a}</p>}
              <span className="hint">{card.flipped ? "click to hide" : "click to reveal"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
