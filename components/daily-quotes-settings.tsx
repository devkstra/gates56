"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Lightbulb, Plus, Trash2, Send } from "lucide-react"

const defaultQuotes = [
  "Discipline is choosing between what you want now and what you want most.",
  "The gym is a journey, not a destination.",
  "Your body can stand almost anything. It's your mind that you need to convince.",
  "Sweat is just your fat cells crying.",
  "Success is not a destination, it's a journey of consistency.",
]

export default function DailyQuotesSettings() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [quotes, setQuotes] = useState<string[]>(defaultQuotes)
  const [newQuote, setNewQuote] = useState("")
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const addQuote = () => {
    if (newQuote.trim()) {
      setQuotes([...quotes, newQuote])
      setNewQuote("")
      toast.success("Quote added successfully!")
    }
  }

  const removeQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index))
    toast.success("Quote removed")
  }

  const triggerDailyBroadcast = () => {
    setIsBroadcasting(true)

    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      console.log(`[Cron Job Simulation] Sending daily broadcast: "${randomQuote}"`)
      toast.success(`Daily broadcast sent! Quote: "${randomQuote.substring(0, 50)}..."`)
      setIsBroadcasting(false)
    }, 2000)
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Daily Motivation Automation</h2>
      </div>

      <div className="space-y-6">
        {/* Toggle Setting */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div>
            <p className="font-semibold">Enable Daily Auto-Quotes</p>
            <p className="text-sm text-muted-foreground text-opacity-80 mt-1">Send motivational quotes to all members daily</p>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isEnabled ? "bg-success" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Add Quote Input */}
        {isEnabled && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2">Add Custom Quote</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addQuote()}
                  placeholder="Enter a motivational quote..."
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={addQuote}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-white">Add</span>
                </button>
              </div>
            </div>

            {/* Quotes List */}
            <div>
              <p className="text-sm font-semibold mb-3">Quote Pool ({quotes.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {quotes.map((quote, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 p-3 bg-background rounded-lg border border-border"
                  >
                    <p className="text-sm flex-1">"{quote}"</p>
                    <button
                      onClick={() => removeQuote(index)}
                      className="text-danger hover:bg-danger hover:bg-opacity-20 p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trigger Broadcast */}
            <button
              onClick={triggerDailyBroadcast}
              disabled={isBroadcasting || quotes.length === 0}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isBroadcasting ? "Broadcasting..." : "Trigger Daily Broadcast"}
            </button>

            <div className="p-3 bg-background rounded-lg text-xs text-muted-foreground text-opacity-80 border border-border">
              <p className="font-semibold mb-1">Schedule Info:</p>
              <p>• Broadcasts run daily at 7:00 AM</p>
              <p>• Random quote from the pool is selected</p>
              <p>• Sent to all active members via WhatsApp</p>
            </div>
          </>
        )}

        {!isEnabled && (
          <div className="text-center py-6 text-muted-foreground text-opacity-80">
            <p>Daily auto-quotes are currently disabled</p>
          </div>
        )}
      </div>
    </div>
  )
}
